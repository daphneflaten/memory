import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js"
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js"
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js"

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
const storage = getStorage(app)

let scentData
let selectedScent
let selectedCategory
let selectedEmotion
let selectedVividness
let selectedMemoryText = ""
let selectedFile = null
let selectedFileType = null

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

function finalizeCategory(category) {
  selectedCategory = category
  categoryNode.innerHTML = `<span class="category-name">${category}</span>`

  const categoryLabel = document.getElementById("categoryLabel")
  categoryLabel.innerText = "category detected"
  categoryLabel.style.color = "white"

  updateNav("category")

  const redoBtn = document.createElement("button")
  redoBtn.id = "redoBtn"
  redoBtn.innerText = "re-roll category"
  redoBtn.style.cssText = `
    position: fixed;
    bottom: 100px;
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
  const placeholder = memoryPlaceholders[Math.floor(Math.random() * memoryPlaceholders.length)]

  emotionNode.innerHTML = `
    <div class="memory-ui">
      <p class="memory-label">log your memory</p>
      <textarea id="memoryInput" placeholder="${placeholder}"></textarea>
    </div>
  `
  emotionNode.style.display = "flex"
  emotionNode.style.opacity = "1"

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
        <div class="vivid-bar-labels">
          <span>fragmented</span>
          <span>vivid</span>
        </div>
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
        setTimeout(() => showMemorySlide3(), 400)
      }
    }
  }

  vividBar.addEventListener("mousedown", (e) => { dragging = true; setVividness(e.clientX) })
  document.addEventListener("mousemove", (e) => { if (dragging) setVividness(e.clientX) })
  document.addEventListener("mouseup", () => { dragging = false })
  vividBar.addEventListener("touchstart", (e) => { dragging = true; setVividness(e.touches[0].clientX) }, { passive: true })
  document.addEventListener("touchmove", (e) => { if (dragging) setVividness(e.touches[0].clientX) }, { passive: true })
  document.addEventListener("touchend", () => { dragging = false })
}

function showMemorySlide3() {
  emotionNode.innerHTML = `
    <div class="memory-ui">
      <p class="memory-label">attach an image or video?</p>
      <div style="display:flex; flex-direction:row; gap:12px; width:100%;">
        <button id="yesImageBtn" style="flex:1;">yes</button>
        <button id="noImageBtn" style="flex:1;">no</button>
      </div>
      <input type="file" id="imageUpload" accept="image/*,video/*" style="display:none;">
    </div>
  `
  emotionNode.style.display = "flex"
  emotionNode.style.opacity = "1"

  document.getElementById("yesImageBtn").addEventListener("click", () => {
    document.getElementById("imageUpload").click()
  })

  document.getElementById("noImageBtn").addEventListener("click", () => {
    selectedFile = null
    selectedFileType = null
    saveMemory()
  })

  document.getElementById("imageUpload").addEventListener("change", (e) => {
    const file = e.target.files[0]
    if (!file) return

    const isVideo = file.type.startsWith("video/")

    if (isVideo && file.size > 25 * 1024 * 1024) {
      showFileError("video too large — keep clips under 15 seconds")
      e.target.value = ""
      return
    }

    if (isVideo) {
      selectedFile = file
      selectedFileType = "video"
      showFilePreview(file.name)
    } else {
      // compress image to a blob before uploading
      const url = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => {
        const maxDim = 1200
        let w = img.width, h = img.height
        if (w > maxDim || h > maxDim) {
          if (w > h) { h = Math.round(h * maxDim / w); w = maxDim }
          else { w = Math.round(w * maxDim / h); h = maxDim }
        }
        const canvas = document.createElement("canvas")
        canvas.width = w
        canvas.height = h
        canvas.getContext("2d").drawImage(img, 0, 0, w, h)
        canvas.toBlob(blob => {
          selectedFile = blob
          selectedFileType = "image"
          URL.revokeObjectURL(url)
          showFilePreview(file.name)
        }, "image/jpeg", 0.8)
      }
      img.src = url
    }

    function showFileError(msg) {
      const existing = document.getElementById("filePreview")
      if (existing) existing.remove()
      const err = document.createElement("div")
      err.id = "filePreview"
      err.style.cssText = `margin-top:8px; font-size:.7rem; opacity:.6; text-align:left; width:100%;`
      err.textContent = msg
      document.querySelector("#emotionNode .memory-ui").appendChild(err)
    }

    function showFilePreview(name) {
      const existing = document.getElementById("filePreview")
      if (existing) existing.remove()

      const preview = document.createElement("div")
      preview.id = "filePreview"
      preview.style.cssText = `display:flex; align-items:center; gap:10px; margin-top:8px; width:100%;`
      preview.innerHTML = `
        <span style="flex:1; text-align:left; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${name}</span>
        <button id="removeFileBtn" style="width:auto; padding:4px 10px; flex-shrink:0;">✕</button>
      `
      document.querySelector("#emotionNode .memory-ui").appendChild(preview)

      if (!document.getElementById("continueBtn")) {
        const continueBtn = document.createElement("button")
        continueBtn.id = "continueBtn"
        continueBtn.innerHTML = `<img src="arrow.png" alt="continue">`
        document.body.appendChild(continueBtn)
        setTimeout(() => continueBtn.classList.add("show"), 100)
        continueBtn.onclick = () => { continueBtn.remove(); saveMemory() }
      }

      document.getElementById("removeFileBtn").addEventListener("click", () => {
        selectedFile = null
        selectedFileType = null
        document.getElementById("imageUpload").value = ""
        preview.remove()
        const continueBtn = document.getElementById("continueBtn")
        if (continueBtn) continueBtn.remove()
      })
    }
  })
}

/* ================= SAVE ================= */

function saveMemory() {
  const continueBtn = document.getElementById("continueBtn")
  if (continueBtn) continueBtn.remove()

  updateNav("complete")
  categoryNode.style.opacity = "0"
  emotionNode.style.opacity = "0"

  setTimeout(() => {
    emotionNode.innerHTML = `
      <div class="memory-ui">
        <div class="scent-grid">
          <button id="uploadBtn">upload to archive</button>
          <button id="forgetBtn">forget the memory</button>
        </div>
      </div>
    `
    emotionNode.style.display = "flex"
    emotionNode.style.opacity = "1"
    document.getElementById("uploadBtn").onclick = uploadMemory
    document.getElementById("forgetBtn").onclick = forgetMemory
  }, 400)
}

/* ================= UPLOAD ================= */

async function uploadMemory() {
  const uploadBtn = document.getElementById("uploadBtn")

  let imageUrl = null

  try {
    if (selectedFile) {
      const ext = selectedFileType === "video" ? (selectedFile.name?.split(".").pop() || "mp4") : "jpg"
      const storageRef = ref(storage, `memories/${Date.now()}.${ext}`)
      const contentType = selectedFileType === "video" ? (selectedFile.type || "video/mp4") : "image/jpeg"

      if (uploadBtn) uploadBtn.textContent = "uploading... 0%"

      imageUrl = await new Promise((resolve, reject) => {
        const task = uploadBytesResumable(storageRef, selectedFile, { contentType })
        task.on("state_changed",
          snap => {
            const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
            if (uploadBtn) uploadBtn.textContent = `uploading... ${pct}%`
          },
          reject,
          () => getDownloadURL(task.snapshot.ref).then(resolve)
        )
      })
    }

    if (uploadBtn) uploadBtn.textContent = "saving..."

    const memory = {
      category: selectedCategory,
      scent: selectedScent ? selectedScent.name : "unknown",
      emotion: selectedEmotion || "",
      vividness: selectedVividness || 0,
      text: selectedMemoryText,
      image: imageUrl,
      imageType: selectedFileType || null,
      timestamp: Date.now()
    }

    await addDoc(collection(db, "memories"), memory)

  } catch(e) {
    console.error("upload error:", e)
    if (uploadBtn) uploadBtn.textContent = "upload to archive"
    alert(`upload failed: ${e.message}`)
    return
  }

  const nav = document.getElementById("navBar")
  nav.style.transition = "opacity .8s ease"
  nav.style.opacity = "0"
  emotionNode.style.opacity = "0"

  const videoOverlay = document.createElement("div")
  videoOverlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: black;
    z-index: 300;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity .6s ease;
  `

  const vid = document.createElement("video")
  vid.src = "loading-screen.mp4"
  vid.muted = true
  vid.playsInline = true
  vid.setAttribute("playsinline", "")
  vid.setAttribute("webkit-playsinline", "")
  vid.style.cssText = `width: 80%; height: 80%; object-fit: contain;`

  videoOverlay.appendChild(vid)
  document.body.appendChild(videoOverlay)
  requestAnimationFrame(() => { videoOverlay.style.opacity = "1" })
  vid.play().catch(() => {})

  setTimeout(() => { window.location.href = "reload.html" }, 4000)
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
              window.location.href = "https://daphneflaten.github.io/m3m0ry-app/calibration.html"
            }
          }, 600)
        }, 2400)
      }, 600)
    }
  }, 16)
}

/* ================= NAV ================= */

const navSteps = [
  { label: "category", onclick: () => window.location.href = "https://daphneflaten.github.io/m3m0ry-app/calibration.html" },
  { label: "scent",    onclick: () => { emotionNode.style.opacity="0"; notesNode.style.opacity="0"; analysisNode.style.opacity="0"; categoryNode.classList.add("active"); setTimeout(() => showBranches(), 400) } },
  { label: "notes",    onclick: () => showEmotionContinue() },
  { label: "emotion",  onclick: () => showEmotionOptions() },
  { label: "log",      onclick: () => showMemoryInput() },
  { label: "complete", onclick: null }
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

    if (i < stepIndex && step.onclick) {
      seg.onclick = () => { currentNavStep = i; step.onclick() }
    }

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