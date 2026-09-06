import { Config } from '../constants/config.js';
import { Strings } from '../constants/strings.js';
const THEME_KEY    = 'hmt_theme';
const DARK_THEME   = 'dark';
const LIGHT_THEME  = 'light';
export function getCurrentTheme() {
return document.documentElement.getAttribute('data-theme') || DARK_THEME;
}
export function setTheme(theme) {
document.documentElement.setAttribute('data-theme', theme);
localStorage.setItem(THEME_KEY, theme);
updateToggleButton(theme);
}
export function toggleTheme() {
const next = getCurrentTheme() === DARK_THEME ? LIGHT_THEME : DARK_THEME;
setTheme(next);
}
export function initTheme() {
const btn = document.getElementById('theme-toggle');
if (!btn) return;
updateToggleButton(getCurrentTheme());
btn.addEventListener('click', toggleTheme);
}
function updateToggleButton(theme) {
const btn = document.getElementById('theme-toggle');
if (!btn) return;
if (theme === DARK_THEME) {
btn.setAttribute('aria-label', Strings.NAV_TOGGLE_THEME_DARK);
btn.title = Strings.NAV_TOGGLE_THEME_DARK;
} else {
btn.setAttribute('aria-label', Strings.NAV_TOGGLE_THEME_LIGHT);
btn.title = Strings.NAV_TOGGLE_THEME_LIGHT;
}
}