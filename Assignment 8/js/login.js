const loginForm = document.querySelector("form");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  const users = JSON.parse(localStorage.getItem("users")) || [];

  const validUser = users.find(
    user => user.username === username && user.password === password
  );

  if (!validUser) {
    alert("Invalid username or password");
    return;
  }

  localStorage.setItem("currentUser", JSON.stringify(validUser));


  window.location.href = "Assignment 8/dashboard.html";
});
