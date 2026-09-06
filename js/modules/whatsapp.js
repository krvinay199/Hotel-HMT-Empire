/**
 * whatsapp.js — Hotel HMT Empire
 * Floating WhatsApp button and toast notification system.
 */

import { Config }  from '../constants/config.js';
import { Strings } from '../constants/strings.js';

let toastTimer = null;

/** Initialize the floating WhatsApp FAB */
export function initWhatsApp() {
  const fabBtn = document.getElementById('whatsapp-fab-btn');
  if (!fabBtn || !Config.HOTEL.WHATSAPP) return;

  const msg = encodeURIComponent(Strings.WA_MSG_GENERAL);
  fabBtn.href = `https://wa.me/${Config.HOTEL.WHATSAPP}?text=${msg}`;

  // Update aria-label
  fabBtn.setAttribute('aria-label', Strings.WA_FAB_LABEL);
}

/**
 * Build a WhatsApp URL for a specific intent.
 * @param {'general' | 'booking' | 'room-service' | 'event' | 'taxi'} intent
 * @param {string} [extra] - optional extra info appended to the message
 */
export function getWhatsAppUrl(intent = 'general', extra = '') {
  const messages = {
    general:      Strings.WA_MSG_GENERAL,
    booking:      Strings.WA_MSG_BOOKING,
    'room-service': Strings.WA_MSG_ROOM_SERVICE,
    event:        Strings.WA_MSG_EVENT,
    taxi:         Strings.WA_MSG_TAXI,
  };

  const base = messages[intent] || Strings.WA_MSG_GENERAL;
  const full = extra ? `${base}\n${extra}` : base;
  return `https://wa.me/${Config.HOTEL.WHATSAPP}?text=${encodeURIComponent(full)}`;
}

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'success' | 'error' | 'info'} [type='info']
 * @param {number} [duration=3500] - ms before auto-dismiss
 */
export function showToast(message, type = 'info', duration = 3500) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  // Clear existing toast
  clearTimeout(toastTimer);
  toast.className = '';
  toast.textContent = '';

  // Set content and type
  toast.textContent = message;
  toast.classList.add('is-visible', `toast--${type}`);

  // Auto-dismiss
  toastTimer = setTimeout(() => {
    toast.classList.remove('is-visible');
  }, duration);
}

/** Hide the toast immediately */
export function hideToast() {
  const toast = document.getElementById('toast');
  toast?.classList.remove('is-visible');
  clearTimeout(toastTimer);
}
