const loginBtn = document.getElementById("loginBtn");
const createAccountBtn = document.getElementById("createAccountBtn");

loginBtn.onclick = () => {
  const username = document.getElementById("username").value;

  localStorage.setItem("qiraah_session", username);

  enterApp(); // call function from main.js
};

createAccountBtn.onclick = () => {
  const username = document.getElementById("username").value;

  localStorage.setItem("qiraah_session", username);

  enterApp();
};
