/**
 * firebase-config.js — Hotel HMT Empire
 * Initializes Firebase and exports db, auth, and storage instances.
 * All other JS modules import from this file — never re-initialize Firebase.
 *
 * Uses Firebase v10 (modular) via CDN importmap defined in index.html.
 * ─────────────────────────────────────────────────────────────────────
 */

import { initializeApp }         from 'firebase/app';
import { getFirestore }          from 'firebase/firestore';
import { getAuth }               from 'firebase/auth';
import { getStorage }            from 'firebase/storage';
import { Config }                from './constants/config.js';

// Check if Firebase has valid production credentials (not placeholder)
export const isFirebaseConfigured = Boolean(
  Config.FIREBASE.API_KEY &&
  !Config.FIREBASE.API_KEY.startsWith('YOUR_') &&
  Config.FIREBASE.PROJECT_ID &&
  !Config.FIREBASE.PROJECT_ID.startsWith('YOUR_')
);

// Initialize Firebase with config from constants/config.js only if valid credentials exist
const firebaseConfig = {
  apiKey: Config.FIREBASE.API_KEY,
  authDomain: Config.FIREBASE.AUTH_DOMAIN,
  projectId: Config.FIREBASE.PROJECT_ID,
  storageBucket: Config.FIREBASE.STORAGE_BUCKET,
  messagingSenderId: Config.FIREBASE.MESSAGING_SENDER_ID,
  appId: Config.FIREBASE.APP_ID,
  measurementId: Config.FIREBASE.MEASUREMENT_ID
};

const firebaseApp = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;

// ── Exported Instances ─────────────────────────────────────────────────
// Import these in any module that needs Firebase.
// Example: import { db } from '../firebase-config.js';

/** Firestore database instance (or null if unconfigured) */
export const db      = firebaseApp ? getFirestore(firebaseApp) : null;

/** Firebase Authentication instance (used by admin panel only) */
export const auth    = firebaseApp ? getAuth(firebaseApp) : null;

/** Cloud Storage instance (for room/menu image uploads from admin) */
export const storage = firebaseApp ? getStorage(firebaseApp) : null;

export default firebaseApp;

