/**
 * preloader.js — Hotel HMT Empire
 * Cinematic intro: animated counter, progress bar, curtain exit.
 */

import { Config } from '../constants/config.js';

const PRELOADER_KEY = Config.FEATURES.PRELOADER_SKIP_KEY;

/** Runs the preloader animation. Resolves when exit is complete. */
export function initPreloader() {
  return new Promise((resolve) => {
    const preloader = document.getElementById('preloader');
    const counter   = document.getElementById('preloader-counter');
    const progress  = document.getElementById('preloader-progress');

    // Skip on subsequent visits (only show once per session)
    if (sessionStorage.getItem(PRELOADER_KEY)) {
      preloader.style.display = 'none';
      resolve();
      return;
    }

    if (!preloader || !Config.FEATURES.SHOW_PRELOADER) {
      preloader && (preloader.style.display = 'none');
      resolve();
      return;
    }

    // Prevent body scroll while preloader is active
    document.body.style.overflow = 'hidden';

    const MIN_DURATION = 5000; // Always show for at least 5 seconds
    const startTime    = Date.now();

    let count = 0;
    const duration = 4200; // counter animation runs for ~4.2s (leaves ~0.8s hold at 100%)
    const steps    = 100;
    const interval = duration / steps;

    const tick = setInterval(() => {
      // Ease-in-out feel: accelerate in middle, slow at ends
      count = Math.min(count + 1, 100);

      if (counter) counter.firstChild.nodeValue = count;
      if (progress) progress.style.width = `${count}%`;

      if (count >= 100) {
        clearInterval(tick);

        // Wait until the minimum 5s has elapsed before starting exit
        const elapsed   = Date.now() - startTime;
        const remaining = Math.max(0, MIN_DURATION - elapsed - 400);

        setTimeout(() => exitPreloader(preloader, resolve), remaining);
      }
    }, interval);
  });
}

function exitPreloader(preloader, resolve) {
  // Add exit class to trigger CSS curtain animation
  preloader.classList.add('is-exiting');

  // After CSS animation completes, hide the preloader
  preloader.addEventListener('transitionend', () => {
    preloader.style.display = 'none';
    document.body.style.overflow = '';
    sessionStorage.setItem(Config.FEATURES.PRELOADER_SKIP_KEY, '1');
    resolve();
  }, { once: true });

  // Fallback: if transition doesn't fire (e.g. reduced motion), resolve after a short delay
  setTimeout(() => {
    preloader.style.display = 'none';
    document.body.style.overflow = '';
    resolve();
  }, 1200);
}
