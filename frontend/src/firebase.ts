/** Firebase init and auth export. All config from .env (see env.example). No keys in this file. */
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';

const env = import.meta.env;

const apiKey = (env.VITE_FIREBASE_API_KEY as string)?.trim();
if (!apiKey) {
  throw new Error(
    'Missing Firebase config. Copy frontend/env.example to frontend/.env and add your Firebase credentials (VITE_FIREBASE_*).'
  );
}

const firebaseConfig = {
  apiKey,
  authDomain: (env.VITE_FIREBASE_AUTH_DOMAIN as string)?.trim() ?? '',
  projectId: (env.VITE_FIREBASE_PROJECT_ID as string)?.trim() ?? '',
  storageBucket: (env.VITE_FIREBASE_STORAGE_BUCKET as string)?.trim() ?? '',
  messagingSenderId: (env.VITE_FIREBASE_MESSAGING_SENDER_ID as string)?.trim() ?? '',
  appId: (env.VITE_FIREBASE_APP_ID as string)?.trim() ?? '',
  measurementId: (env.VITE_FIREBASE_MEASUREMENT_ID as string)?.trim() ?? '',
};

const app = initializeApp(firebaseConfig);
getAnalytics(app);
export const auth = getAuth(app);
