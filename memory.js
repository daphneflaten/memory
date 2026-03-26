document.addEventListener("DOMContentLoaded", () => {

  const memory = document.getElementById("memory");
  const rememberBtn = document.getElementById("remember");
  const returnBtn = document.getElementById("return");
  const container = document.getElementById("particles");
  const transition = document.getElementById("transition");

  let blurAmount = 10;
  let focusRadius = 80;

  // set tab title from the file we came from
  const returnData = sessionStorage.getItem("memoryReturn")
  if (returnData) {
    try {
      const { scent, emotion } = JSON.parse(returnData)
      document.title = `${scent || "unknown"}_${emotion || "unknown"}.txt`
    } catch(e) {}
  }

  // build media element from sessionStorage
  const mediaData = sessionStorage.getItem("memoryImage");
  const mediaType = sessionStorage.getItem("memoryImageType");
  const vividness = parseFloat(sessionStorage.getItem("memoryVividness") ?? 5);
  const saturation = Math.round((vividness / 5) * 100);
  const baseFilter = `saturate(${saturation}%)`;
  const pixelSize = vividness >= 4.5 ? 0 : Math.round((4.5 - vividness) * 3);

  let mediaEl;
  const isEmbed = mediaData && (mediaData.includes("archive.org/embed") || mediaData.includes("archive.org/download"));
  const isVideo = mediaType === "video" || (mediaData && mediaData.startsWith("data:video"));

  if (mediaData && isEmbed) {
    const identifier = mediaData.match(/archive\.org\/(?:embed|download)\/([^/?]+)/)?.[1] || ""
    const iframe = document.createElement("iframe");
    iframe.src = `https://archive.org/embed/${identifier}?autoplay=1&start=0`;
    iframe.style.cssText = "position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:min(100vw, 177.78vh);height:min(100vh, 56.25vw);border:none;pointer-events:none;";
    iframe.allow = "autoplay";
    memory.appendChild(iframe);
    mediaEl = iframe;
  } else if (mediaData && isVideo) {
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

  let displayEl = mediaEl;

  if (mediaEl && pixelSize > 1 && !isVideo && !isEmbed) {
    const pw = Math.max(20, Math.floor(window.innerWidth / pixelSize));
    const ph = Math.max(20, Math.floor(window.innerHeight / pixelSize));
    const canvas = document.createElement("canvas");
    canvas.width = pw;
    canvas.height = ph;
    canvas.style.cssText = `position:absolute; top:0; left:0; width:100vw; height:100vh; image-rendering:pixelated; image-rendering:crisp-edges;`;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    function draw() { ctx.drawImage(mediaEl, 0, 0, pw, ph); }

    if (isVideo) {
      let looping = true;
      mediaEl.addEventListener("play", function loop() {
        if (!looping) return;
        draw();
        requestAnimationFrame(loop);
      });
      window.addEventListener("beforeunload", () => { looping = false; });
    } else {
      if (mediaEl.complete) draw();
      else mediaEl.addEventListener("load", draw);
    }

    // keep mediaEl in DOM but invisible so canvas can read it
    mediaEl.style.cssText = "position:absolute; opacity:0; pointer-events:none; width:1px; height:1px;";
    memory.appendChild(mediaEl);
    memory.appendChild(canvas);
    displayEl = canvas;
  } else if (mediaEl) {
    memory.appendChild(mediaEl);
  }

  if (displayEl) displayEl.style.filter = baseFilter;

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
    if (!displayEl) return;

    const rect = memory.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    displayEl.style.filter = `${baseFilter} blur(${blurAmount}px)`;

    displayEl.style.maskImage = `radial-gradient(circle ${focusRadius}px at ${x}px ${y}px, black 0%, transparent 100%)`;
    displayEl.style.webkitMaskImage = `radial-gradient(circle ${focusRadius}px at ${x}px ${y}px, black 0%, transparent 100%)`;
  });

  /* ==========================
     RESET ONLY IF LEAVING WINDOW
  ========================== */

  window.addEventListener("mouseleave", () => {
    memory.classList.remove("active");
    if (!mediaEl) return;
    if (displayEl) {
      displayEl.style.filter = baseFilter;
      displayEl.style.maskImage = "none";
      displayEl.style.webkitMaskImage = "none";
    }
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