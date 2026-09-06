import { db }          from '../firebase-config.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Config }      from '../constants/config.js';
import { Strings }     from '../constants/strings.js';
import { RoomTypes }   from '../constants/amenities.js';
import {
isBotDetected, sanitize, validateName,
validatePhone, validateEmail, validateDate,
validateDateRange, setFieldError, generateBookingId,
} from './security.js';
import { showToast }   from './whatsapp.js';
import { stopScroll, startScroll } from './lenis-scroll.js';
let currentRoom = null;
let configData  = null;
export async function openBookingModal(room = null) {
currentRoom = room;
const modal    = document.getElementById('booking-modal');
const formState = document.getElementById('booking-form-state');
const successState = document.getElementById('booking-success-state');
if (!modal) return;
formState && (formState.hidden = false);
successState && (successState.hidden = true);
if (!configData) {
try {
const res = await fetch('./js/constants/config.json');
configData = await res.json();
} catch {
configData = {
GUEST_OPTIONS: [
{ value: '1', label: '1 Guest' },
{ value: '2', label: '2 Guests' },
{ value: '3', label: '3 Guests' },
{ value: '4', label: '4 Guests' }
],
ROOM_TYPE_OPTIONS: [
{ value: 'standard', label: 'Standard Room' },
{ value: 'deluxe', label: 'Deluxe Room' },
{ value: 'executive', label: 'Executive Suite' },
{ value: 'premium', label: 'Premium Suite' }
]
};
}
}
populateGuestsDropdown();
populateRoomTypeDropdown();
if (room) {
const roomNameEl  = document.getElementById('booking-room-name');
const roomPriceEl = document.getElementById('booking-room-price');
const roomTypeEl  = document.getElementById('booking-room-type');
if (roomNameEl)  roomNameEl.textContent = room.name;
if (roomPriceEl) roomPriceEl.textContent = `₹${room.price?.toLocaleString('en-IN')} per night`;
if (roomTypeEl) {
roomTypeEl.value = room.type || '';
roomTypeEl.dispatchEvent(new Event('change'));
}
} else {
const guestsEl = document.getElementById('booking-guests');
const roomTypeEl = document.getElementById('booking-room-type');
if (guestsEl) {
guestsEl.value = '2';
guestsEl.dispatchEvent(new Event('change'));
}
if (roomTypeEl) {
roomTypeEl.value = '';
roomTypeEl.dispatchEvent(new Event('change'));
}
}
const today = new Date().toISOString().split('T')[0];
const ci    = document.getElementById('booking-checkin');
const co    = document.getElementById('booking-checkout');
if (ci) ci.min = today;
if (co) co.min = today;
modal.classList.add('is-open');
modal.setAttribute('aria-hidden', 'false');
stopScroll();
document.getElementById('navbar')?.classList.add('is-hidden');
setTimeout(() => document.getElementById('booking-name')?.focus(), 100);
}
export function closeBookingModal() {
const modal = document.getElementById('booking-modal');
modal?.classList.remove('is-open');
modal?.setAttribute('aria-hidden', 'true');
startScroll();
document.getElementById('navbar')?.classList.remove('is-hidden');
document.getElementById('booking-form')?.reset();
clearAllErrors();
currentRoom = null;
}
function populateGuestsDropdown() {
const sel = document.getElementById('booking-guests');
if (!sel || sel.dataset.populated === 'true') return;
const customList = document.getElementById('custom-guests-options');
if (customList) customList.innerHTML = '';
sel.innerHTML = '';
const options = configData?.GUEST_OPTIONS || [];
options.forEach(({ value, label }) => {
const opt = document.createElement('option');
opt.value = value;
opt.textContent = label;
if (value === '2') opt.selected = true;
sel.appendChild(opt);
if (customList) {
const li = document.createElement('li');
li.className = `custom-select__option${value === '2' ? ' is-selected' : ''}`;
li.setAttribute('data-value', value);
li.setAttribute('role', 'option');
li.innerHTML = `${sanitize(label)} <span class="custom-select__check">✓</span>`;
customList.appendChild(li);
}
});
sel.dataset.populated = 'true';
setupCustomSelect('custom-guests-select', 'booking-guests');
}
function populateRoomTypeDropdown() {
const sel = document.getElementById('booking-room-type');
if (!sel || sel.dataset.populated === 'true') return;
const customList = document.getElementById('custom-room-type-options');
if (customList) customList.innerHTML = '';
sel.innerHTML = '';
const defOpt = document.createElement('option');
defOpt.value = '';
defOpt.disabled = true;
defOpt.selected = true;
defOpt.textContent = 'Select Room Type…';
sel.appendChild(defOpt);
const options = configData?.ROOM_TYPE_OPTIONS || [];
options.forEach(({ value, label }) => {
const opt   = document.createElement('option');
opt.value   = value;
opt.textContent = label;
sel.appendChild(opt);
if (customList) {
const li = document.createElement('li');
li.className = 'custom-select__option';
li.setAttribute('data-value', value);
li.setAttribute('role', 'option');
li.innerHTML = `${sanitize(label)} <span class="custom-select__check">✓</span>`;
customList.appendChild(li);
}
});
sel.dataset.populated = 'true';
setupCustomSelect('custom-room-type-select', 'booking-room-type');
}
async function handleSubmit(e) {
e.preventDefault();
if (isBotDetected('booking-honeypot')) {
return;
}
const name     = document.getElementById('booking-name')?.value      || '';
const phone    = document.getElementById('booking-phone')?.value     || '';
const email    = document.getElementById('booking-email')?.value     || '';
const checkin  = document.getElementById('booking-checkin')?.value   || '';
const checkout = document.getElementById('booking-checkout')?.value  || '';
const guests   = document.getElementById('booking-guests')?.value    || '2';
const roomType = document.getElementById('booking-room-type')?.value || '';
const notes    = document.getElementById('booking-notes')?.value     || '';
let hasErrors = false;
const nameResult = validateName(name);
setFieldError('booking-name', 'booking-name-error', nameResult.message);
if (!nameResult.valid) hasErrors = true;
const phoneResult = validatePhone(phone);
setFieldError('booking-phone', 'booking-phone-error', phoneResult.message);
if (!phoneResult.valid) hasErrors = true;
const emailResult = validateEmail(email, false);
setFieldError('booking-email', 'booking-email-error', emailResult.message);
if (!emailResult.valid) hasErrors = true;
const ciResult = validateDate(checkin);
setFieldError('booking-checkin', 'booking-checkin-error', ciResult.message);
if (!ciResult.valid) hasErrors = true;
const coResult = validateDate(checkout);
setFieldError('booking-checkout', 'booking-checkout-error', coResult.message);
if (!coResult.valid) hasErrors = true;
if (ciResult.valid && coResult.valid) {
const rangeResult = validateDateRange(checkin, checkout);
setFieldError('booking-checkout', 'booking-checkout-error', rangeResult.message);
if (!rangeResult.valid) hasErrors = true;
}
if (hasErrors) return;
const bookingId = generateBookingId(Config.BOOKING.BOOKING_ID_PREFIX);
const submitBtn = document.getElementById('booking-submit-btn');
if (submitBtn) {
submitBtn.disabled = true;
submitBtn.textContent = Strings.BOOKING_SUBMITTING;
}
try {
const bookingData = {
bookingId,
guestName:   sanitize(name),
guestPhone:  sanitize(phone),
guestEmail:  sanitize(email),
checkIn:     checkin,
checkOut:    checkout,
guests:      parseInt(guests, 10),
roomType:    sanitize(roomType),
roomName:    sanitize(currentRoom?.name || roomType),
pricePerNight: currentRoom?.price || null,
notes:       sanitize(notes).slice(0, 500),
status:      'pending',
source:      'website',
createdAt:   serverTimestamp(),
};
await addDoc(collection(db, Config.COLLECTIONS.BOOKINGS), bookingData);
if (Config.FEATURES.ENABLE_EMAILJS && window.emailjs) {
await window.emailjs.send(
Config.EMAILJS.SERVICE_ID,
Config.EMAILJS.TEMPLATE_BOOKING,
{
booking_id:    bookingId,
guest_name:    sanitize(name),
guest_email:   sanitize(email),
guest_phone:   sanitize(phone),
room_name:     sanitize(currentRoom?.name || roomType),
check_in:      checkin,
check_out:     checkout,
guests:        guests,
hotel_phone:   Config.HOTEL.PHONE,
},
Config.EMAILJS.PUBLIC_KEY
);
}
const waMsg = encodeURIComponent(
`🏨 NEW BOOKING\nID: ${bookingId}\nGuest: ${sanitize(name)}\nPhone: ${sanitize(phone)}\nRoom: ${sanitize(currentRoom?.name || roomType)}\nCheck-in: ${checkin}\nCheck-out: ${checkout}\nGuests: ${guests}`
);
const waUrl = `https://wa.me/${Config.HOTEL.WHATSAPP}?text=${waMsg}`;
window.open(waUrl, '_blank', 'noopener,noreferrer');
const confirmEl = document.getElementById('booking-confirmation-id');
if (confirmEl) confirmEl.textContent = bookingId;
document.getElementById('booking-form-state').hidden = true;
document.getElementById('booking-success-state').hidden = false;
} catch {
showToast(Strings.BOOKING_ERROR, 'error');
if (submitBtn) {
submitBtn.disabled = false;
submitBtn.textContent = Strings.BOOKING_SUBMIT;
}
}
}
function clearAllErrors() {
document.querySelectorAll('.form-field--error').forEach(el => {
el.classList.remove('form-field--error');
el.querySelector('.form-error') && (el.querySelector('.form-error').textContent = '');
});
}
export function initBooking() {
document.getElementById('booking-modal-close')?.addEventListener('click', closeBookingModal);
document.getElementById('booking-done-btn')?.addEventListener('click', closeBookingModal);
document.getElementById('booking-modal')?.addEventListener('click', (e) => {
if (e.target === document.getElementById('booking-modal')) closeBookingModal();
});
document.addEventListener('keydown', (e) => {
if (e.key === 'Escape' && document.getElementById('booking-modal')?.classList.contains('is-open')) {
closeBookingModal();
}
});
document.getElementById('booking-form')?.addEventListener('submit', handleSubmit);
}
function setupCustomSelect(customContainerId, hiddenSelectId) {
const container = document.getElementById(customContainerId);
const hiddenSelect = document.getElementById(hiddenSelectId);
if (!container || !hiddenSelect) return;
const trigger = container.querySelector('.custom-select__trigger');
const triggerText = container.querySelector('.custom-select__selected-text');
if (!trigger || !triggerText) return;
trigger.onclick = (e) => {
e.stopPropagation();
const isOpen = container.classList.contains('is-open');
document.querySelectorAll('.custom-select').forEach(sel => {
sel.classList.remove('is-open');
});
if (!isOpen) {
container.classList.add('is-open');
}
};
const options = container.querySelectorAll('.custom-select__option');
options.forEach(opt => {
opt.onclick = (e) => {
e.stopPropagation();
const val = opt.getAttribute('data-value');
hiddenSelect.value = val;
hiddenSelect.dispatchEvent(new Event('change'));
container.classList.remove('is-open');
};
});
hiddenSelect.onchange = () => {
const activeVal = hiddenSelect.value;
const currentOpts = container.querySelectorAll('.custom-select__option');
const selectedOpt = Array.from(currentOpts).find(o => o.getAttribute('data-value') === activeVal);
if (selectedOpt) {
triggerText.textContent = selectedOpt.textContent.replace('✓', '').trim();
currentOpts.forEach(o => o.classList.remove('is-selected'));
selectedOpt.classList.add('is-selected');
} else {
const defaultText = customContainerId === 'custom-room-type-select' ? 'Select Room Type…' : 'Select guests…';
triggerText.textContent = defaultText;
currentOpts.forEach(o => o.classList.remove('is-selected'));
}
};
document.addEventListener('click', () => {
container.classList.remove('is-open');
});
}