import { Config }  from '../constants/config.js';
import { Strings } from '../constants/strings.js';
let toastTimer = null;
export function initWhatsApp() {
const fabBtn = document.getElementById('whatsapp-fab-btn');
if (!fabBtn || !Config.HOTEL.WHATSAPP) return;
const msg = encodeURIComponent(Strings.WA_MSG_GENERAL);
fabBtn.href = `https://wa.me/${Config.HOTEL.WHATSAPP}?text=${msg}`;
fabBtn.setAttribute('aria-label', Strings.WA_FAB_LABEL);
}
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
export function showToast(message, type = 'info', duration = 3500) {
const toast = document.getElementById('toast');
if (!toast) return;
clearTimeout(toastTimer);
toast.className = '';
toast.textContent = '';
toast.textContent = message;
toast.classList.add('is-visible', `toast--${type}`);
toastTimer = setTimeout(() => {
toast.classList.remove('is-visible');
}, duration);
}
export function hideToast() {
const toast = document.getElementById('toast');
toast?.classList.remove('is-visible');
clearTimeout(toastTimer);
}