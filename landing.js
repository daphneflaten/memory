document.addEventListener("DOMContentLoaded", () => {

  const folders = document.querySelectorAll(".memory-folder");
  const popup = document.getElementById("popup");
  const popupContent = document.getElementById("popup-content");
  const popupClose = document.getElementById("popup-close");
  const container = document.getElementById("particles");
  const transition = document.getElementById("transition");
  const errorModal = document.getElementById("error-modal");
  const errorClose = document.getElementById("error-close");
  const bgContainer = document.getElementById("background-folders");
  const randomErrorsContainer = document.getElementById("random-errors");

  /* ==========================
     STORE ALL ANIMATED OBJECTS
  ========================== */

  const animatedObjects = [];

  /* ==========================
     GENERATE BACKGROUND FOLDERS
  ========================== */

  for (let i = 0; i < 40; i++) {

    const folder = document.createElement("div");
    folder.className = "bg-folder";

    const img = document.createElement("img");
    img.src = "folder-closed.png";

    const size = 40 + Math.random() * 120;
    img.style.width = `${size}px`;

    folder.appendChild(img);

    let x = Math.random() * window.innerWidth;
    let y = Math.random() * window.innerHeight;

    folder.style.left = `${x}px`;
    folder.style.top = `${y}px`;
    folder.style.opacity = 0.05 + Math.random() * 0.8;

    bgContainer.appendChild(folder);

    animatedObjects.push({
      element: folder,
      x,
      y,
      vx: (Math.random() - 0.5) * 0.1,
      vy: (Math.random() - 0.5) * 0.1,
      width: size,
      height: size
    });
  }

  /* ==========================
     FLOATING CLICKABLE FOLDERS
  ========================== */

  folders.forEach(folder => {

    let x = Math.random() * (window.innerWidth - 120);
    let y = Math.random() * (window.innerHeight - 150);

    folder.style.left = `${x}px`;
    folder.style.top = `${y}px`;

    animatedObjects.push({
      element: folder,
      x,
      y,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      width: 120,
      height: 150
    });
  });

  /* ==========================
     SINGLE GLOBAL ANIMATION LOOP
  ========================== */

  function animate() {

    animatedObjects.forEach(obj => {

      obj.x += obj.vx;
      obj.y += obj.vy;

      if (obj.x <= 0 || obj.x >= window.innerWidth - obj.width) obj.vx *= -1;
      if (obj.y <= 0 || obj.y >= window.innerHeight - obj.height) obj.vy *= -1;

      obj.element.style.left = `${obj.x}px`;
      obj.element.style.top = `${obj.y}px`;
    });

    requestAnimationFrame(animate);
  }

  animate();

  /* ==========================
     FOLDER CLICK → BUILD POPUP
  ========================== */

  folders.forEach(folder => {

    folder.addEventListener("click", () => {

      popupContent.innerHTML = "";

      const files = JSON.parse(folder.dataset.files);

      files.forEach(file => {

        const fileUnit = document.createElement("div");
        fileUnit.className = "file-unit";

        const img = document.createElement("img");
        img.src = file.img;
        img.className = "file";

        const label = document.createElement("span");
        label.className = "file-label";
        label.textContent = file.label;

        fileUnit.appendChild(img);
        fileUnit.appendChild(label);

        fileUnit.addEventListener("click", () => {

          if (file.corrupted) {
            errorModal.classList.add("active");
          } else {
            transition.classList.add("active");
            setTimeout(() => {
              window.location.href = file.page;
            }, 600);
          }

        });

        popupContent.appendChild(fileUnit);
      });

      popup.classList.add("active");
    });

  });

  /* ==========================
     CLOSE POPUP
  ========================== */

  if (popupClose) {
    popupClose.addEventListener("click", () => {
      popup.classList.remove("active");
    });
  }

  popup.addEventListener("click", (e) => {
    if (e.target === popup) popup.classList.remove("active");
  });

  /* ==========================
     CLOSE ERROR MODAL
  ========================== */

  if (errorClose) {
    errorClose.addEventListener("click", () => {
      errorModal.classList.remove("active");
    });
  }

  if (errorModal) {
    errorModal.addEventListener("click", (e) => {
      if (e.target === errorModal) {
        errorModal.classList.remove("active");
      }
    });
  }

  const errorOk = document.getElementById("error-ok");
  if (errorOk) {
    errorOk.addEventListener("click", () => {
      errorModal.classList.remove("active");
    });
  }

  /* ==========================
     CLICK-TO-SPAWN RANDOM ERRORS
  ========================== */

  const errorMessages = [
    "im getting hungry",
    "ummmmmm i forget",
    "im kinda tired",
    "some memories should be forgotten",
    "memory cant always be remembered",
    "your memories from 2005 are disappearing",
    "some memories want to be forgotten",
  ];

  function spawnRandomError() {

    const message =
      errorMessages[Math.floor(Math.random() * errorMessages.length)];

    const errorBox = document.createElement("div");
    errorBox.className = "random-error";

    const x = Math.random() * (window.innerWidth - 360);
    const y = Math.random() * (window.innerHeight - 240);

    errorBox.style.left = `${x}px`;
    errorBox.style.top = `${y}px`;

    const header = document.createElement("div");
    header.className = "random-error-header";

    const close = document.createElement("div");
    close.className = "random-error-close";
    close.textContent = "×";

    header.appendChild(close);

    const body = document.createElement("div");
    body.className = "random-error-body";

    const title = document.createElement("h1");
    title.textContent = "ALERT";

    const text = document.createElement("p");
    text.textContent = message;

    const ok = document.createElement("button");
    ok.className = "random-error-ok";
    ok.textContent = "OK";

    body.appendChild(title);
    body.appendChild(text);
    body.appendChild(ok);

    errorBox.appendChild(header);
    errorBox.appendChild(body);

    close.addEventListener("click", () => errorBox.remove());
    ok.addEventListener("click", () => errorBox.remove());

    randomErrorsContainer.appendChild(errorBox);
  }

  document.addEventListener("click", (e) => {

    if (
      e.target.closest(".memory-folder") ||
      e.target.closest("#popup") ||
      e.target.closest(".random-error")
    ) return;

    spawnRandomError();
  });

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