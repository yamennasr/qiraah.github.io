const loginBtn = document.getElementById("loginBtn");
const createAccountBtn = document.getElementById("createAccountBtn");

loginBtn.onclick = () => {
  const username = document.getElementById("username").value;

  localStorage.setItem("qiraah_session", username);

  enterApp(); 
};

createAccountBtn.onclick = () => {
  const username = document.getElementById("username").value;

  localStorage.setItem("qiraah_session", username);

  enterApp();
};
