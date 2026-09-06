/**
 * lenis-scroll.js — Hotel HMT Empire
 * Initializes Lenis smooth scroll and syncs with GSAP ScrollTrigger.
 */

import { Config } from '../constants/config.js';

let lenisInstance = null;

/** Initialize Lenis + GSAP ScrollTrigger sync. Returns the Lenis instance. */
export function initLenis() {
  if (!Config.FEATURES.ENABLE_ANIMATIONS) return null;

  // Lenis and GSAP are loaded as CDN globals
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

  // Sync Lenis raf with GSAP ticker
  if (window.gsap && window.gsap.ticker) {
    window.gsap.ticker.add((time) => {
      lenisInstance.raf(time * 1000);
    });
    window.gsap.ticker.lagSmoothing(0);
  } else {
    // Fallback: use requestAnimationFrame directly
    function raf(time) {
      lenisInstance.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // Sync Lenis with GSAP ScrollTrigger
  if (window.ScrollTrigger) {
    lenisInstance.on('scroll', window.ScrollTrigger.update);
    window.ScrollTrigger.addEventListener('refresh', () => {
      lenisInstance.resize();
    });
  }

  return lenisInstance;
}

/** Scroll to a target element or selector smoothly. */
export function scrollTo(target, offset = 0) {
  if (!target) return;
  if (typeof target === 'string') {
    if (!target.startsWith('#') && !target.startsWith('.')) return;
    try {
      if (!document.querySelector(target)) return;
    } catch {
      return;
    }
  }
  if (!lenisInstance) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  try {
    lenisInstance.scrollTo(target, { offset, duration: 1.2 });
  } catch (err) {
    console.warn('Scroll error:', err);
  }
}

/** Stop smooth scroll (e.g. when modal is open). */
export function stopScroll() {
  document.body.classList.add('modal-open');
}

/** Resume smooth scroll. */
export function startScroll() {
  document.body.classList.remove('modal-open');
}

export function getLenis() {
  return lenisInstance;
}
