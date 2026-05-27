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
  apiKey:            "AIzaSyCjPI22y7CrUa9lGh48wPmoXtBcHQ2FrQE",
  authDomain:        "codebro-92f0c.firebaseapp.com",
  projectId:         "codebro-92f0c",
  messagingSenderId: "1097108830799",
  appId:             "1:1097108830799:web:65caee85c883956baf083a",
};

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
