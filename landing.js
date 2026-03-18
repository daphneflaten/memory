import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js"
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js"

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
    const size = 40 + Math.random() * 120
    img.style.width = `${size}px`
    folder.appendChild(img)
    let x = Math.random() * window.innerWidth
    let y = Math.random() * window.innerHeight
    folder.style.left = `${x}px`
    folder.style.top = `${y}px`
    folder.style.opacity = 0.05 + Math.random() * 0.8
    bgContainer.appendChild(folder)
    animatedObjects.push({ element: folder, x, y, vx: (Math.random() - 0.5) * 0.1, vy: (Math.random() - 0.5) * 0.1, width: size, height: size })
  }

  /* ==========================
     BUILD FOLDERS
  ========================== */

  const mockArchive = [
    { category: "M0M'S PURS3", scent: "caramel candy", emotion: "nostalgia", vividness: 4, text: "reminded me of sitting in the back seat on long drives, she'd always have those wrapped caramels in her purse" },
    { category: "M0M'S PURS3", scent: "hand lotion", emotion: "comfort", vividness: 5, text: "the exact smell of being hugged goodnight as a kid" },
    { category: "M0M'S PURS3", scent: "old leather wallet", emotion: "longing", vividness: 3, text: "my dad's wallet smelled like this, i haven't thought about that in years" },
    { category: "FORGOT+EN OBJ3ECTS", scent: "inside a pencil case", emotion: "bittersweet", vividness: 4, text: "first day of school every year, new pencils and a clean eraser" },
    { category: "FORGOT+EN OBJ3ECTS", scent: "long-unused suitcase", emotion: "melancholy", vividness: 3, text: "found my grandma's suitcase in the attic, it still smelled like her house" },
    { category: "FORGOT+EN OBJ3ECTS", scent: "shoebox under a bed", emotion: "curiosity", vividness: 2, text: "i used to keep letters and photos in a shoebox under my childhood bed" },
    { category: "WARM M4CHINES", scent: "hot dust from a radiator", emotion: "security", vividness: 5, text: "winter mornings before school, standing next to the radiator to warm up" },
    { category: "WARM M4CHINES", scent: "lamp that has been on all night", emotion: "loneliness", vividness: 3, text: "staying up too late reading, the lamp getting warm, everyone else asleep" },
    { category: "WARM M4CHINES", scent: "overheated laptop vent", emotion: "familiarity", vividness: 2, text: "late nights finishing homework, the laptop fan going full speed" },
    { category: "1N-BETWEEN SP4CES", scent: "inside an elevator", emotion: "unease", vividness: 3, text: "visiting someone in the hospital, the elevator smell mixed with cleaning chemicals" },
    { category: "1N-BETWEEN SP4CES", scent: "subway tunnel air", emotion: "anticipation", vividness: 4, text: "moving to a new city, the first time i took the subway alone" },
    { category: "1N-BETWEEN SP4CES", scent: "empty movie theater", emotion: "wonder", vividness: 5, text: "sneaking into a second movie as a teenager, the empty theater between screenings" },
    { category: "AFT3R THE RA1N", scent: "wet soil", emotion: "calm", vividness: 5, text: "digging in the garden with my mom after a storm, everything smelled clean" },
    { category: "AFT3R THE RA1N", scent: "rain on warm asphalt", emotion: "nostalgia", vividness: 4, text: "summer rain on the basketball court outside our apartment building" },
    { category: "AFT3R THE RA1N", scent: "rotting leaves in autumn", emotion: "melancholy", vividness: 3, text: "walking home from school in october, kicking wet leaves on the sidewalk" },
    { category: "0DD SMELL5", scent: "a candle just blown out", emotion: "bittersweet", vividness: 4, text: "birthday candles, the smoke after everyone sings, the wish already made" },
    { category: "0DD SMELL5", scent: "inside a halloween mask", emotion: "joy", vividness: 5, text: "the plastic smell of a halloween mask, running door to door in the dark" },
    { category: "0DD SMELL5", scent: "warm pennies in your hand", emotion: "curiosity", vividness: 2, text: "counting change as a kid to see if we had enough for the corner store" }
  ]

  const byCategory = {}

  mockArchive.forEach(mem => {
    if(!mem.category || mem.category === "undefined") return
    if(!byCategory[mem.category]) byCategory[mem.category] = []
    byCategory[mem.category].push(mem)
  })

  function rebuildFolders(){

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
      label.textContent = category.toLowerCase()

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
        if(existingTitle) existingTitle.remove()
        const existingBack = popupHeader.querySelector("#backBtn")
        if(existingBack) existingBack.remove()

        const title = document.createElement("span")
        title.className = "popup-title"
        title.textContent = category.toLowerCase()
        title.style.cssText = "color:black;font-size:.75rem;margin-left:10px;opacity:.6;"
        popupHeader.appendChild(title)

        const mems = JSON.parse(folder.dataset.memories)

        mems.forEach(mem => {

          const fileUnit = document.createElement("div")
          fileUnit.className = "file-unit"

          const img = document.createElement("img")
          img.src = "file.png"
          img.className = "file"

          const lbl = document.createElement("span")
          lbl.className = "file-label"
          lbl.textContent = `${mem.emotion || "unknown"}_${(mem.scent || "unknown").replace(/\s+/g, "_")}.txt`

          fileUnit.appendChild(img)
          fileUnit.appendChild(lbl)

          fileUnit.addEventListener("click", () => {

            popupContent.className = "popup-body text-view"

            const existingBack = popupHeader.querySelector("#backBtn")
            if(!existingBack){
              const backBtn = document.createElement("span")
              backBtn.id = "backBtn"
              backBtn.textContent = "<"
              backBtn.style.cssText = "cursor:pointer;color:black;font-size:1rem;margin-left:8px;user-select:none;"
              backBtn.addEventListener("click", (e)=>{
                e.stopPropagation()
                backBtn.remove()
                folder.click()
              })
              popupHeader.insertBefore(backBtn, popupHeader.querySelector("#popup-close").nextSibling)
            }

            popupContent.innerHTML = `
              <div style="
                color: white;
                padding: 16px;
                font-size: .75rem;
                line-height: 1.8;
                text-align: left;
                width: 100%;
                font-family: 'Reddit Mono', monospace;
                box-sizing: border-box;
              ">
                <div style="opacity:.4; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,.15); padding-bottom: 10px;">
                  ${mem.scent || "unknown"}.txt — ${new Date(mem.timestamp || Date.now()).toLocaleDateString()}
                </div>
                <div style="opacity:.5; margin-bottom: 4px;">scent: ${mem.scent || "—"}</div>
                <div style="opacity:.5; margin-bottom: 4px;">emotion: ${mem.emotion || "—"}</div>
                <div style="opacity:.5; margin-bottom: 16px;">vividness: ${mem.vividness || "—"} / 5</div>
                <div style="opacity:.9; white-space: pre-wrap;">${mem.text || "no memory logged."}</div>
              </div>
            `

          })

          popupContent.appendChild(fileUnit)

        })

        popup.classList.add("active")

      })

    })

  }

  rebuildFolders()

  /* ==========================
     FIREBASE REAL-TIME LISTENER
  ========================== */

onSnapshot(collection(db, "memories"), (snapshot) => {
  snapshot.docChanges().forEach(change => {
    if(change.type === "added"){
      const mem = change.doc.data()
      if(!mem.category || mem.category === "undefined") return
      if(!byCategory[mem.category]) byCategory[mem.category] = []
      const exists = byCategory[mem.category].some(m => m.timestamp === mem.timestamp && m.scent === mem.scent)
      if(!exists){
        byCategory[mem.category].push(mem)
        rebuildFolders()
        showNotification(mem)
      }
    }
  })
})
/* ==========================
   NOTIFICATION SYSTEM
========================== */

const notifToggle = document.createElement("div")
notifToggle.id = "notif-toggle"
notifToggle.textContent = "notifications ●"
document.body.appendChild(notifToggle)

const notifStack = document.createElement("div")
notifStack.id = "notif-stack"
document.body.appendChild(notifStack)

let notifsVisible = true
const notifLog = []

notifToggle.addEventListener("click", ()=>{
  notifsVisible = !notifsVisible
  notifToggle.textContent = notifsVisible ? "notifications ●" : "notifications ○"

  if(notifsVisible){
    notifStack.classList.remove("hidden")
    notifStack.innerHTML = ""
    notifLog.forEach(mem => addNotifToStack(mem, false))
  } else {
    notifStack.classList.add("hidden")
  }
})

function addNotifToStack(mem, animate){

  const notif = document.createElement("div")
  notif.className = "notif"
  if(!animate) notif.classList.add("show")

  notif.innerHTML = `
    <div class="notif-label">memory archived</div>
    <div class="notif-scent">${mem.scent || "unknown"}</div>
    <div class="notif-emotion">${mem.emotion || "—"}</div>
    <button class="notif-locate">locate file</button>
  `

  notif.querySelector(".notif-locate").addEventListener("click", (e)=>{
    e.stopPropagation()

    // find and open the matching folder
    const folders = document.querySelectorAll(".memory-folder")
    folders.forEach(folder => {
      const mems = JSON.parse(folder.dataset.memories || "[]")
      const match = mems.find(m => m.scent === mem.scent && m.emotion === mem.emotion && m.timestamp === mem.timestamp)
      if(match){
        // close notifs panel
        notifsVisible = false
        notifStack.classList.add("hidden")
        notifToggle.textContent = "notifications ○"

        // open the folder
        folder.click()

        // then find and click the matching file after folder opens
        setTimeout(()=>{
          const fileUnits = document.querySelectorAll(".file-unit")
          const fileName = `${mem.emotion || "unknown"}_${(mem.scent || "unknown").replace(/\s+/g, "_")}.txt`
          fileUnits.forEach(unit => {
            const lbl = unit.querySelector(".file-label")
            if(lbl && lbl.textContent === fileName){
              unit.click()
            }
          })
        }, 100)
      }
    })
  })

  notifStack.prepend(notif)

  if(animate){
    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        notif.classList.add("show")
      })
    })

    setTimeout(()=>{
      notif.classList.remove("show")
      notif.classList.add("hide")
      setTimeout(()=> notif.remove(), 400)
    }, 5000)
  }

}

function showNotification(mem){
  notifLog.unshift(mem)
  if(!notifsVisible) return
  addNotifToStack(mem, true)
}
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
    const backBtn = popupHeader.querySelector("#backBtn")
    if(backBtn) backBtn.remove()
  })

  popup.addEventListener("click", (e) => {
    if (e.target === popup) {
      popup.classList.remove("active")
      const backBtn = popupHeader.querySelector("#backBtn")
      if(backBtn) backBtn.remove()
    }
  })

  /* ==========================
     ERROR MODAL
  ========================== */

  if (errorClose) errorClose.addEventListener("click", () => errorModal.classList.remove("active"))
  if (errorModal) errorModal.addEventListener("click", (e) => { if (e.target === errorModal) errorModal.classList.remove("active") })
  const errorOk = document.getElementById("error-ok")
  if (errorOk) errorOk.addEventListener("click", () => errorModal.classList.remove("active"))

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
  body.appendChild(title)
  body.appendChild(text)
  body.appendChild(ok)
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
warningBtn.addEventListener("mouseenter", ()=> warningBtn.style.opacity = "1")
warningBtn.addEventListener("mouseleave", ()=> warningBtn.style.opacity = ".7")
document.body.appendChild(warningBtn)

warningBtn.addEventListener("click", (e)=>{
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