const container = document.getElementById("binary");

function spawnBit() {
  const bit = document.createElement("div");
  bit.className = "bit";

  bit.innerText = Math.random() > 0.5 ? "1" : "0";

  bit.style.left = Math.random() * window.innerWidth + "px";
  bit.style.top = Math.random() * window.innerHeight + "px";

  const duration = 4000 + Math.random() * 4000;
  bit.style.animationDuration = duration + "ms";

  container.appendChild(bit);

  setTimeout(() => bit.remove(), duration);
}

setInterval(spawnBit, 250);