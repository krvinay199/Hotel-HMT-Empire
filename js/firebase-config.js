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

// Initialize Firebase with config from constants/config.js
const firebaseConfig = {
  apiKey: Config.FIREBASE.API_KEY,
  authDomain: Config.FIREBASE.AUTH_DOMAIN,
  projectId: Config.FIREBASE.PROJECT_ID,
  storageBucket: Config.FIREBASE.STORAGE_BUCKET,
  messagingSenderId: Config.FIREBASE.MESSAGING_SENDER_ID,
  appId: Config.FIREBASE.APP_ID,
  measurementId: Config.FIREBASE.MEASUREMENT_ID
};
const firebaseApp = initializeApp(firebaseConfig);

// ── Exported Instances ─────────────────────────────────────────────────
// Import these in any module that needs Firebase.
// Example: import { db } from '../firebase-config.js';

/** Firestore database instance */
export const db      = getFirestore(firebaseApp);

/** Firebase Authentication instance (used by admin panel only) */
export const auth    = getAuth(firebaseApp);

/** Cloud Storage instance (for room/menu image uploads from admin) */
export const storage = getStorage(firebaseApp);

export default firebaseApp;
