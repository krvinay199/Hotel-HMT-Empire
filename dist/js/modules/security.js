import { Config }  from '../constants/config.js';
import { Strings } from '../constants/strings.js';
const SEC = Config.SECURITY;
export function isBotDetected(honeypotId) {
const field = document.getElementById(honeypotId);
return field ? field.value.trim().length > 0 : false;
}
export function sanitize(str) {
if (typeof str !== 'string') return '';
const s = str.trim().slice(0, SEC.MAX_INPUT_LENGTH);
if (window.DOMPurify) return window.DOMPurify.sanitize(s, { ALLOWED_TAGS: [] });
return s.replace(/<[^>]*>/g, '');
}
export function validateName(value) {
const v = sanitize(value);
if (!v) return { valid: false, message: Strings.ERR_REQUIRED };
if (v.length < 2) return { valid: false, message: Strings.ERR_NAME_SHORT };
if (v.length > SEC.MAX_NAME_LENGTH) return { valid: false, message: `Max ${SEC.MAX_NAME_LENGTH} characters.` };
if (/<|>|{|}|\\/.test(v)) return { valid: false, message: Strings.ERR_SUSPICIOUS };
return { valid: true, message: '' };
}
export function validatePhone(value) {
const v = value.trim().replace(/\D/g, '');
if (!v) return { valid: false, message: Strings.ERR_REQUIRED };
if (!SEC.ALLOWED_PHONE_REGEX.test(v)) return { valid: false, message: Strings.ERR_PHONE_INVALID };
return { valid: true, message: '' };
}
export function validateEmail(value, required = false) {
const v = sanitize(value);
if (!v && required) return { valid: false, message: Strings.ERR_REQUIRED };
if (!v && !required) return { valid: true, message: '' };
if (!SEC.ALLOWED_EMAIL_REGEX.test(v)) return { valid: false, message: Strings.ERR_EMAIL_INVALID };
return { valid: true, message: '' };
}
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
export function validateDateRange(checkin, checkout) {
const ci = new Date(checkin);
const co = new Date(checkout);
if (isNaN(ci.getTime()) || isNaN(co.getTime())) return { valid: false, message: Strings.ERR_REQUIRED };
if (co <= ci) return { valid: false, message: Strings.ERR_DATE_ORDER };
return { valid: true, message: '' };
}
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
export function checkRFQRateLimit() {
const key   = SEC.RFQ_RATE_LIMIT_KEY;
const count = parseInt(localStorage.getItem(key) || '0', 10);
if (count >= SEC.MAX_RFQ_PER_SESSION) return false;
localStorage.setItem(key, String(count + 1));
return true;
}
export function generateBookingId(prefix = 'HMT') {
const today = new Date();
const date  = today.toISOString().slice(0, 10).replace(/-/g, '');
const rand  = Math.random().toString(36).slice(2, 7).toUpperCase();
return `${prefix}-${date}-${rand}`;
}