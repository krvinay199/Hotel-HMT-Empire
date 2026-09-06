/**
 * main.js — Hotel HMT Empire
 * App entry point. Orchestrates all module initialization.
 * ─────────────────────────────────────────────────────────────────────
 *
 * Initialization order:
 *   1. Wait for CDN scripts to load (GSAP, Lenis, Leaflet)
 *   2. Register GSAP plugins
 *   3. Show preloader
 *   4. After preloader: init Lenis, theme, navbar, hero
 *   5. After DOM ready: lazy-init rooms, restaurant, banquet, rfq, map
 *   6. Always: init booking modal, WhatsApp FAB, newsletter
 *   7. Init EmailJS if configured
 */

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

// ── Wait for CDN scripts to be ready ──────────────────────────────────
function waitForLibraries() {
  return new Promise((resolve) => {
    let attempts = 0;
    const maxAttempts = 30; // 1.5s max wait
    const check = () => {
      attempts++;
      if ((window.gsap && window.Lenis) || attempts >= maxAttempts) {
        resolve();
      } else {
        setTimeout(check, 50);
      }
    };
    check();
  });
}

// ── Register GSAP plugins ──────────────────────────────────────────────
function registerGSAP() {
  if (window.gsap && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
  }
}

// ── Initialize EmailJS ─────────────────────────────────────────────────
function initEmailJS() {
  if (Config.FEATURES.ENABLE_EMAILJS && window.emailjs && Config.EMAILJS.PUBLIC_KEY) {
    window.emailjs.init({ publicKey: Config.EMAILJS.PUBLIC_KEY });
  }
}

// ── Newsletter subscription ────────────────────────────────────────────
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
      // Import Firestore lazily
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

// ── Offline/online detection ───────────────────────────────────────────
function initNetworkDetection() {
  window.addEventListener('offline', () => {
    showToast('You appear to be offline. Some features may not work.', 'error', 5000);
  });
}

// ── IntersectionObserver for section scroll reveals ───────────────────
function initScrollReveal() {
  if (!window.gsap || !window.ScrollTrigger) return;

  // Reveal .section-heading and .section-subheading on scroll
  window.gsap.utils.toArray('.section-heading, .section-subheading').forEach((el) => {
    window.gsap.fromTo(el,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      }
    );
  });

  // Reveal .eyebrow labels
  window.gsap.utils.toArray('.eyebrow').forEach((el) => {
    window.gsap.fromTo(el,
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      }
    );
  });

  // Reveal .gold-line elements
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

// ── Main ───────────────────────────────────────────────────────────────
async function main() {
  // 1. Apply theme immediately (FOUC prevention already done in HTML head)
  initTheme();

  // 2. Init WhatsApp FAB and toast (no dependencies)
  initWhatsApp();

  // 3. Run preloader while libraries load in parallel
  const [preloaderDone] = await Promise.all([
    initPreloader(),
    waitForLibraries(),
  ]);

  // 4. Libraries are ready — register GSAP plugins
  registerGSAP();

  // 5. Init smooth scroll
  initLenis();

  // 6. Init navbar (relies on Lenis scrollTo)
  initNavbar();

  // 7. Init hero animations
  initHero();

  // 7.5. Init drone experience video module
  initExperience();

  // 8. Init booking modal (always ready so any "Book Now" CTA works)
  initBooking();

  // 9. Init EmailJS
  initEmailJS();

  // 10. Init scroll reveals
  initScrollReveal();

  // 11. Init newsletter footer form
  initNewsletter();

  // 12. Network detection
  initNetworkDetection();

  // 13. Init data sections immediately on startup in parallel
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

// ── Boot ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  logger.info('🏨 Hotel HMT Empire — Running in Local Dev Mode');
  main().catch(err => logger.error('[main] Boot error:', err));
});
