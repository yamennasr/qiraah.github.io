// static/firebase_auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

// ✅ Paste YOUR config values here (no "import ..." lines from Firebase)
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDTPTbVrKsObyk5bVhndrcV2IGXMzHjNII",
  authDomain: "qiraahswipe.firebaseapp.com",
  projectId: "qiraahswipe",
  storageBucket: "qiraahswipe.firebasestorage.app",
  messagingSenderId: "354349569766",
  appId: "1:354349569766:web:cecdde944cdef4173f8d27"
};

const app = initializeApp(FIREBASE_CONFIG);
const auth = getAuth(app);

export async function googleSignIn() {
  const provider = new GoogleAuthProvider();
  // Safari can block popups sometimes; we try popup then redirect fallback.
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (err) {
    // Popup blocked? Use redirect as fallback
    await signInWithRedirect(auth, provider);
    return null; // redirect will resume after page reload
  }
}

export async function appleSignIn() {
  // NOTE: Apple sign-in on web needs proper Apple configuration + HTTPS domain.
  const provider = new OAuthProvider("apple.com");
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (err) {
    await signInWithRedirect(auth, provider);
    return null;
  }
}

export async function handleRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    return result?.user || null;
  } catch (err) {
    return null;
  }
}
