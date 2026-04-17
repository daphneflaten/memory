import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js"
import { getFirestore, collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js"

const firebaseConfig = {
  apiKey: "AIzaSyCJ4VKbXyNI4wGPRXRefP_7xqzJIQ89F6s",
  authDomain: "m3m0ry-app.firebaseapp.com",
  projectId: "m3m0ry-app",
  storageBucket: "m3m0ry-app.firebasestorage.app",
  messagingSenderId: "299534378691",
  appId: "1:299534378691:web:cbaacdc1d6ea133209e476"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

document.addEventListener("DOMContentLoaded", () => {

  const popup = document.getElementById("popup")
  const popupContent = document.getElementById("popup-content")
  const popupClose = document.getElementById("popup-close")
  const popupHeader = document.querySelector(".popup-header")
  const transition = document.getElementById("transition")
  const bgContainer = document.getElementById("background-folders")
  const container = document.getElementById("particles")

  const animatedObjects = []
  const byCategory = {}

  // fade in on arrival
  transition.classList.add("active")
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { transition.classList.remove("active") })
  })

  /* ==========================
     CORRUPT TEXT
  ========================== */

  function corruptText(text) {
    if (!text) return text
    const map = {
      'a': '4', 'A': '4',
      'b': '6', 'B': '6',
      'd': '9', 'D': '9',
      'e': '3', 'E': '3',
      'g': '9', 'G': '9',
      'i': '1', 'I': '1',
      'l': '1', 'L': '1',
      'o': '0', 'O': '0',
      'q': '9', 'Q': '9',
      's': '5', 'S': '5',
      't': '7', 'T': '7',
      'z': '2', 'Z': '2',
    }
    return text.split('').map(char => {
      if (char === ' ') return ' '
      return (map[char] && Math.random() < 0.40) ? map[char] : char
    }).join('')
  }

  /* ==========================
     GLOBAL GLITCH INTERVAL
     Runs on all [data-corrupt] elements continuously
  ========================== */

  setInterval(() => {
    document.querySelectorAll("[data-corrupt]").forEach(el => {
      el.textContent = corruptText(el.dataset.corrupt)
    })
    document.title = corruptText("forgotten archive")
  }, 120)

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
     PIXEL DISSOLVE
  ========================== */

  function pixelDissolve(element, onReady) {
    const rect = element.getBoundingClientRect()
    html2canvas(element, { backgroundColor: null, logging: false }).then(snapshot => {
      snapshot.style.cssText = `position:fixed;top:${rect.top}px;left:${rect.left}px;width:${rect.width}px;height:${rect.height}px;z-index:10000;pointer-events:none;`
      document.body.appendChild(snapshot)
      if (onReady) onReady()
      const ctx = snapshot.getContext("2d")
      const pixelSize = 28
      const cols = Math.ceil(snapshot.width / pixelSize)
      const rows = Math.ceil(snapshot.height / pixelSize)
      const pixels = []
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          pixels.push({ x: c * pixelSize, y: r * pixelSize })
      for (let i = pixels.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pixels[i], pixels[j]] = [pixels[j], pixels[i]]
      }
      let index = 0
      const fill = setInterval(() => {
        for (let i = 0; i < 18 && index < pixels.length; i++, index++)
          ctx.clearRect(pixels[index].x, pixels[index].y, pixelSize, pixelSize)
        if (index >= pixels.length) { clearInterval(fill); snapshot.remove() }
      }, 16)
    })
  }

  /* ==========================
     FILE NAME DEDUPLICATION
  ========================== */

  function assignFileNames(mems) {
    const total = {}
    mems.forEach(mem => {
      const base = mem.mov
        ? `${mem.scent}.mov`
        : `${mem.scent || "unknown"}_${mem.emotion || "unknown"}.txt`
      total[base] = (total[base] || 0) + 1
    })
    const seen = {}
    return mems.map(mem => {
      const base = mem.mov
        ? `${mem.scent}.mov`
        : `${mem.scent || "unknown"}_${mem.emotion || "unknown"}.txt`
      if (total[base] === 1) return base
      seen[base] = (seen[base] || 0) + 1
      if (seen[base] === 1) return base
      const dot = base.lastIndexOf('.')
      return base.slice(0, dot) + ` (${seen[base]})` + base.slice(dot)
    })
  }

  /* ==========================
     ERASE PERMANENTLY
  ========================== */

  function eraseMemory(mem, category) {
    byCategory[category] = (byCategory[category] || []).filter(m =>
      !(m.scent === mem.scent && m.emotion === mem.emotion && m.timestamp === mem.timestamp)
    )
    rebuildFolders()
    if (mem._docId) deleteDoc(doc(db, "forgotten_memories", mem._docId))
  }

  /* ==========================
     OPEN FILE VIEW (always corrupted)
  ========================== */

  function openFileView(mem, category, folder) {
    popupContent.className = "popup-body text-view"

    const contentHTML = `
      <div style="
        color: white;
        padding: 16px;
        font-size: .75rem;
        line-height: 1.8;
        text-align: left;
        width: 100%;
        font-family: 'Reddit Mono', monospace;
        box-sizing: border-box;
        filter: contrast(1.2);
      ">
        <div style="margin-bottom: 4px; opacity:.5; text-transform:uppercase; letter-spacing:.08em; font-size:.6rem;"><span data-corrupt="${category}">${corruptText(category)}</span></div>
        <div style="margin-bottom: 4px;"><span data-corrupt="scent">${corruptText("scent")}</span>: <span data-corrupt="${mem.scent || "—"}">${corruptText(mem.scent || "—")}</span></div>
        <div style="margin-bottom: 4px;"><span data-corrupt="emotion">${corruptText("emotion")}</span>: <span data-corrupt="${mem.emotion || "—"}">${corruptText(mem.emotion || "—")}</span></div>
        <div style="margin-bottom: 16px; display:flex; align-items:center; gap:8px;">
          <span><span data-corrupt="vividness:">${corruptText("vividness:")}</span></span>
          <div style="position:relative; width:80px; height:14px; border:1px solid white; box-sizing:border-box; flex-shrink:0;">
            <div style="height:100%; width:0%; background:white;"></div>
          </div>
          <span>0</span>
        </div>
        <div style="line-height:1.8;">
          ${(mem.text || "").split(' ').filter(w => w).map(w => `<span style="background:white;color:transparent;border-radius:1px;display:inline-block;">${w}</span>`).join(' ')}
        </div>
        <div style="margin-top: 24px; display:flex; justify-content:center;">
          <button id="eraseBtn" style="background:none;border:1px solid white;color:white;font-family:'Reddit Mono',monospace;font-size:.6rem;padding:4px 12px;cursor:pointer;"><span data-corrupt="erase permanently">${corruptText("erase permanently")}</span></button>
        </div>
        <div style="margin-top: 12px; text-align:center; opacity:.4; font-size:.6rem;"><span data-corrupt="file corrupted — data unreadable">${corruptText("file corrupted — data unreadable")}</span></div>
      </div>
    `

    popupContent.innerHTML = contentHTML

    const rawFileName = `${mem.scent || "unknown"}_${mem.emotion || "unknown"}.txt`
    const titleEl = popupHeader.querySelector(".popup-title")
    if (titleEl) titleEl.dataset.corrupt = rawFileName

    const existingBack = popupHeader.querySelector("#backBtn")
    if (!existingBack) {
      const backBtn = document.createElement("span")
      backBtn.id = "backBtn"
      backBtn.textContent = "<"
      backBtn.style.cssText = "cursor:pointer;color:black;font-size:1rem;user-select:none;"
      backBtn.addEventListener("click", (e) => {
        e.stopPropagation()
        backBtn.remove()
        if (titleEl) titleEl.textContent = corruptText(category)
        folder.click()
      })
      popupHeader.insertBefore(backBtn, popupHeader.firstChild)
    }

    document.getElementById("eraseBtn").addEventListener("click", () => {
      popupContent.style.position = "relative"
      const msgOverlay = document.createElement("div")
      msgOverlay.style.cssText = `
        position: absolute; inset: 0; display: flex; flex-direction: column;
        align-items: center; justify-content: center; text-align: center; padding: 32px;
        background: rgba(0,0,0,.9); color: white; font-family: 'Reddit Mono', monospace;
        font-size: .75rem; line-height: 1.8; z-index: 10;
        opacity: 0; transition: opacity .4s ease; gap: 20px;
      `
      const msgText = document.createElement("div")
      msgText.setAttribute("data-corrupt", "this cannot be undone")
      msgText.textContent = corruptText("this cannot be undone")
      const msgBtns = document.createElement("div")
      msgBtns.style.cssText = "display:flex; gap:10px;"
      const cancelBtn = document.createElement("button")
      cancelBtn.setAttribute("data-corrupt", "cancel")
      cancelBtn.textContent = corruptText("cancel")
      cancelBtn.style.cssText = `background:none;border:1px solid white;color:white;font-family:'Reddit Mono',monospace;font-size:.6rem;padding:4px 14px;cursor:pointer;`
      const confirmBtn = document.createElement("button")
      confirmBtn.setAttribute("data-corrupt", "erase")
      confirmBtn.textContent = corruptText("erase")
      confirmBtn.style.cssText = `background:none;border:1px solid white;color:white;font-family:'Reddit Mono',monospace;font-size:.6rem;padding:4px 14px;cursor:pointer;`
      msgBtns.appendChild(cancelBtn)
      msgBtns.appendChild(confirmBtn)
      msgOverlay.appendChild(msgText)
      msgOverlay.appendChild(msgBtns)
      popupContent.appendChild(msgOverlay)
      requestAnimationFrame(() => { msgOverlay.style.opacity = "1" })

      cancelBtn.addEventListener("click", () => {
        msgOverlay.style.opacity = "0"
        setTimeout(() => msgOverlay.remove(), 400)
      })
      confirmBtn.addEventListener("click", () => {
        msgOverlay.style.opacity = "0"
        setTimeout(() => {
          msgOverlay.remove()
          const popupWindow = popup.querySelector(".popup-window")
          eraseMemory(mem, category)
          pixelDissolve(popupWindow, () => {
            popup.classList.remove("active")
            const backBtn = popupHeader.querySelector("#backBtn")
            if (backBtn) backBtn.remove()
          })
        }, 400)
      })
    })
  }

  /* ==========================
     BUILD FOLDERS
  ========================== */

  function rebuildFolders() {
    document.querySelectorAll(".memory-folder").forEach(f => f.remove())
    const filtered = animatedObjects.filter(o => !o.element.classList.contains("memory-folder"))
    animatedObjects.length = 0
    filtered.forEach(o => animatedObjects.push(o))

    Object.entries(byCategory).forEach(([category, memories]) => {
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
      label.setAttribute("data-corrupt", category)
      label.textContent = corruptText(category)
      label.style.textTransform = "uppercase"

      folder.appendChild(closed)
      folder.appendChild(open)
      folder.appendChild(label)
      folder.dataset.memories = JSON.stringify(memories)
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
        const existingBack = popupHeader.querySelector("#backBtn")
        if (existingBack) existingBack.remove()

        const title = document.createElement("span")
        title.className = "popup-title"
        title.setAttribute("data-corrupt", category)
        title.textContent = corruptText(category)
        title.style.cssText = "color:black;font-size:.75rem;opacity:.6;"
        popupHeader.insertBefore(title, popupClose)

        popup.classList.add("active")

        const mems = JSON.parse(folder.dataset.memories)
        const fileNames = assignFileNames(mems)

        mems.forEach((mem, idx) => {
          const fileUnit = document.createElement("div")
          fileUnit.className = "file-unit"
          fileUnit.style.opacity = "0.35"

          const img = document.createElement("img")
          img.src = "file.png"
          img.className = "file"

          const displayName = fileNames[idx]

          const lbl = document.createElement("span")
          lbl.className = "file-label"
          lbl.setAttribute("data-corrupt", displayName)
          lbl.textContent = corruptText(displayName)

          fileUnit.appendChild(img)
          fileUnit.appendChild(lbl)

          fileUnit.addEventListener("click", () => openFileView(mem, category, folder))

          popupContent.appendChild(fileUnit)
        })
      })
    })
  }

  /* ==========================
     LOAD FROM forgotten_memories + mock
  ========================== */

  Promise.all([
    getDocs(collection(db, "forgotten_memories")).catch(() => ({ forEach: () => {} })),
    fetch("mock-forgotten.json").then(r => r.json()).catch(() => [])
  ]).then(([snapshot, mockData]) => {
    snapshot.forEach(docSnap => {
      const mem = { ...docSnap.data(), _docId: docSnap.id }
      if (!mem.category || mem.category === "undefined") return
      if (!byCategory[mem.category]) byCategory[mem.category] = []
      byCategory[mem.category].push(mem)
    })
    mockData.forEach(mem => {
      if (!mem.category) return
      if (!byCategory[mem.category]) byCategory[mem.category] = []
      byCategory[mem.category].push({ ...mem, _mock: true })
    })
    rebuildFolders()
  }).catch(err => {
    console.error("failed to load forgotten memories:", err)
  })

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
    document.title = corruptText("forgotten archive")
    const backBtn = popupHeader.querySelector("#backBtn")
    if (backBtn) backBtn.remove()
  })

  popup.addEventListener("click", (e) => {
    if (e.target === popup) {
      popup.classList.remove("active")
      document.title = corruptText("forgotten archive")
      const backBtn = popupHeader.querySelector("#backBtn")
      if (backBtn) backBtn.remove()
    }
  })

  /* ==========================
     NAVIGATION
  ========================== */

  const archiveLink = document.getElementById("archive-link")
  if (archiveLink) {
    archiveLink.addEventListener("click", (e) => {
      e.preventDefault()
      transition.classList.add("active")
      setTimeout(() => { window.location.href = "archive.html" }, 600)
    })
  }

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
