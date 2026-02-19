import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

//
const firebaseConfig = {
  apiKey: "AIzaSyDTPTbVrKsObyk5bVhndrcV2IGXMzHjNII",
  authDomain: "qiraahswipe.firebaseapp.com",
  projectId: "qiraahswipe",
  storageBucket: "qiraahswipe.firebasestorage.app",
  messagingSenderId: "354349569766",
  appId: "1:354349569766:web:cecdde944cdef4173f8d27"
};

//
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);

//
const googleProvider = new GoogleAuthProvider();

// ===============================
// GOOGLE SIGN-IN
// ===============================

// Popup flow (works on most browsers)
export async function googleSignIn() {
  const cred = await signInWithPopup(auth, googleProvider);
  return cred.user;
}

//
export async function googleRedirect() {
  await signInWithRedirect(auth, googleProvider);
}

// Handle redirect result after returning
export async function handleRedirectResult() {
  const res = await getRedirectResult(auth);
  return res ? res.user : null;
}

// ===============================
// EMAIL/PASSWORD (optional but recommended)
// ===============================
export async function emailSignUp(email, password, displayName = "") {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }
  return cred.user;
}

export async function emailLogin(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function sendReset(email) {
  await sendPasswordResetEmail(auth, email);
}
