import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const hasRequiredConfig = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId,
);

export const firebaseEnabled = hasRequiredConfig;

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;

export const getFirebaseApp = async () => {
  if (!firebaseEnabled) {
    return null;
  }

  if (firebaseApp) {
    return firebaseApp;
  }

  const { getApp, getApps, initializeApp } = await import("firebase/app");
  firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  return firebaseApp;
};

export const getFirebaseAuth = async () => {
  if (!firebaseEnabled) {
    return null;
  }

  if (firebaseAuth) {
    return firebaseAuth;
  }

  const app = await getFirebaseApp();
  if (!app) {
    return null;
  }

  const { getAuth } = await import("firebase/auth");
  firebaseAuth = getAuth(app);
  return firebaseAuth;
};
