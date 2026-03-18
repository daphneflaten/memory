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
let selectedEmotion
let selectedVividness
let selectedMemoryText = ""

document.querySelector('.bg-video').playbackRate = .4

const categoryNode = document.getElementById("categoryNode")
const scentsBranch = document.getElementById("scentsBranch")
const analysisNode = document.getElementById("analysisNode")
const notesNode = document.getElementById("notesNode")
const emotionNode = document.getElementById("emotionNode")

fetch("scents.json")
.then(res => res.json())
.then(data=>{
  scentData = data

  const introScreen = document.getElementById("introScreen")

  introScreen.addEventListener("click", ()=>{

    document.querySelector('.bg-video').play().catch(()=>{})

    introScreen.style.transition = "opacity .8s ease"
    introScreen.style.opacity = "0"

    setTimeout(()=>{
      introScreen.remove()
      startCalibration()
    }, 800)

  })

})

/* ================= CATEGORY SCAN ================= */

function startCalibration(){

  const categoryLabel = document.getElementById("categoryLabel")

  categoryLabel.style.transition = "opacity .8s ease"
  setTimeout(()=>{ categoryLabel.style.opacity = "1" }, 200)

  categoryNode.style.transition = "opacity .8s ease, transform .7s ease"
  setTimeout(()=>{ categoryNode.style.opacity = "1" }, 500)

  const categories = Object.keys(scentData)
  let cycles = 0
  let randomCategory

  setTimeout(()=>{

    const scan = setInterval(()=>{

      randomCategory = categories[Math.floor(Math.random()*categories.length)]
      categoryNode.innerHTML = `<span class="category-name">${randomCategory}</span>`

      cycles++

      if(cycles > 14){
        clearInterval(scan)
        finalizeCategory(randomCategory)
      }

    },120)

  }, 600)

}

function finalizeCategory(category){

  selectedCategory = category
  categoryNode.innerHTML = `<span class="category-name">${category}</span>`

  document.getElementById("categoryLabel").innerText = "category detected"

  updateNav("category")

  const continueBtn = document.createElement("button")
  continueBtn.id = "continueBtn"
  continueBtn.innerHTML = `<img src="arrow.png" alt="continue">`
  document.body.appendChild(continueBtn)

  setTimeout(()=>{
    continueBtn.classList.add("show")
  },600)

  continueBtn.onclick = continueCalibration

}

/* ================= SCENT BRANCH ================= */

function continueCalibration(){

  const continueBtn = document.getElementById("continueBtn")
  if(continueBtn) continueBtn.remove()

  document.getElementById("categoryLabel").style.opacity = "0"

  categoryNode.classList.add("active")

  setTimeout(()=>{
    showBranches()
  },500)

}

function showBranches(){

  updateNav("scent")

  const scents = scentData[selectedCategory]

  scentsBranch.innerHTML=""
  scentsBranch.style.opacity="1"

  const prompt = document.createElement("div")
  prompt.className="scent-prompt"
  prompt.innerText="which scent feels familiar?"

  scentsBranch.appendChild(prompt)

  setTimeout(()=>prompt.classList.add("show"),200)

  const grid = document.createElement("div")
  grid.className="scent-grid"

  scentsBranch.appendChild(grid)

  scents.forEach((scent,index)=>{

    const btn = document.createElement("button")
    btn.innerText = scent.name
    btn.style.opacity = "0"

    btn.onclick = ()=>selectScent(scent)

    grid.appendChild(btn)

    setTimeout(()=>{
      btn.style.opacity = "1"
    },index*350+400)

  })

}

/* ================= SCENT SELECT ================= */

function selectScent(scent){

  selectedScent = scent
  scentsBranch.style.opacity = "0"

  const categoryText = categoryNode.querySelector(".category-name")

  let current = categoryText.innerText
  let index = current.length

  function backspace(){

    if(index >= 0){

      categoryText.innerHTML =
        current.substring(0,index) + `<span class="cursor">|</span>`

      index--
      setTimeout(backspace,40)

    }
    else{
      typeScent()
    }

  }

  function typeScent(){

    let text = selectedScent.name
    let char = 0

    function type(){

      if(char <= text.length){

        categoryText.innerHTML =
          text.substring(0,char) + `<span class="cursor">|</span>`

        char++
        setTimeout(type,40)

      }
      else{

        categoryText.innerHTML = text

        setTimeout(()=>{
          startScentAnalysis()
        },300)

      }

    }

    type()

  }

  backspace()

}

/* ================= SCENT ANALYSIS ================= */

function startScentAnalysis(){

  scentsBranch.remove()

  analysisNode.style.opacity = "1"

  setTimeout(()=>{
    generateNotes()
  },400)

}

function generateNotes(){

  updateNav("notes")

  analysisNode.innerHTML = ""

  notesNode.innerHTML = ""
  notesNode.classList.remove("hidden")

  const notes = selectedScent.notes

  const columns = [
    { type: "top", values: notes.top },
    { type: "heart", values: notes.heart },
    { type: "base", values: notes.base }
  ]

  let current = 0

  function showNext(){

    if(current >= columns.length){
      setTimeout(()=>{
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

    setTimeout(()=> el.classList.add("show"), 50)

    current++
    setTimeout(showNext, 600)

  }

  setTimeout(showNext, 400)

}

/* ================= CONTINUE TO EMOTIONS ================= */

function showEmotionContinue(){

  const continueBtn = document.createElement("button")
  continueBtn.id = "continueBtn"
  continueBtn.innerHTML = `<img src="arrow.png" alt="continue">`
  document.body.appendChild(continueBtn)

  setTimeout(()=> continueBtn.classList.add("show"), 100)

  continueBtn.onclick = showEmotionOptions

}

/* ================= EMOTION WHEEL ================= */

function showEmotionOptions(){

  const continueBtn = document.getElementById("continueBtn")
  if(continueBtn) continueBtn.remove()

  updateNav("emotion")

  analysisNode.style.opacity = "0"
  notesNode.style.opacity = "0"

  setTimeout(()=>{

    analysisNode.innerHTML = ""
    notesNode.innerHTML = ""

    emotionNode.innerHTML=`
      <div class="emotion-ui">
        <p class="emotion-label">select the emotion that scent triggers</p>
        <div class="picker-container">
          <div class="picker" id="picker"></div>
        </div>
      </div>
    `

    emotionNode.style.display = "flex"

    requestAnimationFrame(()=>{
      emotionNode.style.opacity = "1"
    })

    buildEmotionPicker()

    const confirmBtn = document.createElement("button")
    confirmBtn.id = "confirmEmotion"
    confirmBtn.innerHTML = `<img src="arrow.png" alt="continue">`
    document.body.appendChild(confirmBtn)
    setTimeout(()=> confirmBtn.classList.add("show"), 100)
    confirmBtn.onclick = showMemoryInput

  },400)

}

/* ================= BUILD PICKER ================= */

function buildEmotionPicker(){

  const emotions=[
    "nostalgia","comfort","calm","melancholy","curiosity","unease",
    "longing","warmth","serenity","anxiety",
    "sadness","joy","bittersweet","confusion","tension","relief",
    "security","loneliness","anticipation","fear",
    "wonder","tenderness","disgust","familiarity","detachment",
    "yearning","peace","embarrassment","surprise","emptiness"
  ]

  const picker = document.getElementById("picker")
  const itemHeight = 60
  const looped = [...emotions,...emotions,...emotions]

  looped.forEach(e=>{
    const div = document.createElement("div")
    div.className = "picker-item"
    div.textContent = e
    picker.appendChild(div)
  })

  const totalHeight = itemHeight * emotions.length
  picker.scrollTop = totalHeight

  const items = document.querySelectorAll(".picker-item")

  function updateActive(){

    if(picker.scrollTop <= itemHeight * 2){
      picker.scrollTop += totalHeight
    } else if(picker.scrollTop >= totalHeight * 2 - itemHeight * 2){
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

function showMemoryInput(){

  const confirmBtn = document.getElementById("confirmEmotion")
  if(confirmBtn) confirmBtn.remove()

  const activeItem = document.querySelector(".picker-item.active")
  if(activeItem) selectedEmotion = activeItem.textContent

  updateNav("log")

  emotionNode.style.opacity = "0"

  setTimeout(()=>{

    emotionNode.innerHTML=`
      <div class="memory-ui">
        <p class="memory-label">log your memory</p>
        <textarea id="memoryInput" placeholder="describe here..."></textarea>
        <div class="vividness-scale">
          <div class="vivid-block" data-value="1"></div>
          <div class="vivid-block" data-value="2"></div>
          <div class="vivid-block" data-value="3"></div>
          <div class="vivid-block" data-value="4"></div>
          <div class="vivid-block" data-value="5"></div>
        </div>
        <div class="vividness-labels">
          <span>fragmented</span>
          <span>vivid</span>
        </div>
      </div>
    `

    emotionNode.style.display = "flex"
    emotionNode.style.opacity = "1"

    const vividBlocks = document.querySelectorAll(".vivid-block")

    vividBlocks.forEach(block => {
      block.addEventListener("click", ()=>{

        selectedVividness = parseInt(block.dataset.value)

        vividBlocks.forEach(b => {
          b.classList.toggle("active", parseInt(b.dataset.value) <= selectedVividness)
        })

        let saveBtn = document.getElementById("continueBtn")
        if(!saveBtn){
          saveBtn = document.createElement("button")
          saveBtn.id = "continueBtn"
          saveBtn.innerHTML = `<img src="arrow.png" alt="continue">`
          document.body.appendChild(saveBtn)
          setTimeout(()=> saveBtn.classList.add("show"), 100)
          saveBtn.onclick = ()=>{
            selectedMemoryText = document.getElementById("memoryInput")?.value || ""
            saveMemory()
          }
        }

      })
    })

    const continueBtn = document.createElement("button")
    continueBtn.id = "continueBtn"
    continueBtn.innerHTML = `<img src="arrow.png" alt="continue">`
    document.body.appendChild(continueBtn)
    setTimeout(()=> continueBtn.classList.add("show"), 150)
    continueBtn.onclick = ()=>{
      selectedMemoryText = document.getElementById("memoryInput")?.value || ""
      saveMemory()
    }

  },400)

}

/* ================= SAVE ================= */

function saveMemory(){

  const continueBtn = document.getElementById("continueBtn")
  if(continueBtn) continueBtn.remove()

  updateNav("complete")

  categoryNode.style.opacity = "0"
  emotionNode.style.opacity = "0"

  setTimeout(()=>{

    emotionNode.innerHTML=`
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

  },400)

}

/* ================= UPLOAD ================= */

async function uploadMemory(){

  const memory = {
    category: selectedCategory,
    scent: selectedScent ? selectedScent.name : "unknown",
    emotion: selectedEmotion || "",
    vividness: selectedVividness || 0,
    text: selectedMemoryText,
    timestamp: Date.now()
  }

  try {
    await addDoc(collection(db, "memories"), memory)
  } catch(e) {
    console.error("error saving memory:", e)
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
  vid.style.cssText = `
    width: 80%;
    height: 80%;
    object-fit: contain;
  `

  videoOverlay.appendChild(vid)
  document.body.appendChild(videoOverlay)

  requestAnimationFrame(()=>{
    videoOverlay.style.opacity = "1"
  })

  vid.play().catch(()=>{})

  setTimeout(()=>{
    videoOverlay.style.transition = "opacity .6s ease"
    videoOverlay.style.opacity = "0"
    setTimeout(()=>{
      videoOverlay.remove()
      showArchivedText()
    },600)
  }, 4000)

}

/* ================= ARCHIVED TEXT ================= */

function showArchivedText(){

  emotionNode.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transform: none;
    pointer-events: auto;
    max-width: none;
    opacity: 0;
    z-index: 400;
    transition: none;
  `

  emotionNode.innerHTML = `
    <div class="memory-ui">
      <p class="memory-label">memory archived</p>
    </div>
  `

  requestAnimationFrame(()=>{
    requestAnimationFrame(()=>{
      emotionNode.style.transition = "opacity 1.2s ease"
      emotionNode.style.opacity = "1"
    })
  })

  setTimeout(()=>{

    emotionNode.style.opacity = "0"

    setTimeout(()=>{

      emotionNode.innerHTML = `
        <div class="memory-ui">
          <div class="scent-grid">
            <button id="viewArchiveBtn">view archive</button>
            <button id="againBtn" style="background:none;border:none;padding:0;cursor:pointer;">
              <img src="redo-white.png" style="width:48px;height:48px;object-fit:contain;">
            </button>
          </div>
        </div>
      `

      requestAnimationFrame(()=>{
        requestAnimationFrame(()=>{
          emotionNode.style.transition = "opacity 1.2s ease"
          emotionNode.style.opacity = "1"
        })
      })

      document.getElementById("viewArchiveBtn").onclick = ()=>{
        window.location.href = "https://daphneflaten.github.io/m3m0ry-app/index.html"
      }

      document.getElementById("againBtn").onclick = ()=>{
        window.location.href = "https://daphneflaten.github.io/m3m0ry-app/calibration.html"
      }

    },600)

  },2400)

}

/* ================= FORGET ================= */

function forgetMemory(){

  const nav = document.getElementById("navBar")
  nav.style.transition = "opacity .8s ease"
  nav.style.opacity = "0"

  emotionNode.style.opacity = "0"

  setTimeout(()=>{

    emotionNode.innerHTML=`
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

    emotionNode.addEventListener("click", function revealButtons(){

      emotionNode.removeEventListener("click", revealButtons)

      const forgetText = document.getElementById("forgetText")
      const forgetButtons = document.getElementById("forgetButtons")

      forgetText.style.transition = "opacity .6s ease"
      forgetText.style.opacity = "0"

      setTimeout(()=>{
        forgetText.style.display = "none"
        forgetButtons.style.display = "flex"
        forgetButtons.style.flexDirection = "column"

        setTimeout(()=>{
          document.getElementById("suppressBtn").style.opacity = "1"
        }, 100)

        setTimeout(()=>{
          document.getElementById("rememberBtn").style.opacity = "1"
        }, 500)

      }, 600)

      document.getElementById("suppressBtn").onclick = suppressMemory
      document.getElementById("rememberBtn").onclick = uploadMemory

    })

  },400)

}

/* ================= SUPPRESS ================= */

function suppressMemory(){

  const canvas = document.createElement("canvas")
  canvas.id = "pixelCanvas"
  canvas.style.cssText = `
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    z-index: 200;
    pointer-events: none;
  `
  document.body.appendChild(canvas)

  const ctx = canvas.getContext("2d")
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const pixelSize = 24
  const cols = Math.ceil(canvas.width / pixelSize)
  const rows = Math.ceil(canvas.height / pixelSize)

  const pixels = []
  for(let r = 0; r < rows; r++){
    for(let c = 0; c < cols; c++){
      pixels.push({ x: c * pixelSize, y: r * pixelSize })
    }
  }

  for(let i = pixels.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [pixels[i], pixels[j]] = [pixels[j], pixels[i]]
  }

  let index = 0
  const batchSize = 2
  const interval = 16

  const fill = setInterval(()=>{

    for(let i = 0; i < batchSize && index < pixels.length; i++, index++){
      ctx.fillStyle = "white"
      ctx.fillRect(pixels[index].x, pixels[index].y, pixelSize, pixelSize)
    }

    if(index >= pixels.length){
      clearInterval(fill)

      const whiteBg = document.createElement("div")
      whiteBg.style.cssText = `
        position: fixed;
        inset: 0;
        background: white;
        z-index: 201;
        opacity: 1;
        pointer-events: none;
      `
      document.body.appendChild(whiteBg)
      canvas.remove()

      setTimeout(()=>{

        emotionNode.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transform: none;
          pointer-events: auto;
          max-width: none;
          opacity: 0;
          z-index: 202;
          transition: none;
        `

        emotionNode.innerHTML=`
          <div class="memory-ui" style="color: black;">
            <p class="memory-label" style="color: black; opacity: 1;">memory suppressed</p>
          </div>
        `

        requestAnimationFrame(()=>{
          requestAnimationFrame(()=>{
            emotionNode.style.transition = "opacity 1.2s ease"
            emotionNode.style.opacity = "1"
          })
        })

        setTimeout(()=>{

          emotionNode.style.opacity = "0"

          setTimeout(()=>{

            emotionNode.innerHTML=`
              <div class="memory-ui">
                <button id="againBtn" style="background: none; border: none; padding: 0; cursor: pointer;">
                  <img src="redo-black.png" alt="start again" style="width: 48px; height: 48px; object-fit: contain;">
                </button>
              </div>
            `

            requestAnimationFrame(()=>{
              requestAnimationFrame(()=>{
                emotionNode.style.transition = "opacity 1.2s ease"
                emotionNode.style.opacity = "1"
              })
            })

            document.getElementById("againBtn").onclick = ()=>{
              whiteBg.remove()
              window.location.href = "https://daphneflaten.github.io/m3m0ry-app/calibration.html"
            }

          },600)

        },2400)

      },600)

    }

  }, interval)

}

/* ================= NAV ================= */

const navSteps = [
  { label: "category", onclick: ()=> window.location.href = "https://daphneflaten.github.io/m3m0ry-app/calibration.html" },
  { label: "scent",    onclick: ()=>{ emotionNode.style.opacity="0"; notesNode.style.opacity="0"; analysisNode.style.opacity="0"; categoryNode.classList.add("active"); setTimeout(()=> showBranches(), 400) } },
  { label: "notes",    onclick: ()=> showEmotionContinue() },
  { label: "emotion",  onclick: ()=> showEmotionOptions() },
  { label: "log",      onclick: ()=> showMemoryInput() },
  { label: "complete", onclick: null }
]

let currentNavStep = -1

function updateNav(stepLabel){

  const nav = document.getElementById("navBar")
  const stepIndex = navSteps.findIndex(s => s.label === stepLabel)
  if(stepIndex === -1) return

  currentNavStep = stepIndex

  nav.innerHTML = ""
  nav.style.opacity = "1"

  navSteps.slice(0, stepIndex + 1).forEach((step, i) => {

    if(i > 0){
      const divider = document.createElement("span")
      divider.className = "nav-divider"
      divider.textContent = " > "
      nav.appendChild(divider)
    }

    const seg = document.createElement("span")
    seg.className = i === stepIndex ? "nav-segment current" : "nav-segment"
    seg.dataset.index = i

    if(i < stepIndex && step.onclick){
      seg.onclick = ()=>{
        currentNavStep = i
        step.onclick()
      }
    }

    nav.appendChild(seg)

    if(i === stepIndex){
      let char = 0
      function type(){
        if(char <= step.label.length){
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