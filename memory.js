document.addEventListener("DOMContentLoaded", () => {

  const memory = document.getElementById("memory")
  const returnBtn = document.getElementById("return")
  const container = document.getElementById("particles")
  const transition = document.getElementById("transition")

  /* ==========================
     SET TAB TITLE
  ========================== */

  const title = sessionStorage.getItem("memoryTitle")
  if (title) document.title = `${title}.mov`

  /* ==========================
     BUILD VIDEO FROM SESSIONSTORAGE
  ========================== */

  const mediaSrc = sessionStorage.getItem("memoryImage")

  if (mediaSrc) {
    const isEmbed = mediaSrc.includes("archive.org/embed") || mediaSrc.includes("archive.org/download")

    if (isEmbed) {
      const identifier = mediaSrc.match(/archive\.org\/(?:embed|download)\/([^/?]+)/)?.[1] || ""
      const iframe = document.createElement("iframe")
      iframe.src = `https://archive.org/embed/${identifier}?autoplay=1&start=0`
      iframe.style.cssText = "position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:min(100vw, 177.78vh);height:min(100vh, 56.25vw);border:none;"
      iframe.allow = "autoplay"
      memory.appendChild(iframe)
      const block = document.createElement("div")
      block.className = "iframe-block"
      memory.appendChild(block)
    } else {
      const video = document.createElement("video")
      video.autoplay = true
      video.muted = true
      video.loop = true
      video.playsInline = true
      video.controls = false
      video.src = mediaSrc
      memory.appendChild(video)
    }
  }

  /* ==========================
     FADE IN ON LOAD
  ========================== */

  window.addEventListener("load", () => {
    transition.classList.add("fade-out")
  })

  /* ==========================
     FLASHLIGHT PEEPHOLE
  ========================== */

  const flashlight = document.getElementById("flashlight")
  let peepholeRadius = 100
  let mouseX = window.innerWidth / 2
  let mouseY = window.innerHeight / 2

  function updateFlashlight() {
    flashlight.style.background = `radial-gradient(circle ${peepholeRadius}px at ${mouseX}px ${mouseY}px, transparent 20%, rgba(0,0,0,0.97) 100%)`
  }

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX
    mouseY = e.clientY
    updateFlashlight()
  })

  /* ==========================
     REMEMBER HARDER BUTTON
  ========================== */

  const rememberBtn = document.getElementById("remember")

  rememberBtn.addEventListener("click", () => {
    peepholeRadius = Math.min(peepholeRadius + 60, 700)
    updateFlashlight()
  })

  let rx = Math.random() * (window.innerWidth - 180)
  let ry = Math.random() * (window.innerHeight - 50)
  rememberBtn.style.left = `${rx}px`
  rememberBtn.style.top = `${ry}px`

  let rvx = (Math.random() - 0.5) * 0.6
  let rvy = (Math.random() - 0.5) * 0.6

  function animateRememberBtn() {
    rx += rvx
    ry += rvy
    if (rx <= 0 || rx >= window.innerWidth - 180) rvx *= -1
    if (ry <= 0 || ry >= window.innerHeight - 50) rvy *= -1
    rememberBtn.style.left = `${rx}px`
    rememberBtn.style.top = `${ry}px`
    requestAnimationFrame(animateRememberBtn)
  }

  animateRememberBtn()

  /* ==========================
     RETURN TO ARCHIVE
  ========================== */

  returnBtn.addEventListener("click", () => {
    transition.classList.remove("fade-out")
    setTimeout(() => { window.location.href = "archive.html" }, 600)
  })

  /* ==========================
     FLOATING RETURN BUTTON
  ========================== */

  let x = Math.random() * (window.innerWidth - 150)
  let y = Math.random() * (window.innerHeight - 50)
  returnBtn.style.left = `${x}px`
  returnBtn.style.top = `${y}px`

  let vx = (Math.random() - 0.5) * 0.8
  let vy = (Math.random() - 0.5) * 0.8

  function animateBtn() {
    x += vx
    y += vy
    if (x <= 0 || x >= window.innerWidth - 150) vx *= -1
    if (y <= 0 || y >= window.innerHeight - 50) vy *= -1
    returnBtn.style.left = `${x}px`
    returnBtn.style.top = `${y}px`
    requestAnimationFrame(animateBtn)
  }

  animateBtn()

  /* ==========================
     LINKED MEMORIES (MEMEX TRAILS)
  ========================== */

  fetch("data.json")
    .then(r => r.json())
    .then(data => {
      const currentId = sessionStorage.getItem("memoryTitle")
      const current = data.find(m => m.id === currentId)
      if (!current || !current.linked || current.linked.length === 0) return

      current.linked.forEach(linkedId => {
        const linked = data.find(m => m.id === linkedId)
        if (!linked) return

        const el = document.createElement("div")
        el.className = "linked-memory"

        const icon = document.createElement("img")
        icon.src = "file.png"

        const label = document.createElement("span")
        label.textContent = linked.title.replace(/_/g, " ")

        el.appendChild(icon)
        el.appendChild(label)
        document.body.appendChild(el)

        let lx = Math.random() * (window.innerWidth - 80)
        let ly = Math.random() * (window.innerHeight - 80)
        let lvx = (Math.random() - 0.5) * 0.3
        let lvy = (Math.random() - 0.5) * 0.3

        el.style.left = `${lx}px`
        el.style.top = `${ly}px`

        function animateLinked() {
          const dx = mouseX - lx
          const dy = mouseY - ly
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist > 120) {
            lvx += (dx / dist) * 0.015
            lvy += (dy / dist) * 0.015
          }

          const speed = Math.sqrt(lvx * lvx + lvy * lvy)
          if (speed > 1.2) {
            lvx = (lvx / speed) * 1.2
            lvy = (lvy / speed) * 1.2
          }

          lx += lvx
          ly += lvy

          if (lx <= 0 || lx >= window.innerWidth - 80) lvx *= -1
          if (ly <= 0 || ly >= window.innerHeight - 60) lvy *= -1
          lx = Math.max(0, Math.min(lx, window.innerWidth - 80))
          ly = Math.max(0, Math.min(ly, window.innerHeight - 60))

          el.style.left = `${lx}px`
          el.style.top = `${ly}px`

          requestAnimationFrame(animateLinked)
        }

        animateLinked()

        el.addEventListener("click", () => {
          sessionStorage.setItem("memoryImage", linked.src || "")
          sessionStorage.setItem("memoryImageType", "video")
          sessionStorage.setItem("memoryTitle", linked.id)
          sessionStorage.setItem("memoryDate", linked.date || "")
          transition.classList.remove("fade-out")
          setTimeout(() => window.location.href = "memory.html", 600)
        })
      })
    })
    .catch(err => console.error("failed to load linked memories:", err))

  /* ==========================
     CURSOR PARTICLES
  ========================== */

  let lastParticle = 0

  document.addEventListener("mousemove", (e) => {
    const now = Date.now()
    if (now - lastParticle < 30) return
    lastParticle = now
    const p = document.createElement("div")
    p.className = "particle"
    p.style.left = e.clientX + "px"
    p.style.top = e.clientY + "px"
    const size = Math.random() * 4 + 2
    p.style.width = size + "px"
    p.style.height = size + "px"
    container.appendChild(p)
    setTimeout(() => p.remove(), 800)
  })

})
