import { Config } from '../constants/config.js';
let lenisInstance = null;
export function initLenis() {
if (!Config.FEATURES.ENABLE_ANIMATIONS) return null;
const LenisClass = window.Lenis;
if (!LenisClass) {
setTimeout(initLenis, 500);
return null;
}
lenisInstance = new LenisClass({
duration:        1.4,
easing:          (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
orientation:     'vertical',
gestureOrientation: 'vertical',
smoothWheel:     true,
wheelMultiplier: 1.0,
touchMultiplier: 2.0,
infinite:        false,
});
if (window.gsap && window.gsap.ticker) {
window.gsap.ticker.add((time) => {
lenisInstance.raf(time * 1000);
});
window.gsap.ticker.lagSmoothing(0);
} else {
function raf(time) {
lenisInstance.raf(time);
requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
}
if (window.ScrollTrigger) {
lenisInstance.on('scroll', window.ScrollTrigger.update);
window.ScrollTrigger.addEventListener('refresh', () => {
lenisInstance.resize();
});
}
return lenisInstance;
}
export function scrollTo(target, offset = 0) {
if (!lenisInstance) {
const el = typeof target === 'string' ? document.querySelector(target) : target;
el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
return;
}
lenisInstance.scrollTo(target, { offset, duration: 1.2 });
}
export function stopScroll() {
document.body.classList.add('modal-open');
}
export function startScroll() {
document.body.classList.remove('modal-open');
}
export function getLenis() {
return lenisInstance;
}