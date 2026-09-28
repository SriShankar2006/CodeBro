// src/services/firebase.js
// Firebase is used ONLY for Authentication in CodeBro.
// All data (profiles, progress, submissions) is stored in Supabase.

import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";

const firebaseConfig = {
  apiKey:            process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain:       process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.REACT_APP_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.REACT_APP_FIREBASE_APP_ID,
};

export const ADMIN_EMAIL = (process.env.REACT_APP_ADMIN_EMAIL || "admin1@codebro.dev").toLowerCase();

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// ─── Auth helpers ─────────────────────────────────────────
export const loginWithEmail   = (e, p)    => signInWithEmailAndPassword(auth, e, p);
export const registerWithEmail= (e, p)    => createUserWithEmailAndPassword(auth, e, p);
export const loginWithGoogle  = ()        => signInWithPopup(auth, googleProvider);
export const logoutUser       = ()        => signOut(auth);
export const resetPassword    = (e)       => sendPasswordResetEmail(auth, e);
export const updateUserProfile= (u, data) => updateProfile(u, data);
export const onAuthChange     = (cb)      => onAuthStateChanged(auth, cb);

export default app;
