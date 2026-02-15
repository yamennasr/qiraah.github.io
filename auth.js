console.log("AUTH BEFORE:", localStorage.getItem("qiraah_session"));

window.addEventListener("DOMContentLoaded", () => {
  console.log("AUTH sees session:", localStorage.getItem("qiraah_session"));
  const startView = document.getElementById("start-view");
  const appView = document.getElementById("app-view");

  const createBtn = document.getElementById("create-account-btn");
  const loginBtn = document.getElementById("login-btn");

  const formsWrap = document.getElementById("auth-forms");
  const signupForm = document.getElementById("signup-form");
  const loginForm = document.getElementById("login-form");

  const signupName = document.getElementById("signup-name");
  const signupPass = document.getElementById("signup-pass");
  const loginName = document.getElementById("login-name");
  const loginPass = document.getElementById("login-pass");

  const errorEl = document.getElementById("auth-error");

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

  // Buttons (show forms)
  if (createBtn) createBtn.addEventListener("click", showSignup);
  if (loginBtn) loginBtn.addEventListener("click", showLogin);

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

  showStart();
});
