import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDTPTbVrKsObyk5bVhndrcV2IGXMzHjNII",
  authDomain: "qiraahswipe.firebaseapp.com",
  projectId: "qiraahswipe",
  storageBucket: "qiraahswipe.firebasestorage.app",
  messagingSenderId: "354349569766",
  appId: "1:354349569766:web:cecdde944cdef4173f8d27"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export async function googleSignIn() {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (err) {
    await signInWithRedirect(auth, provider);
    return null;
  }
}

export async function handleRedirectResult() {
  const result = await getRedirectResult(auth);
  return result ? result.user : null;
}
