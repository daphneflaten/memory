import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js"
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js"

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

let scentData
let selectedScent
let selectedCategory

let _touchStartX = 0
let _touchStartY = 0
document.addEventListener("touchstart", (e) => {
  _touchStartX = e.touches[0].clientX
  _touchStartY = e.touches[0].clientY
}, { passive: true })
document.addEventListener("touchmove", (e) => {
  const emotionNode = document.getElementById("emotionNode")
  if (!emotionNode || emotionNode.style.display === "none" || emotionNode.style.opacity === "0") return
  const dx = Math.abs(e.touches[0].clientX - _touchStartX)
  const dy = Math.abs(e.touches[0].clientY - _touchStartY)
  if (dx > dy) e.preventDefault()
}, { passive: false })
let selectedEmotion
let selectedVividness
let selectedMemoryText = ""

document.querySelector('.bg-video').playbackRate = .4

const categoryNode = document.getElementById("categoryNode")
const scentsBranch = document.getElementById("scentsBranch")
const analysisNode = document.getElementById("analysisNode")
const notesNode = document.getElementById("notesNode")
const emotionNode = document.getElementById("emotionNode")

const memoryPlaceholders = [
  "it reminded me of the time...",
  "i was maybe seven, and...",
  "every time i smell this i think of...",
  "i can't place exactly when, but...",
  "there was a kitchen, and someone was...",
  "it was summer, i think, and...",
  "i remember standing in a hallway...",
  "the first time i noticed this smell was...",
]

fetch("scents.json")
.then(res => res.json())
.then(data => {
  scentData = data

  const introScreen = document.getElementById("introScreen")

  introScreen.addEventListener("click", () => {
    document.querySelector('.bg-video').play().catch(() => {})
    introScreen.style.transition = "opacity .8s ease"
    introScreen.style.opacity = "0"
    setTimeout(() => {
      introScreen.remove()
      startCalibration()
    }, 800)
  })
})

/* ================= CATEGORY SCAN ================= */

function startCalibration() {
  const categoryLabel = document.getElementById("categoryLabel")
  categoryLabel.style.transition = "opacity .8s ease"
  setTimeout(() => { categoryLabel.style.opacity = "1" }, 200)
  categoryNode.style.transition = "opacity .8s ease, transform .7s ease"
  setTimeout(() => { categoryNode.style.opacity = "1" }, 500)
  runCategoryScan()
}

function runCategoryScan() {
  const categories = Object.keys(scentData)
  let cycles = 0
  let randomCategory

  const existingRedo = document.getElementById("redoBtn")
  if (existingRedo) existingRedo.remove()

  const categoryLabel = document.getElementById("categoryLabel")
  categoryLabel.innerText = "scanning scent categories..."
  categoryLabel.style.color = "white"

  // reset category node style in case it was in scent-selected state
  categoryNode.classList.remove("scent-selected")

  setTimeout(() => {
    const scan = setInterval(() => {
      randomCategory = categories[Math.floor(Math.random() * categories.length)]
      categoryNode.innerHTML = `<span class="category-name">${randomCategory}</span>`
      cycles++
      if (cycles > 14) {
        clearInterval(scan)
        finalizeCategory(randomCategory)
      }
    }, 120)
  }, 600)
}

const categoryDescriptions = {
  "M0M'S PURS3":         "smells from someone who took care of you",
  "WARM M4CHINES":       "electronics, appliances, the hum of daily life",
  "IN-BETWEEN SP4CES":   "hallways, waiting rooms, places you passed through",
  "AFT3R THE RA1N":      "the smell of the world after water",
  "CH1LDH00D PL4CES":    "rooms and corners from when you were small",
  "S0FT TH1NGS":         "fabric, skin, the things you press your face into",
  "PL4STIC + SYNTH3TIC": "new things, artificial things, manufactured smells",
  "SUMM3R H34T":         "pavement, sunscreen, the smell of long afternoons",
  "N1GHT T1ME":          "the dark, late hours, sleeping houses",
  "0DD SMELL5":          "smells that don't make sense until they do",
  "K1TCHEN M0MENTS":     "cooking, eating, someone making something for you",
  "0UTS1DE THE H0USE":   "the yard, the street, just past the front door",
  "CLO5E C0NTACT":       "the smell of people you were close to",
  "DIG1TAL L1FE":        "screens, devices, the smell of modern life",
}

function finalizeCategory(category) {
  selectedCategory = category
  const desc = categoryDescriptions[category] || ""
  categoryNode.innerHTML = `
    <span class="category-name">${category}</span>
    ${desc ? `<span class="category-desc">${desc}</span>` : ""}
  `

  const categoryLabel = document.getElementById("categoryLabel")
  categoryLabel.innerText = "scent category detected"
  categoryLabel.style.color = "white"

  updateNav("category")

  const redoBtn = document.createElement("button")
  redoBtn.id = "redoBtn"
  redoBtn.innerText = "re-roll category"
  redoBtn.style.cssText = `
    position: fixed;
    bottom: 160px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    opacity: 0;
    transition: opacity .5s ease;
    width: auto;
    padding: 8px 16px;
    font-size: var(--ts-size);
    white-space: nowrap;
  `
  document.body.appendChild(redoBtn)
  setTimeout(() => redoBtn.style.opacity = "1", 600)
  redoBtn.addEventListener("click", () => {
    redoBtn.remove()
    const continueBtn = document.getElementById("continueBtn")
    if (continueBtn) continueBtn.remove()
    runCategoryScan()
  })

  const continueBtn = document.createElement("button")
  continueBtn.id = "continueBtn"
  continueBtn.innerHTML = `<img src="arrow.png" alt="continue">`
  document.body.appendChild(continueBtn)
  setTimeout(() => { continueBtn.classList.add("show") }, 600)
  continueBtn.onclick = continueCalibration
}

/* ================= SCENT BRANCH ================= */

function continueCalibration() {
  const continueBtn = document.getElementById("continueBtn")
  if (continueBtn) continueBtn.remove()
  const redoBtn = document.getElementById("redoBtn")
  if (redoBtn) redoBtn.remove()
  document.getElementById("categoryLabel").style.opacity = "0"
  const desc = categoryNode.querySelector(".category-desc")
  if (desc) desc.remove()
  categoryNode.classList.add("active")
  setTimeout(() => { showBranches() }, 500)
}

function showBranches() {
  updateNav("scent")

  const scents = scentData[selectedCategory]
  scentsBranch.innerHTML = ""
  scentsBranch.style.opacity = "1"

  const prompt = document.createElement("div")
  prompt.className = "scent-prompt"
  prompt.innerText = "which scent feels familiar?"
  scentsBranch.appendChild(prompt)
  setTimeout(() => prompt.classList.add("show"), 200)

  const grid = document.createElement("div")
  grid.className = "scent-grid"
  scentsBranch.appendChild(grid)

  scents.forEach((scent, index) => {
    const btn = document.createElement("button")
    btn.innerText = scent.name
    btn.style.opacity = "0"
    btn.onclick = () => selectScent(scent)
    grid.appendChild(btn)
    setTimeout(() => { btn.style.opacity = "1" }, index * 350 + 400)
  })

}

/* ================= SCENT SELECT ================= */

function fitToThreeLines(el) {
  const lineHeight = parseFloat(getComputedStyle(el).fontSize) * 0.9
  const maxHeight = lineHeight * 3
  let size = parseFloat(getComputedStyle(el).fontSize)
  while (el.getBoundingClientRect().height > maxHeight + 1 && size > 12) {
    size -= 0.5
    el.style.fontSize = size + 'px'
  }
}

function selectScent(scent) {
  selectedScent = scent
  scentsBranch.style.opacity = "0"

  const categoryText = categoryNode.querySelector(".category-name")
  let current = categoryText.innerText
  let index = current.length

  function backspace() {
    if (index >= 0) {
      categoryText.innerHTML = current.substring(0, index) + `<span class="cursor">|</span>`
      index--
      setTimeout(backspace, 40)
    } else {
      typeScent()
    }
  }

  function typeScent() {
    categoryNode.classList.add("scent-selected")
    let text = selectedScent.name.toLowerCase()
    let char = 0

    function type() {
      if (char <= text.length) {
        categoryText.innerHTML = text.substring(0, char) + `<span class="cursor">|</span>`
        char++
        setTimeout(type, 40)
      } else {
        categoryText.innerHTML = text
        fitToThreeLines(categoryText)
        setTimeout(() => { startScentAnalysis() }, 300)
      }
    }
    type()
  }

  backspace()
}

/* ================= SCENT ANALYSIS ================= */

function startScentAnalysis() {
  scentsBranch.remove()
  analysisNode.style.opacity = "1"
  setTimeout(() => { generateNotes() }, 400)
}

function generateNotes() {
  updateNav("notes")

  analysisNode.innerHTML = ""
  notesNode.innerHTML = ""
  notesNode.classList.remove("hidden")

  const notes = selectedScent.notes
  const columns = [
    { type: "top",   values: notes.top   },
    { type: "heart", values: notes.heart },
    { type: "base",  values: notes.base  }
  ]

  let current = 0

  function showNext() {
    if (current >= columns.length) {
      setTimeout(() => {
        analysisNode.innerHTML = ""
        showEmotionContinue()
      }, 800)
      return
    }

    const col = columns[current]
    const el = document.createElement("div")
    el.className = "notes-column"
    el.innerHTML = `
      <span class="notes-type">${col.type}</span>
      ${col.values.map(v => `<span class="notes-value">${v}</span>`).join("")}
    `
    notesNode.appendChild(el)
    setTimeout(() => el.classList.add("show"), 50)
    current++
    setTimeout(showNext, 600)
  }

  setTimeout(showNext, 400)
}

/* ================= CONTINUE TO EMOTIONS ================= */

function showEmotionContinue() {
  const continueBtn = document.createElement("button")
  continueBtn.id = "continueBtn"
  continueBtn.innerHTML = `<img src="arrow.png" alt="continue">`
  document.body.appendChild(continueBtn)
  setTimeout(() => continueBtn.classList.add("show"), 100)
  continueBtn.onclick = showEmotionOptions
}

/* ================= EMOTION WHEEL ================= */

function showEmotionOptions() {
  const continueBtn = document.getElementById("continueBtn")
  if (continueBtn) continueBtn.remove()

  updateNav("emotion")

  analysisNode.style.opacity = "0"
  notesNode.style.opacity = "0"

  setTimeout(() => {
    analysisNode.innerHTML = ""
    notesNode.innerHTML = ""

    emotionNode.innerHTML = `
      <div class="emotion-ui">
        <p class="emotion-label">what does it make you feel?</p>
        <div class="picker-container">
          <div class="picker" id="picker"></div>
        </div>
      </div>
    `

    emotionNode.style.display = "flex"
    requestAnimationFrame(() => { emotionNode.style.opacity = "1" })

    buildEmotionPicker()

    const confirmBtn = document.createElement("button")
    confirmBtn.id = "confirmEmotion"
    confirmBtn.innerHTML = `<img src="arrow.png" alt="continue">`
    document.body.appendChild(confirmBtn)
    setTimeout(() => confirmBtn.classList.add("show"), 100)
    confirmBtn.onclick = showMemoryInput
  }, 400)
}

/* ================= BUILD PICKER ================= */

function buildEmotionPicker() {
  const emotions = [
    "nostalgia","comfort","calm","melancholy","curiosity","unease",
    "longing","warmth","serenity","anxiety",
    "sadness","joy","bittersweet","confusion","tension","relief",
    "security","loneliness","anticipation","fear",
    "wonder","tenderness","disgust","familiarity","detachment",
    "yearning","peace","embarrassment","surprise","emptiness"
  ]

  const picker = document.getElementById("picker")
  const itemHeight = 60
  const looped = [...emotions, ...emotions, ...emotions]

  looped.forEach(e => {
    const div = document.createElement("div")
    div.className = "picker-item"
    div.textContent = e
    picker.appendChild(div)
  })

  const totalHeight = itemHeight * emotions.length
  picker.scrollTop = totalHeight

  const items = document.querySelectorAll(".picker-item")

  function updateActive() {
    if (picker.scrollTop <= itemHeight * 2) {
      picker.scrollTop += totalHeight
    } else if (picker.scrollTop >= totalHeight * 2 - itemHeight * 2) {
      picker.scrollTop -= totalHeight
    }

    const center = picker.scrollTop + picker.offsetHeight / 2
    items.forEach((item, i) => {
      const itemCenter = i * itemHeight + itemHeight / 2
      const distance = Math.abs(center - itemCenter)
      const maxDist = itemHeight * 2.5
      const opacity = Math.max(0, 1 - distance / maxDist)
      item.style.opacity = opacity
      item.classList.toggle("active", distance < itemHeight / 2)
    })
  }

  picker.addEventListener("scroll", updateActive)
  updateActive()

  picker.addEventListener("touchmove", (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      const dx = Math.abs(touch.clientX - (picker._touchStartX || touch.clientX))
      const dy = Math.abs(touch.clientY - (picker._touchStartY || touch.clientY))
      if (dx > dy) e.preventDefault()
    }
  }, { passive: false })

  picker.addEventListener("touchstart", (e) => {
    picker._touchStartX = e.touches[0].clientX
    picker._touchStartY = e.touches[0].clientY
  }, { passive: true })
}

/* ================= MEMORY INPUT ================= */

function showMemoryInput() {
  const confirmBtn = document.getElementById("confirmEmotion")
  if (confirmBtn) confirmBtn.remove()

  const activeItem = document.querySelector(".picker-item.active")
  if (activeItem) selectedEmotion = activeItem.textContent

  updateNav("log")
  emotionNode.style.opacity = "0"

  setTimeout(() => { showMemorySlide1() }, 400)
}

function showMemorySlide1() {
  emotionNode.innerHTML = `
    <div class="memory-ui">
      <p class="memory-label">write what you remember</p>
      <textarea id="memoryInput"></textarea>
    </div>
  `
  emotionNode.style.display = "flex"
  emotionNode.style.opacity = "1"

  const textarea = document.getElementById("memoryInput")
  const shuffled = [...memoryPlaceholders].sort(() => Math.random() - 0.5)
  let pIdx = 0
  textarea.placeholder = shuffled[pIdx]
  const placeholderInterval = setInterval(() => {
    if (document.activeElement === textarea) return
    pIdx = (pIdx + 1) % shuffled.length
    textarea.placeholder = shuffled[pIdx]
  }, 3000)
  textarea.addEventListener("focus", () => clearInterval(placeholderInterval))

  const continueBtn = document.createElement("button")
  continueBtn.id = "continueBtn"
  continueBtn.innerHTML = `<img src="arrow.png" alt="continue">`
  document.body.appendChild(continueBtn)
  setTimeout(() => continueBtn.classList.add("show"), 100)

  continueBtn.onclick = () => {
    selectedMemoryText = document.getElementById("memoryInput")?.value || ""
    continueBtn.remove()
    emotionNode.style.opacity = "0"
    setTimeout(() => showMemorySlide2(), 400)
  }
}

function showMemorySlide2() {
  emotionNode.innerHTML = `
    <div class="memory-ui">
      <p class="memory-label">how vivid is this memory?</p>
      <div class="vivid-bar-container" id="vividBar">
        <div class="vivid-bar-fill" id="vividFill"></div>
        <div class="vivid-bar-ticks">
          <div class="vivid-tick"></div>
          <div class="vivid-tick"></div>
          <div class="vivid-tick"></div>
          <div class="vivid-tick"></div>
          <div class="vivid-tick"></div>
          <div class="vivid-tick"></div>
          <div class="vivid-tick"></div>
          <div class="vivid-tick"></div>
          <div class="vivid-tick"></div>
          <div class="vivid-tick"></div>
        </div>
      </div>
      <div class="vivid-bar-labels">
        <span>fragmented</span>
        <span>vivid</span>
      </div>
      <div class="vivid-value-display" id="vividDisplay">—</div>
    </div>
  `
  emotionNode.style.display = "flex"
  emotionNode.style.opacity = "1"

  const vividBar = document.getElementById("vividBar")
  const vividFill = document.getElementById("vividFill")
  const vividDisplay = document.getElementById("vividDisplay")
  let dragging = false

  function setVividness(clientX) {
    const rect = vividBar.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const raw = ratio * 5
    const snapped = Math.round(raw * 2) / 2
    selectedVividness = Math.max(0.5, snapped)
    vividFill.style.width = `${(selectedVividness / 5) * 100}%`
    vividDisplay.textContent = selectedVividness.toFixed(1)

    if (!document.getElementById("continueBtn")) {
      const continueBtn = document.createElement("button")
      continueBtn.id = "continueBtn"
      continueBtn.innerHTML = `<img src="arrow.png" alt="continue">`
      document.body.appendChild(continueBtn)
      setTimeout(() => continueBtn.classList.add("show"), 100)
      continueBtn.onclick = () => {
        continueBtn.remove()
        emotionNode.style.opacity = "0"
        setTimeout(() => saveMemory(), 400)
      }
    }
  }

  vividBar.classList.add("vivid-prompt")
  vividBar.addEventListener("mousedown", (e) => { vividBar.classList.remove("vivid-prompt"); dragging = true; setVividness(e.clientX) })
  document.addEventListener("mousemove", (e) => { if (dragging) setVividness(e.clientX) })
  document.addEventListener("mouseup", () => { dragging = false })
  vividBar.addEventListener("touchstart", (e) => { vividBar.classList.remove("vivid-prompt"); dragging = true; setVividness(e.touches[0].clientX) }, { passive: true })
  document.addEventListener("touchmove", (e) => { if (dragging) setVividness(e.touches[0].clientX) }, { passive: true })
  document.addEventListener("touchend", () => { dragging = false })
}


/* ================= SAVE ================= */

function saveMemory() {
  const continueBtn = document.getElementById("continueBtn")
  if (continueBtn) continueBtn.remove()

  updateNav("complete")
  categoryNode.style.opacity = "0"
  emotionNode.style.opacity = "0"

  const fileName = `${selectedScent ? selectedScent.name : "unknown"}_${selectedEmotion || "unknown"}.txt`

  setTimeout(() => {
    emotionNode.innerHTML = `
      <div class="memory-ui" style="align-items:center; text-align:center;">
        <div id="fileNameDisplay" class="save-filename"></div>
        <div id="saveButtons" class="save-buttons scent-grid">
          <button id="uploadBtn">upload to archive</button>
          <button id="forgetBtn">forget the memory</button>
        </div>
      </div>
    `
    emotionNode.style.display = "flex"
    emotionNode.style.opacity = "1"

    document.getElementById("uploadBtn").onclick = uploadMemory
    document.getElementById("forgetBtn").onclick = forgetMemory

    const fileNameEl = document.getElementById("fileNameDisplay")
    const saveButtons = document.getElementById("saveButtons")

    let char = 0
    function typeFileName() {
      if (char <= fileName.length) {
        fileNameEl.textContent = fileName.substring(0, char)
        char++
        setTimeout(typeFileName, 45)
      } else {
        setTimeout(() => saveButtons.classList.add("visible"), 400)
      }
    }
    typeFileName()
  }, 400)
}

/* ================= UPLOAD ================= */

async function uploadMemory() {
  const uploadBtn = document.getElementById("uploadBtn")
  if (uploadBtn) uploadBtn.textContent = "saving..."

  try {
    const memory = {
      category: selectedCategory,
      scent: selectedScent ? selectedScent.name : "unknown",
      emotion: selectedEmotion || "",
      vividness: selectedVividness || 0,
      text: selectedMemoryText,
      timestamp: Date.now()
    }
    await addDoc(collection(db, "memories"), memory)
  } catch(e) {
    console.error("upload error:", e)
    if (uploadBtn) uploadBtn.textContent = "upload to archive"
    alert(`upload failed: ${e.message}`)
    return
  }

  setTimeout(() => { window.location.href = "reload.html" }, 1200)
}

/* ================= FORGET ================= */

function forgetMemory() {
  const nav = document.getElementById("navBar")
  nav.style.transition = "opacity .8s ease"
  nav.style.opacity = "0"
  emotionNode.style.opacity = "0"

  setTimeout(() => {
    emotionNode.innerHTML = `
      <div class="memory-ui">
        <p id="forgetText" class="memory-label" style="opacity: 1; color: white;">you can suppress it, but memories can't always be forgotten</p>
        <div id="forgetButtons" class="scent-grid" style="margin-top: 20px; display: none;">
          <button id="suppressBtn" style="opacity: 0; transition: opacity .6s ease;">suppress</button>
          <button id="rememberBtn" style="opacity: 0; transition: opacity .6s ease;">remember</button>
        </div>
      </div>
    `
    emotionNode.style.display = "flex"
    emotionNode.style.opacity = "1"

    emotionNode.addEventListener("click", function revealButtons() {
      emotionNode.removeEventListener("click", revealButtons)

      const forgetText = document.getElementById("forgetText")
      const forgetButtons = document.getElementById("forgetButtons")

      forgetText.style.transition = "opacity .6s ease"
      forgetText.style.opacity = "0"

      setTimeout(() => {
        forgetText.style.display = "none"
        forgetButtons.style.display = "flex"
        forgetButtons.style.flexDirection = "column"
        setTimeout(() => { document.getElementById("suppressBtn").style.opacity = "1" }, 100)
        setTimeout(() => { document.getElementById("rememberBtn").style.opacity = "1" }, 500)
      }, 600)

      document.getElementById("suppressBtn").onclick = suppressMemory
      document.getElementById("rememberBtn").onclick = uploadMemory
    })
  }, 400)
}

/* ================= SUPPRESS ================= */

function suppressMemory() {
  const canvas = document.createElement("canvas")
  canvas.id = "pixelCanvas"
  canvas.style.cssText = `position:fixed;inset:0;width:100vw;height:100vh;z-index:200;pointer-events:none;`
  document.body.appendChild(canvas)

  const ctx = canvas.getContext("2d")
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const pixelSize = 24
  const cols = Math.ceil(canvas.width / pixelSize)
  const rows = Math.ceil(canvas.height / pixelSize)
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
    for (let i = 0; i < 2 && index < pixels.length; i++, index++) {
      ctx.fillStyle = "white"
      ctx.fillRect(pixels[index].x, pixels[index].y, pixelSize, pixelSize)
    }

    if (index >= pixels.length) {
      clearInterval(fill)

      const whiteBg = document.createElement("div")
      whiteBg.style.cssText = `position:fixed;inset:0;background:white;z-index:201;pointer-events:none;`
      document.body.appendChild(whiteBg)
      canvas.remove()

      setTimeout(() => {
        emotionNode.style.cssText = `
          position:fixed;top:0;left:0;width:100vw;height:100vh;
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          transform:none;pointer-events:auto;max-width:none;opacity:0;z-index:202;transition:none;
        `
        emotionNode.innerHTML = `
          <div class="memory-ui" style="color:black;">
            <p class="memory-label" style="color:black;opacity:1;">memory suppressed</p>
          </div>
        `
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            emotionNode.style.transition = "opacity 1.2s ease"
            emotionNode.style.opacity = "1"
          })
        })

        setTimeout(() => {
          emotionNode.style.opacity = "0"
          setTimeout(() => {
            emotionNode.innerHTML = `
              <div class="memory-ui">
                <button id="againBtn" style="background:none;border:none;padding:0;cursor:pointer;">
                  <img src="redo-black.png" alt="start again" style="width:48px;height:48px;object-fit:contain;">
                </button>
              </div>
            `
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                emotionNode.style.transition = "opacity 1.2s ease"
                emotionNode.style.opacity = "1"
              })
            })
            document.getElementById("againBtn").onclick = () => {
              whiteBg.remove()
              window.location.href = "calibration.html"
            }
          }, 600)
        }, 2400)
      }, 600)
    }
  }, 16)
}

/* ================= NAV ================= */

const navSteps = [
  { label: "category" },
  { label: "scent" },
  { label: "notes" },
  { label: "emotion" },
  { label: "log" },
  { label: "complete" }
]

let currentNavStep = -1

function updateNav(stepLabel) {
  const nav = document.getElementById("navBar")
  const stepIndex = navSteps.findIndex(s => s.label === stepLabel)
  if (stepIndex === -1) return

  currentNavStep = stepIndex
  nav.innerHTML = ""
  nav.style.opacity = "1"

  navSteps.slice(0, stepIndex + 1).forEach((step, i) => {
    if (i > 0) {
      const divider = document.createElement("span")
      divider.className = "nav-divider"
      divider.textContent = " > "
      nav.appendChild(divider)
    }

    const seg = document.createElement("span")
    seg.className = i === stepIndex ? "nav-segment current" : "nav-segment"
    seg.dataset.index = i


    nav.appendChild(seg)

    if (i === stepIndex) {
      let char = 0
      function type() {
        if (char <= step.label.length) {
          seg.textContent = step.label.substring(0, char)
          char++
          setTimeout(type, 40)
        }
      }
      type()
    } else {
      seg.textContent = step.label
    }
  })
}