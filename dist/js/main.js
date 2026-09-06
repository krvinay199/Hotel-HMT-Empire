import { Config }   from './constants/config.js';
import { logger }   from './utils/logger.js';
import { initPreloader } from './modules/preloader.js';
import { initLenis }     from './modules/lenis-scroll.js';
import { initTheme }     from './modules/theme.js';
import { initNavbar }    from './modules/navbar.js';
import { initHero }      from './modules/hero.js';
import { initRooms }     from './modules/rooms.js';
import { initBooking }   from './modules/booking.js';
import { initRestaurant } from './modules/restaurant.js';
import { initBanquet }   from './modules/banquet.js';
import { initRFQ }       from './modules/rfq.js';
import { initMap }       from './modules/map.js';
import { initWhatsApp, showToast } from './modules/whatsapp.js';
import { initExperience } from './modules/experience.js';
function waitForLibraries() {
return new Promise((resolve) => {
const check = () => {
if (window.gsap && window.Lenis) {
resolve();
} else {
setTimeout(check, 50);
}
};
check();
});
}
function registerGSAP() {
if (window.gsap && window.ScrollTrigger) {
window.gsap.registerPlugin(window.ScrollTrigger);
}
}
function initEmailJS() {
if (Config.FEATURES.ENABLE_EMAILJS && window.emailjs && Config.EMAILJS.PUBLIC_KEY) {
window.emailjs.init({ publicKey: Config.EMAILJS.PUBLIC_KEY });
}
}
function initNewsletter() {
const form = document.getElementById('newsletter-form');
const input = document.getElementById('newsletter-email');
const success = document.getElementById('newsletter-success');
form?.addEventListener('submit', async (e) => {
e.preventDefault();
const email = input?.value.trim();
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
showToast('Please enter a valid email address.', 'error');
return;
}
try {
const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
const { db } = await import('./firebase-config.js');
await addDoc(collection(db, Config.COLLECTIONS.SUBSCRIBERS), {
email, subscribedAt: serverTimestamp(), source: 'website_footer',
});
form.style.display = 'none';
success && (success.style.display = 'block');
showToast('Subscribed successfully!', 'success');
} catch {
showToast('Subscription failed. Please try again.', 'error');
}
});
}
function initNetworkDetection() {
window.addEventListener('offline', () => {
showToast('You appear to be offline. Some features may not work.', 'error', 5000);
});
}
function initScrollReveal() {
if (!window.gsap || !window.ScrollTrigger) return;
window.gsap.utils.toArray('.section-heading, .section-subheading').forEach((el) => {
window.gsap.fromTo(el,
{ opacity: 0, y: 40 },
{
opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
scrollTrigger: { trigger: el, start: 'top 88%', once: true },
}
);
});
window.gsap.utils.toArray('.eyebrow').forEach((el) => {
window.gsap.fromTo(el,
{ opacity: 0, y: 20 },
{
opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
scrollTrigger: { trigger: el, start: 'top 90%', once: true },
}
);
});
window.gsap.utils.toArray('.gold-line').forEach((el) => {
window.gsap.fromTo(el,
{ scaleX: 0, opacity: 0 },
{
scaleX: 1, opacity: 1, duration: 0.7, ease: 'power3.out',
transformOrigin: 'left center',
scrollTrigger: { trigger: el, start: 'top 90%', once: true },
}
);
});
}
async function main() {
initTheme();
initWhatsApp();
const [preloaderDone] = await Promise.all([
initPreloader(),
waitForLibraries(),
]);
registerGSAP();
initLenis();
initNavbar();
initHero();
initExperience();
initBooking();
initEmailJS();
initScrollReveal();
initNewsletter();
initNetworkDetection();
Promise.all([
initRooms(),
initRestaurant(),
initBanquet(),
initRFQ(),
initMap()
]).catch(err => {
logger.error('[main] Section initialization failed:', err);
});
}
document.addEventListener('DOMContentLoaded', () => {
logger.info('🏨 Hotel HMT Empire — Running in Local Dev Mode');
main().catch(err => logger.error('[main] Boot error:', err));
});