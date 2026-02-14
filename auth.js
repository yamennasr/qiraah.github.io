window.addEventListener("DOMContentLoaded", () => {
  // Use your real auth UI container
  const startView = document.getElementById("start-view");

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
  

  // ---- Local accounts storage ----
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

  function startAppWithSession(username) {
    localStorage.setItem("qiraah_session", username);

    // hide start screen
    startView.style.display = "none";
    startView.style.pointerEvents = "none";

    // tell main.js to start
    window.dispatchEvent(new Event("qiraah:start"));
  }

  function showSignup() {
    clearError();
    formsWrap.classList.remove("hidden");
    signupForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
    signupName.focus();
  }

  function showLogin() {
    clearError();
    formsWrap.classList.remove("hidden");
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
    loginName.focus();
  }

  // ---- Button actions (show forms) ----
  createBtn.addEventListener("click", showSignup);
  loginBtn.addEventListener("click", showLogin);

  // ---- Signup submit ----
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    clearError();

    const u = signupName.value.trim();
    const p = signupPass.value;

    if (u.length < 3) return showError("Username must be at least 3 characters.");
    if (p.length < 4) return showError("Password must be at least 4 characters.");

    const users = loadUsers();
    if (users.some(x => x.name.toLowerCase() === u.toLowerCase())) {
      return showError("This username is already taken.");
    }

    users.push({ name: u, pass: p });
    saveUsers(users);

    startAppWithSession(u);
  });

  // ---- Login submit ----
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    clearError();

    const u = loginName.value.trim();
    const p = loginPass.value;

    const users = loadUsers();
    const found = users.find(x => x.name.toLowerCase() === u.toLowerCase() && x.pass === p);

    if (!found) return showError("Incorrect username or password.");

    startAppWithSession(found.name);
  });

  // ---- Auto-enter if session already exists ----
  const session = localStorage.getItem("qiraah_session");
  if (session) {
    startView.style.display = "none";
    window.dispatchEvent(new Event("qiraah:start"));
  } else {
    // show start screen
    startView.style.display = "flex";
  }
});

