import { db }           from '../firebase-config.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Config }       from '../constants/config.js';
import { Strings }      from '../constants/strings.js';
import { EventTypes }   from '../constants/amenities.js';
import {
isBotDetected, sanitize, validateName, validatePhone, validateEmail,
setFieldError, checkRFQRateLimit, generateBookingId,
} from './security.js';
import { showToast }    from './whatsapp.js';
import { getWhatsAppUrl } from './whatsapp.js';
import { scrollTo }     from './lenis-scroll.js';
const TOTAL_STEPS = 5;
let currentStep   = 1;
let rfqData       = {};
export function initRFQ() {
renderProgressDots();
renderSteps();
initNavButtons();
}
function renderProgressDots() {
const container = document.getElementById('rfq-progress');
if (!container) return;
for (let i = 1; i <= TOTAL_STEPS; i++) {
const dot = document.createElement('div');
dot.className = `rfq__step-dot${i === 1 ? ' is-active' : ''}`;
dot.id        = `rfq-dot-${i}`;
dot.textContent = i;
dot.setAttribute('aria-label', `Step ${i}`);
container.appendChild(dot);
if (i < TOTAL_STEPS) {
const connector = document.createElement('div');
connector.className = 'rfq__step-connector';
connector.id        = `rfq-connector-${i}`;
container.appendChild(connector);
}
}
}
function renderSteps() {
const container = document.getElementById('rfq-steps-container');
if (!container) return;
container.appendChild(buildStep1());
container.appendChild(buildStep2());
container.appendChild(buildStep3());
container.appendChild(buildStep4());
container.appendChild(buildStep5());
showStep(1);
}
function buildStep1() {
const div   = document.createElement('div');
div.className = 'rfq__step';
div.id        = 'rfq-step-1';
div.innerHTML = `
<div class="rfq__step-title">What type of event are you planning?</div>
<div class="rfq__event-types" id="rfq-event-types" role="radiogroup" aria-label="Event type selection"></div>
`;
const grid = div.querySelector('#rfq-event-types');
EventTypes.forEach(({ id, label, icon }) => {
const btn = document.createElement('button');
btn.type       = 'button';
btn.className  = 'rfq__event-btn';
btn.setAttribute('role', 'radio');
btn.setAttribute('aria-checked', 'false');
btn.dataset.value = id;
btn.innerHTML  = `<span class="rfq__event-icon">${icon}</span><span class="rfq__event-label">${sanitize(label)}</span>`;
btn.addEventListener('click', () => {
grid.querySelectorAll('.rfq__event-btn').forEach(b => {
b.classList.remove('is-selected');
b.setAttribute('aria-checked', 'false');
});
btn.classList.add('is-selected');
btn.setAttribute('aria-checked', 'true');
rfqData.eventType = id;
});
grid.appendChild(btn);
});
return div;
}
function buildStep2() {
const today = new Date().toISOString().split('T')[0];
const div   = document.createElement('div');
div.className = 'rfq__step';
div.id        = 'rfq-step-2';
div.innerHTML = `
<div class="rfq__step-title">When is your event?</div>
<div class="grid--2 gap-4">
<div class="form-field">
<label class="form-label" for="rfq-date-from">Event Start Date</label>
<input class="form-input" type="date" id="rfq-date-from" min="${today}" />
<span class="form-error" id="rfq-date-from-error"></span>
</div>
<div class="form-field">
<label class="form-label" for="rfq-date-to">Event End Date</label>
<input class="form-input" type="date" id="rfq-date-to" min="${today}" />
<span class="form-error" id="rfq-date-to-error"></span>
</div>
</div>
`;
return div;
}
function buildStep3() {
const div = document.createElement('div');
div.className = 'rfq__step';
div.id        = 'rfq-step-3';
div.innerHTML = `
<div class="rfq__step-title">How many guests are you expecting?</div>
<div class="rfq__guest-display" id="rfq-guest-display">50</div>
<div class="rfq__guest-label">guests approximately</div>
<input class="rfq__guest-slider" type="range" id="rfq-guest-slider"
min="10" max="500" value="50" step="10"
aria-label="Number of guests" />
<div style="display:flex; justify-content:space-between; font-size:var(--fs-xs); color:var(--clr-text-muted); margin-top:var(--sp-2)">
<span>10</span><span>500+</span>
</div>
`;
div.querySelector('#rfq-guest-slider')?.addEventListener('input', (e) => {
const val = e.target.value;
const display = div.querySelector('#rfq-guest-display');
if (display) display.textContent = val;
rfqData.guests = parseInt(val, 10);
});
return div;
}
function buildStep4() {
const div = document.createElement('div');
div.className = 'rfq__step';
div.id        = 'rfq-step-4';
div.innerHTML = `
<div class="rfq__step-title">Tell us about your requirements</div>
<div class="form-field">
<label class="form-label" for="rfq-notes">Requirements & Special Requests</label>
<textarea class="form-textarea" id="rfq-notes" rows="5" maxlength="2000"
placeholder="Describe the event, setup preferences, catering needs, AV requirements, décor style…"></textarea>
</div>
`;
return div;
}
function buildStep5() {
const div = document.createElement('div');
div.className = 'rfq__step';
div.id        = 'rfq-step-5';
div.innerHTML = `
<div class="rfq__step-title">Almost done — your contact details</div>
<div class="form-field">
<label class="form-label" for="rfq-name">Full Name *</label>
<input class="form-input" type="text" id="rfq-name" required autocomplete="name" placeholder="Your full name" />
<span class="form-error" id="rfq-name-error"></span>
</div>
<div class="form-field">
<label class="form-label" for="rfq-phone">Phone Number *</label>
<input class="form-input" type="tel" id="rfq-phone" required autocomplete="tel" placeholder="10-digit mobile number" inputmode="numeric" />
<span class="form-error" id="rfq-phone-error"></span>
</div>
<div class="form-field">
<label class="form-label" for="rfq-email">Email (optional)</label>
<input class="form-input" type="email" id="rfq-email" autocomplete="email" placeholder="For quote delivery via email" />
<span class="form-error" id="rfq-email-error"></span>
</div>
`;
return div;
}
function showStep(step) {
for (let i = 1; i <= TOTAL_STEPS; i++) {
const panel = document.getElementById(`rfq-step-${i}`);
panel?.classList.toggle('is-active', i === step);
const dot = document.getElementById(`rfq-dot-${i}`);
dot?.classList.toggle('is-active', i === step);
dot?.classList.toggle('is-done',   i < step);
if (i < TOTAL_STEPS) {
const connector = document.getElementById(`rfq-connector-${i}`);
connector?.classList.toggle('is-done', i < step);
}
}
const backBtn = document.getElementById('rfq-back-btn');
if (backBtn) backBtn.style.visibility = step > 1 ? 'visible' : 'hidden';
const nextBtn = document.getElementById('rfq-next-btn');
if (nextBtn) {
nextBtn.textContent = step === TOTAL_STEPS ? Strings.RFQ_BTN_SUBMIT : `${Strings.RFQ_BTN_NEXT} →`;
}
if (step > 1) {
scrollTo('.rfq__form-container', -90);
}
if (step === 5) {
setTimeout(() => {
document.getElementById('rfq-name')?.focus();
}, 600);
}
}
function initNavButtons() {
document.getElementById('rfq-next-btn')?.addEventListener('click', async () => {
if (!validateStep(currentStep)) return;
if (currentStep < TOTAL_STEPS) {
collectStepData(currentStep);
currentStep++;
showStep(currentStep);
} else {
await submitRFQ();
}
});
document.getElementById('rfq-back-btn')?.addEventListener('click', () => {
if (currentStep > 1) {
currentStep--;
showStep(currentStep);
}
});
}
function validateStep(step) {
if (step === 1) {
if (!rfqData.eventType) {
showToast('Please select an event type.', 'error');
return false;
}
}
if (step === 2) {
const from = document.getElementById('rfq-date-from')?.value;
const to   = document.getElementById('rfq-date-to')?.value;
if (!from) { showToast('Please select a start date.', 'error'); return false; }
if (!to)   { showToast('Please select an end date.', 'error');   return false; }
}
if (step === 5) {
const name  = document.getElementById('rfq-name')?.value;
const phone = document.getElementById('rfq-phone')?.value;
const email = document.getElementById('rfq-email')?.value;
const nr = validateName(name);
setFieldError('rfq-name', 'rfq-name-error', nr.message);
const pr = validatePhone(phone);
setFieldError('rfq-phone', 'rfq-phone-error', pr.message);
const er = validateEmail(email, false);
setFieldError('rfq-email', 'rfq-email-error', er.message);
return nr.valid && pr.valid && er.valid;
}
return true;
}
function collectStepData(step) {
if (step === 2) {
rfqData.dateFrom = document.getElementById('rfq-date-from')?.value;
rfqData.dateTo   = document.getElementById('rfq-date-to')?.value;
}
if (step === 3) {
rfqData.guests = parseInt(document.getElementById('rfq-guest-slider')?.value || '50', 10);
}
if (step === 4) {
rfqData.notes = sanitize(document.getElementById('rfq-notes')?.value || '').slice(0, 2000);
}
}
async function submitRFQ() {
if (isBotDetected('rfq-honeypot')) return;
if (!checkRFQRateLimit()) {
showToast(Strings.RFQ_RATE_LIMIT, 'error', 6000);
return;
}
const name  = sanitize(document.getElementById('rfq-name')?.value  || '');
const phone = sanitize(document.getElementById('rfq-phone')?.value || '');
const email = sanitize(document.getElementById('rfq-email')?.value || '');
const nextBtn = document.getElementById('rfq-next-btn');
if (nextBtn) { nextBtn.disabled = true; nextBtn.textContent = Strings.RFQ_BTN_SUBMITTING; }
const refId = generateBookingId('RFQ');
try {
await addDoc(collection(db, Config.COLLECTIONS.RFQ_ENQUIRIES), {
refId,
eventType: rfqData.eventType,
dateFrom:  rfqData.dateFrom,
dateTo:    rfqData.dateTo,
guests:    rfqData.guests || 50,
notes:     rfqData.notes  || '',
name, phone, email,
status:    'new',
source:    'website',
createdAt: serverTimestamp(),
});
const waMsg = `📋 NEW RFQ\nRef: ${refId}\nEvent: ${rfqData.eventType}\nDates: ${rfqData.dateFrom} → ${rfqData.dateTo}\nGuests: ${rfqData.guests}\nContact: ${name}, ${phone}\nNotes: ${rfqData.notes?.slice(0, 100)}`;
window.open(getWhatsAppUrl('event', waMsg), '_blank', 'noopener,noreferrer');
document.getElementById('rfq-success').hidden = false;
document.getElementById('rfq-form').hidden     = true;
document.getElementById('rfq-progress').style.display = 'none';
const refEl = document.getElementById('rfq-ref-id');
if (refEl) refEl.textContent = refId;
} catch {
showToast(Strings.RFQ_ERROR, 'error');
if (nextBtn) { nextBtn.disabled = false; nextBtn.textContent = Strings.RFQ_BTN_SUBMIT; }
}
}