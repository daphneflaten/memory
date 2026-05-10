document.addEventListener("DOMContentLoaded", () => {

  const popup = document.getElementById("popup")
  const popupContent = document.getElementById("popup-content")
  const popupClose = document.getElementById("popup-close")
  const popupHeader = document.querySelector(".popup-header")
  const transition = document.getElementById("transition")
  const bgContainer = document.getElementById("background-folders")
  const randomErrorsContainer = document.getElementById("random-errors")
  const container = document.getElementById("particles")

  const animatedObjects = []

  /* ==========================
     BACKGROUND FOLDERS
  ========================== */

  for (let i = 0; i < 40; i++) {
    const folder = document.createElement("div")
    folder.className = "bg-folder"
    const img = document.createElement("img")
    img.src = "folder-closed.png"
    const size = 60 + Math.random() * 120
    img.style.width = `${size}px`
    folder.appendChild(img)
    let x = Math.random() * window.innerWidth
    let y = Math.random() * window.innerHeight
    folder.style.left = `${x}px`
    folder.style.top = `${y}px`
    folder.style.opacity = 0.04 + Math.random() * 0.15
    folder.style.filter = "blur(6px)"
    bgContainer.appendChild(folder)
    animatedObjects.push({ element: folder, x, y, vx: (Math.random() - 0.5) * 0.1, vy: (Math.random() - 0.5) * 0.1, width: size, height: size })
  }

  /* ==========================
     BUILD FOLDERS
  ========================== */

  const byCategory = {}

  function rebuildFolders() {
    document.querySelectorAll(".memory-folder").forEach(f => f.remove())

    const filtered = animatedObjects.filter(o => !o.element.classList.contains("memory-folder"))
    animatedObjects.length = 0
    filtered.forEach(o => animatedObjects.push(o))

    Object.entries(byCategory).forEach(([category, videos]) => {
      const folder = document.createElement("div")
      folder.className = "memory-folder"
      folder.style.position = "absolute"

      const closed = document.createElement("img")
      closed.src = "folder-closed.png"
      closed.className = "closed"

      const open = document.createElement("img")
      open.src = "folder-open.png"
      open.className = "open"

      const label = document.createElement("span")
      label.textContent = category
      label.style.textTransform = "lowercase"

      folder.appendChild(closed)
      folder.appendChild(open)
      folder.appendChild(label)

      folder.dataset.videos = JSON.stringify(videos)
      document.body.appendChild(folder)

      let x = Math.random() * (window.innerWidth - 120)
      let y = Math.random() * (window.innerHeight - 150)
      folder.style.left = `${x}px`
      folder.style.top = `${y}px`

      animatedObjects.push({ element: folder, x, y, vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25, width: 120, height: 150 })

      folder.addEventListener("click", () => {
        popupContent.className = "popup-body"
        popupContent.innerHTML = ""

        const existingTitle = popupHeader.querySelector(".popup-title")
        if (existingTitle) existingTitle.remove()

        const title = document.createElement("span")
        title.className = "popup-title"
        title.textContent = category
        title.style.cssText = "color:black;font-size:.75rem;opacity:.6;"
        popupHeader.insertBefore(title, popupClose)

        popup.classList.add("active")

        const vids = JSON.parse(folder.dataset.videos).filter(v => v.src)

        vids.forEach(vid => {
          const fileUnit = document.createElement("div")
          fileUnit.className = "file-unit"

          const img = document.createElement("img")
          img.src = "file.png"
          img.className = "file"

          const lbl = document.createElement("span")
          lbl.className = "file-label"
          lbl.textContent = `${vid.title}.mov`

          fileUnit.appendChild(img)
          fileUnit.appendChild(lbl)

          fileUnit.addEventListener("click", () => {
            sessionStorage.setItem("memoryImage", vid.src)
            sessionStorage.setItem("memoryImageType", "video")
            sessionStorage.setItem("memoryTitle", vid.title)
            sessionStorage.setItem("memoryDate", vid.date || "")
            sessionStorage.setItem("memoryReturn", JSON.stringify({ category, title: vid.title }))
            transition.classList.add("active")
            setTimeout(() => window.location.href = "memory.html", 600)
          })

          popupContent.appendChild(fileUnit)
        })
      })
    })
  }

  /* ==========================
     LOAD FROM DATA.JSON
  ========================== */

  fetch("data.json")
    .then(r => r.json())
    .then(data => {
      data.forEach(vid => {
        if (!vid.category) return
        if (!byCategory[vid.category]) byCategory[vid.category] = []
        byCategory[vid.category].push(vid)
      })
      rebuildFolders()
    })
    .catch(err => console.error("failed to load data:", err))

  /* ==========================
     ANIMATION LOOP
  ========================== */

  function animate() {
    animatedObjects.forEach(obj => {
      obj.x += obj.vx
      obj.y += obj.vy
      if (obj.x <= 0 || obj.x >= window.innerWidth - obj.width) obj.vx *= -1
      if (obj.y <= 0 || obj.y >= window.innerHeight - obj.height) obj.vy *= -1
      obj.element.style.left = `${obj.x}px`
      obj.element.style.top = `${obj.y}px`
    })
    requestAnimationFrame(animate)
  }

  animate()

  /* ==========================
     CLOSE POPUP
  ========================== */

  if (popupClose) popupClose.addEventListener("click", () => {
    popup.classList.remove("active")
    document.title = "archive"
    const existingTitle = popupHeader.querySelector(".popup-title")
    if (existingTitle) existingTitle.remove()
  })

  popup.addEventListener("click", (e) => {
    if (e.target === popup) {
      popup.classList.remove("active")
      document.title = "archive"
      const existingTitle = popupHeader.querySelector(".popup-title")
      if (existingTitle) existingTitle.remove()
    }
  })

  /* ==========================
     RANDOM ERRORS
  ========================== */

  const errorMessages = [
    "im getting hungry",
    "ummmmmm i forget",
    "im kinda tired",
    "some memories should be forgotten",
    "memory cant always be remembered",
    "your memories from 2005 are disappearing",
    "some memories want to be forgotten",
    "sorry what were we doing",
    "i was just thinking about something else",
    "can we take a break",
    "i don't feel like remembering right now",
    "wait what did you just say",
    "i think i need a snack",
    "hold on i lost my train of thought",
    "this isn't important right now",
    "i wasn't listening",
    "can you remind me later",
    "i'm a little distracted",
    "i'll remember it eventually",
  ]

  function spawnRandomError() {
    const message = errorMessages[Math.floor(Math.random() * errorMessages.length)]
    const errorBox = document.createElement("div")
    errorBox.className = "random-error"
    const x = Math.random() * (window.innerWidth - 360)
    const y = Math.random() * (window.innerHeight - 240)
    errorBox.style.left = `${x}px`
    errorBox.style.top = `${y}px`
    const header = document.createElement("div")
    header.className = "random-error-header"
    const close = document.createElement("div")
    close.className = "random-error-close"
    close.textContent = "×"
    header.appendChild(close)
    const body = document.createElement("div")
    body.className = "random-error-body"
    const title = document.createElement("h1")
    title.textContent = "ALERT"
    const text = document.createElement("p")
    text.textContent = message
    const ok = document.createElement("button")
    ok.className = "random-error-ok"
    ok.textContent = "OK"
    const btnRow = document.createElement("div")
    btnRow.style.cssText = "display:flex; justify-content:center;"
    btnRow.appendChild(ok)
    body.appendChild(title)
    body.appendChild(text)
    body.appendChild(btnRow)
    errorBox.appendChild(header)
    errorBox.appendChild(body)
    close.addEventListener("click", () => errorBox.remove())
    ok.addEventListener("click", () => errorBox.remove())
    randomErrorsContainer.appendChild(errorBox)
  }

  const warningBtn = document.createElement("img")
  warningBtn.src = "warning.png"
  warningBtn.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 24px;
    width: 32px;
    height: 32px;
    object-fit: contain;
    cursor: pointer;
    z-index: 60000;
    opacity: .7;
    transition: opacity .2s;
  `
  warningBtn.addEventListener("mouseenter", () => warningBtn.style.opacity = "1")
  warningBtn.addEventListener("mouseleave", () => warningBtn.style.opacity = ".7")
  warningBtn.addEventListener("click", (e) => {
    e.stopPropagation()
    spawnRandomError()
  })
  document.body.appendChild(warningBtn)

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
