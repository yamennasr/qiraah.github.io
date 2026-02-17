// Qiraah – Provider Sign-In (FREE)
// Uses Firebase Authentication (free tier). This file is ONLY loaded when the user clicks
// a provider button, so your app stays stable if Firebase isn't configured.
//
// ✅ To enable Google / Apple sign-in:
// 1) Create a Firebase project (free)
// 2) Enable Authentication providers (Google, and Apple if you have Apple setup)
// 3) Paste your web app config values below.
//
// NOTE: Apple sign-in for Web requires a real HTTPS domain and Apple configuration.

// ---- 1) Paste Firebase config here ----
// (This is NOT a secret; it's safe to ship in client code.)
export const FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  appId: "",
  // optional:
  // messagingSenderId: "",
  // storageBucket: "",
  // measurementId: "",
};

function isConfigReady(cfg) {
  return !!(cfg && cfg.apiKey && cfg.authDomain && cfg.projectId && cfg.appId);
}

async function loadFirebase() {
  const appMod = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js");
  const authMod = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js");
  return { ...appMod, ...authMod };
}

export async function signInWithGoogle() {
  if (!isConfigReady(FIREBASE_CONFIG)) {
    throw new Error(
      "Google sign-in isn't configured yet. Paste your Firebase web config into static/firebase_auth.js"
    );
  }

  const fb = await loadFirebase();
  const app = fb.initializeApp(FIREBASE_CONFIG);
  const auth = fb.getAuth(app);
  const provider = new fb.GoogleAuthProvider();

  // Prefer redirect on iOS Safari (more reliable than popup)
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS) {
    await fb.signInWithRedirect(auth, provider);
    // After redirect, the caller should handle getRedirectResult.
    return { pendingRedirect: true };
  }

  const result = await fb.signInWithPopup(auth, provider);
  const user = result.user;
  return { uid: user.uid, email: user.email || "", displayName: user.displayName || "" };
}

export async function getGoogleRedirectResultIfAny() {
  if (!isConfigReady(FIREBASE_CONFIG)) return null;
  const fb = await loadFirebase();
  const app = fb.initializeApp(FIREBASE_CONFIG);
  const auth = fb.getAuth(app);
  const result = await fb.getRedirectResult(auth);
  if (!result || !result.user) return null;
  const user = result.user;
  return { uid: user.uid, email: user.email || "", displayName: user.displayName || "" };
}

export async function signInWithApple() {
  if (!isConfigReady(FIREBASE_CONFIG)) {
    throw new Error(
      "Apple sign-in isn't configured yet. Paste your Firebase web config into static/firebase_auth.js"
    );
  }

  const fb = await loadFirebase();
  const app = fb.initializeApp(FIREBASE_CONFIG);
  const auth = fb.getAuth(app);

  // Firebase supports Apple provider on web, but requires Apple setup + HTTPS domain.
  const provider = new fb.OAuthProvider("apple.com");

  // Redirect is generally safest
  await fb.signInWithRedirect(auth, provider);
  return { pendingRedirect: true };
}

export async function getAppleRedirectResultIfAny() {
  if (!isConfigReady(FIREBASE_CONFIG)) return null;
  const fb = await loadFirebase();
  const app = fb.initializeApp(FIREBASE_CONFIG);
  const auth = fb.getAuth(app);
  const result = await fb.getRedirectResult(auth);
  if (!result || !result.user) return null;
  const user = result.user;
  return { uid: user.uid, email: user.email || "", displayName: user.displayName || "" };
}
