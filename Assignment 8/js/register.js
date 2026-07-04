const registerForm = document.querySelector("form");

registerForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (username === "" || password === "") {
    alert("Please enter your details");
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || [];

  // User already exists
  const userExists = users.some(user => user.username === username);

  if (userExists) {
    alert("User already exists. Please login.");
    return;
  }

  const newUser = {

    id: Date.now(),

    username: username,

    password: password,

    transactions: [],

    theme: "dark"

};

  users.push(newUser);

  localStorage.setItem("users", JSON.stringify(users));

  alert("Registration Successful");

  window.location.href = "index.html";
});
