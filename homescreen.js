window.addEventListener("load", () => {
  document.body.classList.add("page-visible");
});

window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("page-visible");
});

let currentSlide = 0;
let isAnimating = false;

function startCalibration() {

  document.body.classList.add("page-exit");

  setTimeout(() => {
    document.querySelector(".landing").classList.remove("active");
    document.querySelector(".onboarding").classList.add("active");
  }, 700);

}
const bgVideo = document.querySelector(".bg-video");

if(bgVideo){
  bgVideo.playbackRate = 0.6;
}
document.body.classList.add("page-visible");

function nextSlide() {
  if (isAnimating) return;

  const slides = document.querySelectorAll(".slide");

  if (currentSlide >= slides.length - 1) return;

  isAnimating = true;

  slides[currentSlide].classList.remove("active-slide");

  setTimeout(() => {
    currentSlide++;
    slides[currentSlide].classList.add("active-slide");
    isAnimating = false;
  }, 500);
}

function releaseScent(event) {
  event.stopPropagation();
  if (isAnimating) return;

  isAnimating = true;

  const screen = document.querySelector(".onboarding");
  const overlay = document.querySelector(".scent-overlay");

  screen.classList.add("fade-out");

  setTimeout(() => {
    overlay.classList.add("active");
  }, 600);

  setTimeout(() => {
    window.location.href = "scent1.html";
  }, 2800);
  document.addEventListener("DOMContentLoaded", () => {
  const bgVideo = document.querySelector(".bg-video");

  if (bgVideo) {
    bgVideo.muted = true;
    bgVideo.play().catch(() => {});
  }
});
}