import { Config } from '../constants/config.js';
import { scrollTo, stopScroll, startScroll } from './lenis-scroll.js';
export function initHero() {
initHeroVideoModal();
if (!Config.FEATURES.ENABLE_ANIMATIONS) {
document.querySelectorAll('.hero__eyebrow, .hero__headline-word, .hero__gold-line, .hero__subtitle, .hero__ctas, .hero__stats')
.forEach(el => (el.style.opacity = '1'));
initHeroBookBtn();
return;
}
if (!window.gsap) {
setTimeout(initHero, 300);
return;
}
const gsap = window.gsap;
const tl   = gsap.timeline({ defaults: { ease: 'power3.out' } });
tl.fromTo('#hero-eyebrow',
{ opacity: 0, y: 20, letterSpacing: '0.3em' },
{ opacity: 1, y: 0,  letterSpacing: 'var(--ls-widest)', duration: 0.8 }
)
.fromTo('.hero__headline-word',
{ opacity: 0, y: 60, skewY: 3 },
{ opacity: 1, y: 0,  skewY: 0, duration: 1, stagger: 0.15 },
'-=0.4'
)
.fromTo('.hero__gold-line',
{ opacity: 0, scaleX: 0 },
{ opacity: 1, scaleX: 1, duration: 0.6, transformOrigin: 'left center' },
'-=0.6'
)
.fromTo('.hero__subtitle',
{ opacity: 0, y: 30 },
{ opacity: 1, y: 0, duration: 0.8 },
'-=0.4'
)
.fromTo('.hero__ctas',
{ opacity: 0, y: 20 },
{ opacity: 1, y: 0, duration: 0.7 },
'-=0.4'
)
.fromTo('#hero-stats',
{ opacity: 0, y: 30 },
{ opacity: 1, y: 0, duration: 0.7 },
'-=0.3'
);
animateHeroCounters(gsap);
if (window.ScrollTrigger) {
gsap.registerPlugin(window.ScrollTrigger);
gsap.to('.hero__content', {
y:    -80,
ease: 'none',
scrollTrigger: {
trigger: '#hero',
start:   'top top',
end:     'bottom top',
scrub:   true,
},
});
}
initHeroBookBtn();
}
function animateHeroCounters(gsap) {
const statValues = document.querySelectorAll('.hero__stat-value[data-target]');
statValues.forEach((el) => {
const target  = parseInt(el.dataset.target, 10);
const suffix  = target >= 50000 ? 'K+' : '+';
const display = target >= 50000 ? Math.round(target / 1000) : target;
const obj = { val: 0 };
gsap.to(obj, {
val:      display,
duration: 2,
ease:     'power2.out',
delay:    1.5,
onUpdate: () => { el.textContent = `${Math.round(obj.val)}${suffix}`; },
});
});
}
function initHeroBookBtn() {
const btn = document.getElementById('hero-book-btn');
btn?.addEventListener('click', () => {
import('./booking.js').then(m => m.openBookingModal());
});
}
function initHeroVideoModal() {
const modal     = document.getElementById('video-modal');
const openBtn   = document.getElementById('hero-video-btn');
const closeBtn  = document.getElementById('video-modal-close');
const backdrop  = document.getElementById('video-modal-backdrop');
const player    = document.getElementById('modal-player');
if (!modal || !openBtn || !player) return;
const openModal = () => {
modal.classList.add('is-open');
modal.setAttribute('aria-hidden', 'false');
document.getElementById('navbar')?.classList.add('is-hidden');
stopScroll();
player.play().catch(() => {});
};
const closeModal = () => {
modal.classList.remove('is-open');
modal.setAttribute('aria-hidden', 'true');
document.getElementById('navbar')?.classList.remove('is-hidden');
startScroll();
player.pause();
player.currentTime = 0;
};
openBtn.addEventListener('click', openModal);
closeBtn?.addEventListener('click', closeModal);
backdrop?.addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => {
if (e.key === 'Escape' && modal.classList.contains('is-open')) {
closeModal();
}
});
}