/**
 * theme.js — Hotel HMT Empire
 * Dark / Light theme toggle with localStorage persistence.
 */

import { Config } from '../constants/config.js';
import { Strings } from '../constants/strings.js';

const THEME_KEY    = 'hmt_theme';
const DARK_THEME   = 'dark';
const LIGHT_THEME  = 'light';

/** Get the current theme from the <html> element. */
export function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || DARK_THEME;
}

/** Set theme on <html> and persist to localStorage. */
export function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  updateToggleButton(theme);
}

/** Toggle between dark and light. */
export function toggleTheme() {
  const next = getCurrentTheme() === DARK_THEME ? LIGHT_THEME : DARK_THEME;
  setTheme(next);
}

/** Wire up the theme toggle button in the navbar. */
export function initTheme() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  // Reflect current theme on button
  updateToggleButton(getCurrentTheme());

  btn.addEventListener('click', toggleTheme);
}

/** Update button aria-label based on current theme. */
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
