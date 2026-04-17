import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js"
import { getFirestore, collection, getDocs, deleteDoc, doc, onSnapshot, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js"

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
  const errorModal = document.getElementById("error-modal")
  const errorClose = document.getElementById("error-close")
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

  function restoreReturn() {
    const raw = sessionStorage.getItem("memoryReturn")
    if (!raw) return
    sessionStorage.removeItem("memoryReturn")
    const { scent, emotion } = JSON.parse(raw)
    const folders = document.querySelectorAll(".memory-folder")
    folders.forEach(folder => {
      const mems = JSON.parse(folder.dataset.memories || "[]")
      const match = mems.find(m => m.scent === scent && m.emotion === emotion)
      if (match) {
        folder.click()
        setTimeout(() => {
          const fileName = `${scent || "unknown"}_${emotion || "unknown"}.txt`
          document.querySelectorAll(".file-unit").forEach(unit => {
            const lbl = unit.querySelector(".file-label")
            if (lbl && lbl.textContent === fileName) unit.click()
          })
        }, 100)
      }
    })
  }


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

  function openFileView(mem, category, folder, corrupted = false) {
    const corruptedVivid = Math.random() < 0.5 ? 0 : 0.5
    const displayMem = corrupted ? {
      ...mem,
      scent: corruptText(mem.scent),
      emotion: corruptText(mem.emotion),
      text: corruptText(mem.text),
    } : mem

    popupContent.className = "popup-body text-view"

    const ts = mem.timestamp?.toDate ? mem.timestamp.toDate() : mem.timestamp ? new Date(mem.timestamp) : null
    const dateStr = ts ? ts.toLocaleString() : "—"

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
        ${corrupted ? "filter: contrast(1.2);" : ""}
      ">
        <div style="margin-bottom: 4px; opacity:.5; text-transform:uppercase; letter-spacing:.08em; font-size:.6rem;">${corrupted ? `<span data-corrupt="${category}">${corruptText(category)}</span>` : category}</div>
        <div style="margin-bottom: 4px;">${corrupted ? `<span data-corrupt="scent">${corruptText("scent")}</span>` : "scent"}: ${corrupted ? `<span data-corrupt="${mem.scent || "—"}">${corruptText(mem.scent || "—")}</span>` : (mem.scent || "—")}</div>
        <div style="margin-bottom: 4px;">${corrupted ? `<span data-corrupt="emotion">${corruptText("emotion")}</span>` : "emotion"}: ${corrupted ? `<span data-corrupt="${mem.emotion || "—"}">${corruptText(mem.emotion || "—")}</span>` : (mem.emotion || "—")}</div>
        <div style="margin-bottom: 16px; display:flex; align-items:center; gap:8px;">
          <span>${corrupted ? `<span data-corrupt="vividness:">${corruptText("vividness:")}</span>` : "vividness:"}</span>
          <div style="position:relative; width:80px; height:14px; border:1px solid white; box-sizing:border-box; flex-shrink:0;">
            <div style="height:100%; width:${corrupted ? (corruptedVivid / 5) * 100 : ((mem.vividness || 0) / 5) * 100}%; background:white;"></div>
          </div>
          <span>${corrupted ? corruptedVivid : (mem.vividness || "—")}</span>
        </div>

        ${corrupted ? `
        <div style="line-height:1.8;">
          ${(displayMem.text || "").split(' ').filter(w => w).map(w => `<span style="background:white;color:transparent;border-radius:1px;display:inline-block;">${w}</span>`).join(' ')}
        </div>
        ` : `
        <div style="line-height:1.8;">${mem.text || ""}</div>
        `}

        <div style="margin-top: 24px; display:flex; justify-content:center; gap:8px;">
          ${!corrupted && (mem.image || mem.mov) ? `
          <button id="lookIntoBtn" style="background:none;border:1px solid white;color:white;font-family:'Reddit Mono',monospace;font-size:.6rem;padding:4px 12px;cursor:pointer;">look into memory</button>
          ` : ""}
          <button id="suppressFileBtn" style="background:none;border:1px solid white;color:white;font-family:'Reddit Mono',monospace;font-size:.6rem;padding:4px 12px;cursor:pointer;">${corrupted ? `<span data-corrupt="forget memory">${corruptText("forget memory")}</span>` : "forget memory"}</button>
        </div>
        ${corrupted ? `
        <div style="margin-top: 12px; text-align:center; opacity:.4; font-size:.6rem;"><span data-corrupt="file corrupted — data unreadable">${corruptText("file corrupted — data unreadable")}</span></div>
        ` : `
        <div style="margin-top: 12px; text-align:center; opacity:.5; font-size:.6rem;">logged: ${dateStr}</div>
        `}
      </div>
    `

    popupContent.innerHTML = `
      <div class="file-view-wrapper">
        <div class="file-blur-layer">${contentHTML}</div>
        <div class="file-clear-layer"></div>
      </div>
    `

    // clone blur layer into clear layer (strip IDs to avoid duplicates)
    const fileWrapper = popupContent.querySelector(".file-view-wrapper")
    const blurLayer = fileWrapper.querySelector(".file-blur-layer")
    const clearLayer = fileWrapper.querySelector(".file-clear-layer")
    const clone = blurLayer.cloneNode(true)
    clone.querySelectorAll("[id]").forEach(el => el.removeAttribute("id"))
    clearLayer.appendChild(clone)

    const vivid = corrupted ? 0 : (parseFloat(mem.vividness) || 0)
    if (!corrupted && vivid < 4.5) {
      const stepsDown = 4.5 - vivid
      const baseBlur = Math.min(2, stepsDown * 0.6)
      const revealRadius = Math.max(100, 160 - stepsDown * 10)
      fileWrapper.classList.add("blurred")
      fileWrapper.style.setProperty("--base-blur", `${baseBlur}px`)
      fileWrapper.style.setProperty("--reveal-radius", `${revealRadius}px`)
      fileWrapper.style.setProperty("--x", "50%")
      fileWrapper.style.setProperty("--y", "50%")
      fileWrapper.addEventListener("mousemove", (e) => {
        const rect = fileWrapper.getBoundingClientRect()
        fileWrapper.style.setProperty("--x", `${e.clientX - rect.left}px`)
        fileWrapper.style.setProperty("--y", `${e.clientY - rect.top}px`)
      })
    }

    if (corrupted) {
      const rawFileName = `${mem.scent || "unknown"}_${mem.emotion || "unknown"}.txt`
      const titleEl2 = popupHeader.querySelector(".popup-title")
      const glitchInterval = setInterval(() => {
        fileWrapper.querySelectorAll("[data-corrupt]").forEach(el => {
          el.textContent = corruptText(el.dataset.corrupt)
        })
        if (titleEl2) titleEl2.textContent = corruptText(rawFileName)
        document.title = corruptText(rawFileName)
      }, 120)
      const closeObserver = new MutationObserver(() => {
        if (!document.contains(fileWrapper)) { clearInterval(glitchInterval); closeObserver.disconnect() }
      })
      closeObserver.observe(document.body, { childList: true, subtree: true })
    }

    document.getElementById("suppressFileBtn").addEventListener("click", () => {
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
        msgText.textContent = "memories can be suppressed, but not always forgotten"
        const msgBtns = document.createElement("div")
        msgBtns.style.cssText = "display:flex; gap:10px;"
        const rememberBtn = document.createElement("button")
        rememberBtn.textContent = "remember"
        rememberBtn.style.cssText = `background:none;border:1px solid white;color:white;font-family:'Reddit Mono',monospace;font-size:.6rem;padding:4px 14px;cursor:pointer;`
        const suppressBtn = document.createElement("button")
        suppressBtn.textContent = "suppress"
        suppressBtn.style.cssText = `background:none;border:1px solid white;color:white;font-family:'Reddit Mono',monospace;font-size:.6rem;padding:4px 14px;cursor:pointer;`
        msgBtns.appendChild(rememberBtn)
        msgBtns.appendChild(suppressBtn)
        msgOverlay.appendChild(msgText)
        msgOverlay.appendChild(msgBtns)
        popupContent.appendChild(msgOverlay)
        requestAnimationFrame(() => { msgOverlay.style.opacity = "1" })
        rememberBtn.addEventListener("click", () => {
          msgOverlay.style.opacity = "0"
          setTimeout(() => msgOverlay.remove(), 400)
        })
        suppressBtn.addEventListener("click", () => {
          msgOverlay.style.opacity = "0"
          setTimeout(() => {
            msgOverlay.remove()
            const popupWindow = popup.querySelector(".popup-window")
            forgetMemory(mem, category)
            pixelDissolve(popupWindow, () => {
              popup.classList.remove("active")
              const backBtn = popupHeader.querySelector("#backBtn")
              if (backBtn) backBtn.remove()
            })
          }, 400)
        })
    })

    if (!corrupted && (mem.image || mem.mov)) {
      document.getElementById("lookIntoBtn")?.addEventListener("click", () => {
        sessionStorage.setItem("memoryImage", mem.mov || mem.image)
        sessionStorage.setItem("memoryImageType", mem.mov ? "video" : (mem.imageType || "image"))
        sessionStorage.setItem("memoryText", mem.text || "")
        sessionStorage.setItem("memoryVividness", mem.vividness ?? 5)
        sessionStorage.setItem("memoryReturn", JSON.stringify({ category, scent: mem.scent, emotion: mem.emotion }))
        transition.classList.add("active")
        setTimeout(() => window.location.href = "memory.html", 600)
      })
    }

    const rawName = mem.mov ? `${mem.scent}.mov` : `${mem.scent || "unknown"}_${mem.emotion || "unknown"}.txt`
    const fileName = corrupted ? corruptText(rawName.toLowerCase()) : rawName.toLowerCase()
    const titleEl = popupHeader.querySelector(".popup-title")
    if (titleEl) titleEl.textContent = fileName
    document.title = fileName

    const existingBack = popupHeader.querySelector("#backBtn")
    if (!existingBack) {
      const backBtn = document.createElement("span")
      backBtn.id = "backBtn"
      backBtn.textContent = "<"
      backBtn.style.cssText = "cursor:pointer;color:black;font-size:1rem;user-select:none;"
      backBtn.addEventListener("click", (e) => {
        e.stopPropagation()
        backBtn.remove()
        if (titleEl) titleEl.textContent = category
        folder.click()
      })
      popupHeader.insertBefore(backBtn, popupHeader.firstChild)
    }
  }

  function forgetMemory(mem, category) {
    byCategory[category] = (byCategory[category] || []).filter(m =>
      !(m.scent === mem.scent && m.emotion === mem.emotion && m.timestamp === mem.timestamp)
    )
    rebuildFolders()
    if (mem._docId) deleteDoc(doc(db, "memories", mem._docId))
  }

  function pixelDissolve(element, onReady) {
    const rect = element.getBoundingClientRect()
    html2canvas(element, { backgroundColor: null, logging: false }).then(snapshot => {
      snapshot.style.cssText = `position:fixed;top:${rect.top}px;left:${rect.left}px;width:${rect.width}px;height:${rect.height}px;z-index:10000;pointer-events:none;`
      document.body.appendChild(snapshot)
      if (onReady) onReady()
      const ctx = snapshot.getContext("2d")
      const pixelSize = 18
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
        for (let i = 0; i < 8 && index < pixels.length; i++, index++)
          ctx.clearRect(pixels[index].x, pixels[index].y, pixelSize, pixelSize)
        if (index >= pixels.length) { clearInterval(fill); snapshot.remove() }
      }, 16)
    })
  }

  function showErrorModal(mem, category, _fileUnit, folder) {
    const fileName = `${mem.scent || "unknown"}_${mem.emotion || "unknown"}.txt`
    document.getElementById("error-title").textContent = fileName
    errorModal.classList.add("active")
    errorModal.dataset.pendingCategory = category
    errorModal._pendingMem = mem
    errorModal._pendingFolder = folder
  }

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
      label.textContent = category
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
        title.textContent = category
        title.style.cssText = "color:black;font-size:.75rem;opacity:.6;"
        popupHeader.insertBefore(title, popupClose)

        popup.classList.add("active")

        const mems = JSON.parse(folder.dataset.memories)

        mems.forEach(mem => {

          const fileUnit = document.createElement("div")
          fileUnit.className = "file-unit"

          const vivid = parseFloat(mem.vividness) || 0
          fileUnit.style.opacity = vivid <= 1 ? 0.05 : Math.max(0.35, vivid / 5)

          const img = document.createElement("img")
          img.src = "file.png"
          img.className = "file"

          const lbl = document.createElement("span")
          lbl.className = "file-label"
          lbl.textContent = mem.mov
            ? `${mem.scent}.mov`
            : `${mem.scent || "unknown"}_${mem.emotion || "unknown"}.txt`

          fileUnit.appendChild(img)
          fileUnit.appendChild(lbl)

          fileUnit.addEventListener("click", () => {
            if (vivid <= 1) {
              showErrorModal(mem, category, fileUnit, folder)
              return
            }
            openFileView(mem, category, folder)
          })

          popupContent.appendChild(fileUnit)

        }) // end mems.forEach

      }) // end folder click

    }) // end Object.entries

  } // end rebuildFolders

  /* ==========================
     FIREBASE REAL-TIME LISTENER
  ========================== */

  Promise.all([
    getDocs(collection(db, "memories")).catch(() => ({ forEach: () => {} })),
    fetch("mock-archive.json").then(r => r.json()).catch(() => []),
    fetch("scents.json").then(r => r.json()).catch(() => ({}))
  ]).then(([snapshot, mockData, scentsData]) => {
    const validCategories = new Set(Object.keys(scentsData))
    snapshot.forEach(docSnap => {
      const mem = { ...docSnap.data(), _docId: docSnap.id }
      if (!mem.category || mem.category === "undefined") return
      if (!byCategory[mem.category]) byCategory[mem.category] = []
      byCategory[mem.category].push(mem)
    })
    mockData.forEach(mem => {
      if (!mem.category || !validCategories.has(mem.category)) return
      if (!byCategory[mem.category]) byCategory[mem.category] = []
      byCategory[mem.category].push({ ...mem, _mock: true })
    })
    rebuildFolders()
    restoreReturn()
  }).catch(err => {
    console.error("failed to load memories:", err)
  })

  /* ==========================
     NOTIFICATION SYSTEM
  ========================== */

  const notifToggle = document.getElementById("notif-toggle")
  const notifStack = document.getElementById("notif-stack")

  if (notifStack) {
    const emptyNotif = document.createElement("div")
    emptyNotif.id = "notif-empty"
    emptyNotif.className = "notif"
    emptyNotif.innerHTML = `<div class="notif-label">no recent memories</div>`
    notifStack.appendChild(emptyNotif)
    setTimeout(() => emptyNotif.classList.add("show"), 50)
  }

  if (notifToggle) notifToggle.addEventListener("click", () => {
    notifStack.classList.toggle("hidden")
  })

  const pageLoadTime = Date.now()
  const fiveMinutesAgo = pageLoadTime - 5 * 60 * 1000
  const notifQuery = query(collection(db, "memories"), where("timestamp", ">", fiveMinutesAgo))

  onSnapshot(notifQuery, snapshot => {
    snapshot.docChanges().forEach(change => {
      if (change.type !== "added") return
      if (!notifToggle || !notifStack) return
      const mem = { ...change.doc.data(), _docId: change.doc.id }
      if (!mem.category || mem.category === "undefined") return
      const isNew = mem.timestamp > pageLoadTime
      notifToggle.style.opacity = "1"
      if (isNew) notifStack.classList.remove("hidden")
      const emptyEl = document.getElementById("notif-empty")
      if (emptyEl) emptyEl.remove()

      // inject into the matching folder's dataset so locate file works
      let targetFolder = null
      document.querySelectorAll(".memory-folder").forEach(f => {
        const span = f.querySelector("span")
        if (span && span.textContent === mem.category) targetFolder = f
      })
      if (targetFolder) {
        const existing = JSON.parse(targetFolder.dataset.memories || "[]")
        if (!existing.find(m => m._docId === mem._docId)) {
          existing.push(mem)
          targetFolder.dataset.memories = JSON.stringify(existing)
        }
      } else {
        if (!byCategory[mem.category]) byCategory[mem.category] = []
        byCategory[mem.category].push(mem)
        rebuildFolders()
      }
      const notif = document.createElement("div")
      notif.className = "notif"
      notif.innerHTML = `
        <div class="notif-label">memory archived</div>
        <div class="notif-scent">${mem.scent || "—"}</div>
        <div class="notif-emotion">${mem.emotion || "—"}</div>
        <button class="notif-locate">locate file</button>
      `
      notifStack.appendChild(notif)
      setTimeout(() => notif.classList.add("show"), 50)

      notif.querySelector(".notif-locate").addEventListener("click", () => {
        notifStack.classList.add("hidden")
        const fileName = `${mem.scent || "unknown"}_${mem.emotion || "unknown"}.txt`
        const folders = document.querySelectorAll(".memory-folder")
        folders.forEach(folder => {
          const mems = JSON.parse(folder.dataset.memories || "[]")
          const match = mems.find(m => m.scent === mem.scent && m.emotion === mem.emotion)
          if (match) {
            folder.click()
            setTimeout(() => {
              document.querySelectorAll(".file-unit").forEach(unit => {
                const lbl = unit.querySelector(".file-label")
                if (lbl && lbl.textContent === fileName) unit.click()
              })
            }, 100)
          }
        })
      })
    })
  }, () => {})

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
    const backBtn = popupHeader.querySelector("#backBtn")
    if (backBtn) backBtn.remove()
  })

  popup.addEventListener("click", (e) => {
    if (e.target === popup) {
      popup.classList.remove("active")
      document.title = "archive"
      const backBtn = popupHeader.querySelector("#backBtn")
      if (backBtn) backBtn.remove()
    }
  })

  /* ==========================
     ERROR MODAL
  ========================== */

  if (errorClose) errorClose.addEventListener("click", () => errorModal.classList.remove("active"))
  if (errorModal) errorModal.addEventListener("click", (e) => { if (e.target === errorModal) errorModal.classList.remove("active") })
  const errorOk = document.getElementById("error-ok")
  if (errorOk) errorOk.addEventListener("click", () => errorModal.classList.remove("active"))

  const errorOpen = document.getElementById("error-open")
  if (errorOpen) errorOpen.addEventListener("click", () => {
    const mem = errorModal._pendingMem
    const category = errorModal.dataset.pendingCategory
    const folder = errorModal._pendingFolder
    errorModal.classList.remove("active")
    if (mem && category && folder) openFileView(mem, category, folder, true)
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
    width: 48px;
    height: 48px;
    object-fit: contain;
    cursor: pointer;
    z-index: 60000;
    opacity: .7;
    transition: opacity .2s;
  `
  warningBtn.addEventListener("mouseenter", () => warningBtn.style.opacity = "1")
  warningBtn.addEventListener("mouseleave", () => warningBtn.style.opacity = ".7")
  document.body.appendChild(warningBtn)

  warningBtn.addEventListener("click", (e) => {
    e.stopPropagation()
    spawnRandomError()
  })

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