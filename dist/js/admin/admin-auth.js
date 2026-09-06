/**
 * admin-auth.js — Hotel HMT Empire
 * Firebase Authentication for admin panel.
 * Loads all other admin modules after successful sign-in.
 */

import { auth }       from '../firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { sanitize }   from '../modules/security.js';

// ── Demo Mode (no Firebase needed) ───────────────────────────────────
const DEMO_EMAIL    = 'admin@hmtempire.com';
const DEMO_PASSWORD = 'HMT@admin2025';
let demoMode = false;

// ── Auth State Observer ────────────────────────────────────────────────
onAuthStateChanged(auth, (user) => {
  if (user) {
    showDashboard(user);
  } else if (!demoMode) {
    showLogin();
  }
});

// ── Login Form ────────────────────────────────────────────────────────
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email    = document.getElementById('login-email')?.value.trim();
  const password = document.getElementById('login-password')?.value;
  const errorEl  = document.getElementById('login-error');
  const loginBtn = document.getElementById('login-btn');

  if (!email || !password) {
    showError('Please enter your email and password.');
    return;
  }

  loginBtn.disabled    = true;
  loginBtn.textContent = 'Signing in…';
  if (errorEl) errorEl.className = 'admin-login__error';

  // ── Demo credentials bypass ──────────────────────────────────────
  if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
    demoMode = true;
    await showDashboard({ email: DEMO_EMAIL, displayName: 'Demo Admin' }, true);
    return;
  }

  // ── Real Firebase Auth ───────────────────────────────────────────
  try {
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will fire → showDashboard()
  } catch (err) {
    loginBtn.disabled    = false;
    loginBtn.textContent = 'Sign In';
    showError(getFirebaseAuthError(err.code));
  }
});

// ── Sign Out ──────────────────────────────────────────────────────────
document.getElementById('signout-btn')?.addEventListener('click', async () => {
  if (confirm('Are you sure you want to sign out?')) {
    if (demoMode) {
      demoMode = false;
      showLogin();
    } else {
      await signOut(auth);
    }
  }
});

// ── Helpers ───────────────────────────────────────────────────────────
function showLogin() {
  document.getElementById('admin-login').style.display = 'flex';
  document.getElementById('admin-dashboard').hidden    = true;
}

async function showDashboard(user, isDemoMode = false) {
  document.getElementById('admin-login').style.display = 'none';
  document.getElementById('admin-dashboard').hidden    = false;

  // Show demo mode banner
  if (isDemoMode) {
    const sidebar = document.querySelector('.admin__sidebar-header');
    if (sidebar && !document.getElementById('demo-banner')) {
      const banner = document.createElement('div');
      banner.id = 'demo-banner';
      banner.style.cssText = 'background:rgba(201,168,76,0.15);border:1px solid rgba(201,168,76,0.4);border-radius:8px;padding:6px 10px;font-size:11px;color:#C9A84C;text-align:center;margin-top:8px;';
      banner.textContent = '🔒 Demo Mode — No Firebase';
      sidebar.appendChild(banner);
    }
  }

  // Load admin modules lazily after login
  const [{ initAdminBookings }] = await Promise.all([
    import('./admin-bookings.js'),
  ]);

  initAdminTabs();
  initAdminBookings();

  // Lazy-load other tabs on first click
  document.querySelectorAll('.admin__nav-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const tab = btn.dataset.tab;
      if (tab === 'rooms') {
        const { initAdminRooms } = await import('./admin-rooms.js');
        initAdminRooms();
      }
      if (tab === 'menu') {
        const { initAdminMenu } = await import('./admin-menu.js');
        initAdminMenu();
      }
      if (tab === 'rfq') {
        const { initAdminRFQ } = await import('./admin-rfq.js');
        initAdminRFQ();
      }
    });
  });
}

function showError(message) {
  const el = document.getElementById('login-error');
  if (el) {
    el.textContent = message;
    el.classList.add('is-visible');
  }
}

/** Map Firebase auth error codes to user-friendly messages */
function getFirebaseAuthError(code) {
  const messages = {
    'auth/wrong-password':     'Incorrect password. Please try again.',
    'auth/user-not-found':     'No admin account found with this email.',
    'auth/invalid-email':      'Invalid email address.',
    'auth/too-many-requests':  'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Check your connection.',
  };
  return messages[code] || 'Sign-in failed. Please try again.';
}

// ── Tab Switching ─────────────────────────────────────────────────────
function initAdminTabs() {
  document.querySelectorAll('.admin__nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;

      // Update active nav button
      document.querySelectorAll('.admin__nav-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      // Show correct panel
      document.querySelectorAll('.admin__tab-panel').forEach(p => p.classList.remove('is-active'));
      document.getElementById(`tab-${tabId}`)?.classList.add('is-active');
    });
  });
}
