import { initializeApp }         from 'firebase/app';
import { getFirestore }          from 'firebase/firestore';
import { getAuth }               from 'firebase/auth';
import { getStorage }            from 'firebase/storage';
import { Config }                from './constants/config.js';
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
export const db      = getFirestore(firebaseApp);
export const auth    = getAuth(firebaseApp);
export const storage = getStorage(firebaseApp);
export default firebaseApp;