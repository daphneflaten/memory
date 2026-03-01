const memory = document.getElementById("memory");

memory.addEventListener("mouseenter", () => {

  const rect = memory.getBoundingClientRect();
  const text = memory.innerText;

  memory.style.visibility = "hidden";

  for (let i = 0; i < 350; i++) {   // ← MORE PARTICLES
    const particle = document.createElement("span");
    particle.className = "particle";

    particle.innerText = text[Math.floor(Math.random() * text.length)];

    /* spawn across the whole word */
    particle.style.left = rect.left + Math.random() * rect.width + "px";
    particle.style.top = rect.top + Math.random() * rect.height + "px";

    /* BIGGER explosion radius */
    const x = (Math.random() - 0.5) * 900 + "px";
    const y = (Math.random() - 0.5) * 700 + "px";

    particle.style.setProperty("--x", x);
    particle.style.setProperty("--y", y);

    /* random size variation = chaos */
    particle.style.fontSize = (Math.random() * 1.2 + 0.4) + "rem";

    /* random duration */
    const duration = 900 + Math.random() * 1400;
    particle.style.animationDuration = duration + "ms";

    document.body.appendChild(particle);

    setTimeout(() => particle.remove(), duration);
  }

  setTimeout(() => {
    memory.style.visibility = "visible";
  }, 2200);

});

const container = document.getElementById("particles");

document.addEventListener("mousemove", (e) => {

  const p = document.createElement("div");
  p.className = "particle";

  p.style.left = e.clientX + "px";
  p.style.top = e.clientY + "px";

  /* random softness */
  const size = Math.random() * 4 + 2;
  p.style.width = size + "px";
  p.style.height = size + "px";

  container.appendChild(p);

  setTimeout(() => p.remove(), 800);
});