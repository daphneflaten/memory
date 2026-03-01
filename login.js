const passwordInput = document.getElementById("password");
const button = document.getElementById("enter");
const error = document.getElementById("error");

/* your password */
const correctPassword = "m3m0ry";

button.addEventListener("click", checkPassword);
passwordInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") checkPassword();
});

function checkPassword() {
  if (passwordInput.value === correctPassword) {
    window.location.href = "landing.html";   // archive page
  } else {
    error.style.opacity = 1;
  }
}

