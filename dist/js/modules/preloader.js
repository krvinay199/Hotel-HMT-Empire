import { Config } from '../constants/config.js';
const PRELOADER_KEY = Config.FEATURES.PRELOADER_SKIP_KEY;
export function initPreloader() {
return new Promise((resolve) => {
const preloader = document.getElementById('preloader');
const counter   = document.getElementById('preloader-counter');
const progress  = document.getElementById('preloader-progress');
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
document.body.style.overflow = 'hidden';
const MIN_DURATION = 1400;
const startTime    = Date.now();
let count = 0;
const duration = 1000;
const steps    = 100;
const interval = duration / steps;
const tick = setInterval(() => {
count = Math.min(count + 1, 100);
if (counter && counter.firstChild) counter.firstChild.nodeValue = count;
if (progress) progress.style.width = `${count}%`;
if (count >= 100) {
clearInterval(tick);
const elapsed   = Date.now() - startTime;
const remaining = Math.max(0, MIN_DURATION - elapsed);
setTimeout(() => exitPreloader(preloader, resolve), remaining);
}
}, interval);
});
}
function exitPreloader(preloader, resolve) {
preloader.classList.add('is-exiting');
preloader.addEventListener('transitionend', () => {
preloader.style.display = 'none';
document.body.style.overflow = '';
sessionStorage.setItem(Config.FEATURES.PRELOADER_SKIP_KEY, '1');
resolve();
}, { once: true });
setTimeout(() => {
preloader.style.display = 'none';
document.body.style.overflow = '';
resolve();
}, 1200);
}