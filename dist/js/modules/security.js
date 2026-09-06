/**
 * security.js — Hotel HMT Empire
 * Input sanitization, bot-trap, rate limiting, and form validation helpers.
 * Used by booking.js and rfq.js.
 */

import { Config }  from '../constants/config.js';
import { Strings } from '../constants/strings.js';

const SEC = Config.SECURITY;

/**
 * Check if a form has a filled honeypot field (bot detection).
 * @param {string} honeypotId - ID of the hidden honeypot input
 * @returns {boolean} true if bot detected
 */
export function isBotDetected(honeypotId) {
  const field = document.getElementById(honeypotId);
  return field ? field.value.trim().length > 0 : false;
}

/**
 * Sanitize a string using DOMPurify (loaded as CDN global).
 * Falls back to basic escaping if DOMPurify is not available.
 */
export function sanitize(str) {
  if (typeof str !== 'string') return '';
  const s = str.trim().slice(0, SEC.MAX_INPUT_LENGTH);
  if (window.DOMPurify) return window.DOMPurify.sanitize(s, { ALLOWED_TAGS: [] });
  // Fallback: strip HTML tags
  return s.replace(/<[^>]*>/g, '');
}

/**
 * Validate a name field.
 * @returns {{ valid: boolean, message: string }}
 */
export function validateName(value) {
  const v = sanitize(value);
  if (!v) return { valid: false, message: Strings.ERR_REQUIRED };
  if (v.length < 2) return { valid: false, message: Strings.ERR_NAME_SHORT };
  if (v.length > SEC.MAX_NAME_LENGTH) return { valid: false, message: `Max ${SEC.MAX_NAME_LENGTH} characters.` };
  // Check for suspicious patterns (script injection)
  if (/<|>|{|}|\\/.test(v)) return { valid: false, message: Strings.ERR_SUSPICIOUS };
  return { valid: true, message: '' };
}

/**
 * Validate an Indian mobile phone number.
 */
export function validatePhone(value) {
  const v = value.trim().replace(/\D/g, '');
  if (!v) return { valid: false, message: Strings.ERR_REQUIRED };
  if (!SEC.ALLOWED_PHONE_REGEX.test(v)) return { valid: false, message: Strings.ERR_PHONE_INVALID };
  return { valid: true, message: '' };
}

/**
 * Validate an email address.
 */
export function validateEmail(value, required = false) {
  const v = sanitize(value);
  if (!v && required) return { valid: false, message: Strings.ERR_REQUIRED };
  if (!v && !required) return { valid: true, message: '' };
  if (!SEC.ALLOWED_EMAIL_REGEX.test(v)) return { valid: false, message: Strings.ERR_EMAIL_INVALID };
  return { valid: true, message: '' };
}

/**
 * Validate a date string.
 * @param {string} value - date input value (YYYY-MM-DD)
 * @param {boolean} allowPast - if false, past dates are rejected
 */
export function validateDate(value, allowPast = false) {
  if (!value) return { valid: false, message: Strings.ERR_REQUIRED };
  const d = new Date(value);
  if (isNaN(d.getTime())) return { valid: false, message: 'Invalid date.' };
  if (!allowPast) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (d < today) return { valid: false, message: Strings.ERR_DATE_PAST };
  }
  return { valid: true, message: '' };
}

/**
 * Validate that checkout is after checkin.
 */
export function validateDateRange(checkin, checkout) {
  const ci = new Date(checkin);
  const co = new Date(checkout);
  if (isNaN(ci.getTime()) || isNaN(co.getTime())) return { valid: false, message: Strings.ERR_REQUIRED };
  if (co <= ci) return { valid: false, message: Strings.ERR_DATE_ORDER };
  return { valid: true, message: '' };
}

/**
 * Set or clear a field error.
 * @param {string} fieldId - ID of the input element
 * @param {string} errorId - ID of the error span
 * @param {string} message - empty string to clear error
 */
export function setFieldError(fieldId, errorId, message) {
  const field     = document.getElementById(fieldId);
  const errorEl   = document.getElementById(errorId);
  const fieldWrap = field?.closest('.form-field');

  if (message) {
    fieldWrap?.classList.add('form-field--error');
    if (errorEl) errorEl.textContent = message;
  } else {
    fieldWrap?.classList.remove('form-field--error');
    if (errorEl) errorEl.textContent = '';
  }
}

/**
 * RFQ rate limiting: track how many times user has submitted.
 * Returns false if limit exceeded.
 */
export function checkRFQRateLimit() {
  const key   = SEC.RFQ_RATE_LIMIT_KEY;
  const count = parseInt(localStorage.getItem(key) || '0', 10);
  if (count >= SEC.MAX_RFQ_PER_SESSION) return false;
  localStorage.setItem(key, String(count + 1));
  return true;
}

/**
 * Generate a unique booking reference ID.
 * Format: HMT-YYYYMMDD-XXXXX
 */
export function generateBookingId(prefix = 'HMT') {
  const today = new Date();
  const date  = today.toISOString().slice(0, 10).replace(/-/g, '');
  const rand  = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}-${date}-${rand}`;
}
