const passwordInput = document.getElementById("password");
const button = document.getElementById("enter");
const error = document.getElementById("error");

// floating hint
const hint = document.createElement("div");
hint.textContent = "hint";
hint.style.cssText = `
  position: fixed;
  color: white;
  font-family: "Reddit Mono", monospace;
  font-size: .65rem;
  opacity: .35;
  cursor: pointer;
  user-select: none;
  letter-spacing: .08em;
  z-index: 100;
  transition: opacity .2s;
`;
document.body.appendChild(hint);

let hintX = Math.random() * (window.innerWidth - 60);
let hintY = Math.random() * (window.innerHeight - 30);
let hintVx = (Math.random() - 0.5) * 0.6;
let hintVy = (Math.random() - 0.5) * 0.6;
hint.style.left = hintX + "px";
hint.style.top  = hintY + "px";

hint.addEventListener("mouseenter", () => hint.style.opacity = "1");
hint.addEventListener("mouseleave", () => {
  hint.style.opacity = hint.dataset.revealed ? "1" : ".35";
});

hint.addEventListener("click", () => {
  hint.textContent = "m3m0ry";
  hint.dataset.revealed = "1";
  hint.style.opacity = "1";
});

(function animateHint() {
  hintX += hintVx;
  hintY += hintVy;
  if (hintX <= 0 || hintX >= window.innerWidth  - 60) hintVx *= -1;
  if (hintY <= 0 || hintY >= window.innerHeight - 30) hintVy *= -1;
  hint.style.left = hintX + "px";
  hint.style.top  = hintY + "px";
  requestAnimationFrame(animateHint);
})();

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

