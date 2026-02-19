console.log("AUTH BEFORE:", localStorage.getItem("qiraah_session"));

window.addEventListener("DOMContentLoaded", () => {
  console.log("AUTH sees session:", localStorage.getItem("qiraah_session"));
  const startView = document.getElementById("start-view");
  const appView = document.getElementById("app-view");

  const createBtn = document.getElementById("create-account-btn");
  const loginBtn = document.getElementById("login-btn");

  // Provider buttons (optional)
  const googleBtn = document.getElementById("google-signin-btn");
  const appleBtn = document.getElementById("apple-signin-btn");

  const formsWrap = document.getElementById("auth-forms");
  const signupForm = document.getElementById("signup-form");
  const loginForm = document.getElementById("login-form");

  const signupName = document.getElementById("signup-name");
  const signupPass = document.getElementById("signup-pass");
  const loginName = document.getElementById("login-name");
  const loginPass = document.getElementById("login-pass");
  const forgotPassBtn = document.getElementById('forgot-pass-btn');

  const errorEl = document.getElementById("auth-error");


  function startAppWithSession(username) {
    // Save session
    localStorage.setItem("qiraah_session", username);
  
    // Hide auth/start UI
    if (startView) {
      startView.style.display = "none";
      startView.style.pointerEvents = "none";
    }
  
    // Show bottom nav again (since you hide it on auth screen)
    const bottomNav = document.querySelector(".bottom-nav");
    if (bottomNav) bottomNav.style.display = "flex";
  
    // Tell main.js to boot the app
    window.dispatchEvent(new Event("qiraah:start"));
  }

  function showError(msg) {
    if (!errorEl) {
      alert(msg);
      return;
    }
    errorEl.textContent = msg;
    errorEl.classList.remove("hidden");
  }
  
  function clearError() {
    if (!errorEl) return;
    errorEl.textContent = "";
    errorEl.classList.add("hidden");
  }

  // Handle redirect-based sign-in (Safari fallback)
(async () => {
  try {
    const fb = await import("firebase_auth.js");
    const user = await fb.handleRedirectResult();
    if (user) {
      startAppWithSession(user.email || user.uid);
    }
  } catch (e) {}
})();

  if (!startView || !appView) {
    console.error("auth.js: Missing #start-view or #app-view in HTML.");
    return;
  }

  // ---- Users storage ----
  function loadUsers() {
    return JSON.parse(localStorage.getItem("qiraah_users") || "[]");
  }
  function saveUsers(users) {
    localStorage.setItem("qiraah_users", JSON.stringify(users));
  }

  function showError(msg) {
    if (!errorEl) return;
    errorEl.textContent = msg;
    errorEl.classList.remove("hidden");
  }
  function clearError() {
    if (!errorEl) return;
    errorEl.textContent = "";
    errorEl.classList.add("hidden");
  }

  function showStart() {
    const bottomNav = document.querySelector(".bottom-nav");
if (bottomNav) bottomNav.style.display = "none";
    // show auth/start view
    startView.style.display = "flex";
    startView.style.pointerEvents = "auto";

    // hide app view (CSS default might already do this)
    appView.style.display = "none";

    // hide forms until user chooses
    if (formsWrap) formsWrap.classList.add("hidden");
    if (signupForm) signupForm.classList.add("hidden");
    if (loginForm) loginForm.classList.add("hidden");
    clearError();
  }

  function enterAppWithSession(username) {
    const bottomNav = document.querySelector(".bottom-nav");
if (bottomNav) bottomNav.style.display = "flex";
    // persist session
    localStorage.setItem("qiraah_session", username);

    // hide start view completely (cannot block clicks)
    startView.style.display = "none";
    startView.style.pointerEvents = "none";

    // IMPORTANT: show app view (your CSS often hides it by default)
    appView.style.display = "block";

    // kick main.js boot
    window.dispatchEvent(new Event("qiraah:start"));
  }

  // --- Provider login helpers ---
  function ensureUserExists(username) {
    const users = loadUsers();
    const exists = users.some(x => (x.name || "").toLowerCase() === username.toLowerCase());
    if (!exists) {
      // Store provider users with a placeholder password (not used)
      users.push({ name: username, pass: "" });
      saveUsers(users);
    }
  }

// ===============================
// FIREBASE PROVIDER LOGIN (Google)
// ===============================
async function signInWithGoogleProvider() {
  try {
    // Dynamically load Firebase module (so we don't break main.js)
    const fb = await import("firebase_auth.js");

    // Check if returning from redirect (Safari-safe flow)
    const redirectUser = await fb.handleRedirectResult();
    if (redirectUser) {
      enterAppWithSession(redirectUser.email || redirectUser.uid);
      return;
    }

    // Try popup first
    const user = await fb.googleSignIn();

    if (user) {
      enterAppWithSession(user.email || user.uid);
    }

} catch (err) {
  console.error("Google sign-in error:", err);
  if (typeof showError === "function") showError("Google sign-in failed. Try again.");
  else alert("Google sign-in failed. Try again.");
}
}

  async function tryHandleRedirectResults() {
    try {
      // If Firebase is configured and we came back from a redirect, complete sign-in.
      const mod = await import("firebase_auth.js");

      const g = await mod.getGoogleRedirectResultIfAny();
      if (g && (g.email || g.uid)) {
        const username = g.email || (g.displayName ? g.displayName.replace(/\s+/g, "_") : g.uid);
        ensureUserExists(username);
        enterAppWithSession(username);
        return true;
      }

      const a = await mod.getAppleRedirectResultIfAny();
      if (a && (a.email || a.uid)) {
        const username = a.email || (a.displayName ? a.displayName.replace(/\s+/g, "_") : a.uid);
        ensureUserExists(username);
        enterAppWithSession(username);
        return true;
      }
    } catch (e) {
      // If Firebase isn't configured, ignore silently.
    }
    return false;
  }

  function showSignup() {
    clearError();
    if (formsWrap) formsWrap.classList.remove("hidden");
    if (signupForm) signupForm.classList.remove("hidden");
    if (loginForm) loginForm.classList.add("hidden");
    if (signupName) signupName.focus();
  }

  function showLogin() {
    clearError();
    if (formsWrap) formsWrap.classList.remove("hidden");
    if (loginForm) loginForm.classList.remove("hidden");
    if (signupForm) signupForm.classList.add("hidden");
    if (loginName) loginName.focus();
  }


  clearError();
  // Buttons (show forms)
  if (createBtn) createBtn.addEventListener("click", showSignup);
  if (loginBtn) loginBtn.addEventListener("click", showLogin);

  document.getElementById("google-btn");
if (googleBtn) {
  googleBtn.addEventListener("click", signInWithGoogleProvider);
}

  // Provider sign-in (FREE via Firebase Auth if configured)
  if (googleBtn) {
    googleBtn.addEventListener("click", async () => {
      clearError();
      try {
        const mod = await import("firebase_auth.js");
        const res = await mod.signInWithGoogle();
        if (res && res.pendingRedirect) return; // will complete after redirect

        const username = res.email || res.uid;
        if (!username) throw new Error("Google sign-in failed.");
        ensureUserExists(username);
        enterAppWithSession(username);
      } catch (err) {
        showError(err?.message || "Google sign-in unavailable.");
      }
    });
  }

  if (appleBtn) {
    appleBtn.addEventListener("click", async () => {
      clearError();
      try {
        const mod = await import("/static/firebase_auth.js");
        const res = await mod.signInWithApple();
        if (res && res.pendingRedirect) return;
        showError("Apple sign-in requires redirect. Please try again.");
      } catch (err) {
        showError(err?.message || "Apple sign-in unavailable.");
      }
    });
  }

  // Signup submit
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      clearError();

      const u = (signupName?.value || "").trim();
      const p = signupPass?.value || "";

      if (u.length < 3) return showError("Username must be at least 3 characters.");
      if (p.length < 4) return showError("Password must be at least 4 characters.");

      const users = loadUsers();
      if (users.some(x => (x.name || "").toLowerCase() === u.toLowerCase())) {
        return showError("This username is already taken.");
      }

      users.push({ name: u, pass: p });
      saveUsers(users);

      enterAppWithSession(u);
    });
  }

  // Login submit
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      clearError();

      const u = (loginName?.value || "").trim();
      const p = loginPass?.value || "";

      const users = loadUsers();
      const found = users.find(
        x => (x.name || "").toLowerCase() === u.toLowerCase() && x.pass === p
      );

      if (!found) return showError("Incorrect username or password.");

      enterAppWithSession(found.name);
    });
  }

// ---- Forgot password (delegated; works even if button is rendered later) ----
document.addEventListener("click", async (e) => {
  const btn = e.target.closest("#forgot-pass-btn");
  if (!btn) return;

  if (typeof clearError === "function") clearError();

  const emailInput = document.getElementById("login-name"); // your login email input
  const email = (emailInput?.value || "").trim();

  if (!email) {
    if (typeof showError === "function") showError("Please enter your email to reset password.");
    else alert("Please enter your email to reset password.");
    return;
  }

  try {
    const fb = await import("firebase_auth.js");
    await fb.sendReset(email);
    alert("Password reset link sent to your email.");
  } catch (err) {
    console.error("Reset error:", err);
    if (typeof showError === "function") showError("Failed to send reset email. Try again.");
    else alert("Failed to send reset email. Try again.");
  }
});

  // ---- Auto-enter if session exists and user exists ----
  const session = localStorage.getItem("qiraah_session");
  if (session) {
    const users = loadUsers();
    const exists = users.some(
      x => (x.name || "").toLowerCase() === session.toLowerCase()
    );

    if (exists) {
      // IMPORTANT: use the SAME flow as login/signup
      enterAppWithSession(session);
      return;
    } else {
      // stale session
      localStorage.removeItem("qiraah_session");
    }
  }

  // If returning from provider redirect, finish sign-in.
  tryHandleRedirectResults().then((handled) => {
    if (!handled) showStart();
  });

});
