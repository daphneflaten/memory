window.addEventListener("load", () => {
  document.body.classList.add("page-visible");
});
document.addEventListener("DOMContentLoaded", async () => {

  document.body.classList.add("page-visible");

  const drawer = document.getElementById("drawer");

  const backdrop = document.getElementById("viewerBackdrop");
  const viewerTab = document.getElementById("viewerTab");
  const viewerBody = document.getElementById("viewerBody");

  const closeBtn = document.getElementById("closeViewer");
  const forgetBtn = document.getElementById("forgetBtn");

  const forgetWarning = document.getElementById("forgetWarning");
  const confirmForget = document.getElementById("confirmForget");
  const cancelForget = document.getElementById("cancelForget");

  const suppressOverlay = document.getElementById("suppressOverlay");
  const homeBtn = document.getElementById("homeBtn");

  let currentEntryIndex = null;

  /* -------- LOAD DATA -------- */

  const response = await fetch("data.json");
  const data = await response.json();

  let archive = JSON.parse(localStorage.getItem("m3m0ryArchive"));

  if (!archive || archive.length === 0) {
    archive = data.seedArchive || [];
    localStorage.setItem("m3m0ryArchive", JSON.stringify(archive));
  }

  /* -------- RENDER -------- */

  function renderArchive() {

    drawer.innerHTML = "";

    let storedArchive =
      JSON.parse(localStorage.getItem("m3m0ryArchive")) || [];

    if (!storedArchive.length) {
      drawer.innerHTML =
        "<p style='opacity:.5;text-align:center;'>no archived calibrations.</p>";
      return;
    }

    storedArchive = [...storedArchive].reverse();

    storedArchive.forEach((entry, index) => {

      const folder = document.createElement("div");
      folder.classList.add("folder");
      folder.style.zIndex = index;

      const tab = document.createElement("div");
      tab.classList.add("folder-tab");
      tab.textContent = entry.emotion;

      const randomOffset = Math.floor(Math.random() * 80) - 40;
      tab.style.left = `${60 + randomOffset}px`;

      const body = document.createElement("div");
      body.classList.add("folder-body");
      body.innerHTML = `<h2>${entry.scentId}</h2>`;

      folder.appendChild(tab);
      folder.appendChild(body);

      folder.addEventListener("click", () => {

        currentEntryIndex = storedArchive.length - 1 - index;

        viewerTab.textContent = entry.emotion;

        viewerBody.innerHTML = `
          <h2>${entry.scentId}</h2>
          <p style="margin-top:20px;">
            intensity ${entry.intensity || entry.vividness || ""}
          </p>
          <p style="margin-top:20px;">
            ${entry.reflection || "no reflection recorded."}
          </p>
        `;

        backdrop.classList.add("visible");
      });

      drawer.appendChild(folder);
    });
  }

  renderArchive();

  /* -------- CLOSE VIEWER -------- */

  closeBtn.addEventListener("click", () => {
    backdrop.classList.remove("visible");
  });

  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) {
      backdrop.classList.remove("visible");
    }
  });

  /* -------- FORGET FLOW -------- */

  forgetBtn.addEventListener("click", () => {
    forgetWarning.classList.add("visible");
  });

  cancelForget.addEventListener("click", () => {
    forgetWarning.classList.remove("visible");
  });

  confirmForget.addEventListener("click", () => {

    suppressOverlay.innerHTML = "";
    suppressOverlay.classList.add("active");

    const gridSize = 28;
    const totalCells = gridSize * gridSize;

    suppressOverlay.style.display = "grid";
    suppressOverlay.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    suppressOverlay.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;

    const cells = [];

    for (let i = 0; i < totalCells; i++) {
      const cell = document.createElement("div");
      cell.style.background = "white";
      cell.style.opacity = "0";
      cell.style.transition = "opacity 0.12s linear";
      suppressOverlay.appendChild(cell);
      cells.push(cell);
    }

    cells.sort(() => Math.random() - 0.5);

    cells.forEach((cell, i) => {
      setTimeout(() => {
        cell.style.opacity = "1";
      }, i * 2);
    });

    setTimeout(() => {

      let storedArchive =
        JSON.parse(localStorage.getItem("m3m0ryArchive")) || [];

      storedArchive.splice(currentEntryIndex, 1);
      localStorage.setItem("m3m0ryArchive", JSON.stringify(storedArchive));

      backdrop.classList.remove("visible");
      forgetWarning.classList.remove("visible");

      drawer.style.transition = "opacity 0.4s ease";
      drawer.style.opacity = "0";

      setTimeout(() => {

        renderArchive();
        drawer.style.opacity = "1";

        suppressOverlay.style.transition = "opacity 0.6s ease";
        suppressOverlay.style.opacity = "0";

        setTimeout(() => {
          suppressOverlay.classList.remove("active");
          suppressOverlay.style.display = "none";
          suppressOverlay.style.opacity = "1";
        }, 600);

      }, 400);

    }, totalCells * 2 + 120);

  });

  /* -------- MAIN MENU -------- */

homeBtn.addEventListener("click", () => {

  document.body.classList.add("page-exit");

  setTimeout(() => {
    window.location.href = "index.html";
  }, 800);

});
});