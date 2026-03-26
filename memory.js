document.addEventListener("DOMContentLoaded", () => {

  const memory = document.getElementById("memory");
  const rememberBtn = document.getElementById("remember");
  const returnBtn = document.getElementById("return");
  const container = document.getElementById("particles");
  const transition = document.getElementById("transition");

  let blurAmount = 10;
  let focusRadius = 80;

  // build media element from sessionStorage
  const mediaData = sessionStorage.getItem("memoryImage");
  const mediaType = sessionStorage.getItem("memoryImageType");
  let mediaEl;
  const isVideo = mediaType === "video" || (mediaData && mediaData.startsWith("data:video"));
  if (mediaData && isVideo) {
    mediaEl = document.createElement("video");
    mediaEl.autoplay = true;
    mediaEl.muted = true;
    mediaEl.loop = true;
    mediaEl.playsInline = true;
    mediaEl.src = mediaData;
  } else if (mediaData) {
    mediaEl = document.createElement("img");
    mediaEl.src = mediaData;
  }
  if (mediaEl) memory.appendChild(mediaEl);

  /* ==========================
     FADE IN ON LOAD
  ========================== */

  window.addEventListener("load", () => {
    transition.classList.add("fade-out");
  });

  /* ==========================
     MEMORY REVEAL BEHAVIOR
  ========================== */

  memory.addEventListener("mouseenter", () => {
    memory.classList.add("active");
  });

  memory.addEventListener("mousemove", (e) => {
    if (!mediaEl) return;

    const rect = memory.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mediaEl.style.filter = `blur(${blurAmount}px)`;

    mediaEl.style.maskImage = `radial-gradient(circle ${focusRadius}px at ${x}px ${y}px, black 0%, transparent 100%)`;
    mediaEl.style.webkitMaskImage = `radial-gradient(circle ${focusRadius}px at ${x}px ${y}px, black 0%, transparent 100%)`;
  });

  /* ==========================
     RESET ONLY IF LEAVING WINDOW
  ========================== */

  window.addEventListener("mouseleave", () => {
    memory.classList.remove("active");
    if (!mediaEl) return;
    mediaEl.style.filter = "none";
    mediaEl.style.maskImage = "none";
    mediaEl.style.webkitMaskImage = "none";
  });

  /* ==========================
     REMEMBER HARDER
  ========================== */

  rememberBtn.addEventListener("click", () => {
    blurAmount = Math.max(2, blurAmount - 1.5);
    focusRadius += 15;
  });

  /* ==========================
     RETURN TO LANDING (FADE OUT)
  ========================== */

  returnBtn.addEventListener("click", () => {

    transition.classList.remove("fade-out");

    setTimeout(() => {
      window.location.href = "landing.html";
    }, 600);
  });

  /* ==========================
     FLOATING BUTTONS
  ========================== */

  const floatingUI = [];
  const elements = [rememberBtn, returnBtn];

  elements.forEach(el => {

    let x = Math.random() * (window.innerWidth - 150);
    let y = Math.random() * (window.innerHeight - 50);

    el.style.left = `${x}px`;
    el.style.top = `${y}px`;

    floatingUI.push({
      element: el,
      x,
      y,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      width: 150,
      height: 40
    });
  });

  function animateUI() {

    floatingUI.forEach(obj => {

      obj.x += obj.vx;
      obj.y += obj.vy;

      if (obj.x <= 0 || obj.x >= window.innerWidth - obj.width) {
        obj.vx *= -1;
      }

      if (obj.y <= 0 || obj.y >= window.innerHeight - obj.height) {
        obj.vy *= -1;
      }

      obj.element.style.left = `${obj.x}px`;
      obj.element.style.top = `${obj.y}px`;
    });

    requestAnimationFrame(animateUI);
  }

  animateUI();

  /* ==========================
     THROTTLED CURSOR PARTICLES
  ========================== */

  let lastParticle = 0;

  document.addEventListener("mousemove", (e) => {

    const now = Date.now();
    if (now - lastParticle < 30) return;
    lastParticle = now;

    const p = document.createElement("div");
    p.className = "particle";

    p.style.left = e.clientX + "px";
    p.style.top = e.clientY + "px";

    const size = Math.random() * 4 + 2;
    p.style.width = size + "px";
    p.style.height = size + "px";

    container.appendChild(p);
    setTimeout(() => p.remove(), 800);
  });

});