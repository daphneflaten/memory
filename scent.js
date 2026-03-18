window.addEventListener("load",()=>{

const video=document.getElementById("loadingVideo");
const overlay=document.getElementById("loadingOverlay");
const page=document.getElementById("page");

function showPage(){
overlay.classList.add("hidden");
setTimeout(()=>page.classList.add("visible"),600);
}

video.addEventListener("ended",showPage);
video.addEventListener("error",showPage);
setTimeout(showPage,5000);

});

document.addEventListener("DOMContentLoaded",async()=>{

    const reflectionVideo = document.querySelector(".reflection-bg");

if(reflectionVideo){
  reflectionVideo.playbackRate = 0.6; // slower playback
}

const response=await fetch("data.json");
const data=await response.json();

const emotions=Object.keys(data.emotions);

const picker=document.getElementById("picker");
const confirmBtn=document.getElementById("confirmBtn");
const definitionEl=document.getElementById("emotionDefinition");

const reflectionSection=document.getElementById("reflectionSection");
const slides=document.querySelectorAll(".reflection-slide");

const backBtn=document.getElementById("backBtn");
const nextBtn=document.getElementById("nextBtn");

const pickerContainer=document.querySelector(".picker-container");
const topText=document.querySelector(".top-text");

const memoryInput=document.getElementById("reflectionInput");

let selectedEmotion=null;
let vividnessValue=0;
let currentSlide=0;

const itemHeight=60;

/* BUILD PICKER */

const looped=[...emotions,...emotions,...emotions];

looped.forEach(e=>{
const div=document.createElement("div");
div.classList.add("picker-item");
div.textContent=e;
picker.appendChild(div);
});

const total=emotions.length;
const items=document.querySelectorAll(".picker-item");

picker.scrollTop=itemHeight*total;

function updateActive(){

const center=picker.scrollTop+picker.offsetHeight/2;
const index=Math.round(center/itemHeight)-1;

items.forEach(i=>i.classList.remove("active"));

if(items[index]){
items[index].classList.add("active");
selectedEmotion=items[index].textContent;
confirmBtn.disabled=false;
definitionEl.textContent=data.emotions[selectedEmotion].definition;
}

}

picker.addEventListener("scroll",updateActive);
updateActive();

/* CONFIRM */

confirmBtn.addEventListener("click",()=>{

pickerContainer.style.opacity="0";
topText.style.opacity="0";
confirmBtn.style.opacity="0";
definitionEl.style.opacity="0";

setTimeout(()=>{
reflectionSection.classList.add("visible");
showSlide(0);
},600);

});

/* SLIDES */

function showSlide(index){

slides.forEach((slide,i)=>{

slide.classList.remove("active","previous");

if(i===index)slide.classList.add("active");
if(i<index)slide.classList.add("previous");

});

currentSlide=index;

if(currentSlide===0){
document.querySelector(".reflection-controls").classList.add("centered");
nextBtn.textContent="next";
}
else{
document.querySelector(".reflection-controls").classList.remove("centered");
nextBtn.textContent="lock in";
}

}

backBtn.addEventListener("click",()=>{
if(currentSlide>0)showSlide(currentSlide-1);
});

nextBtn.addEventListener("click",()=>{

if(currentSlide===0){
showSlide(1);
}
else{

const entry={
scentId:"scent1",
emotion:selectedEmotion,
reflection:memoryInput.value,
vividness:vividnessValue,
timestamp:Date.now()
};

let archive=JSON.parse(localStorage.getItem("m3m0ryArchive"))||[];
archive.push(entry);
localStorage.setItem("m3m0ryArchive",JSON.stringify(archive));

const page=document.getElementById("page");
page.classList.add("exit");

setTimeout(()=>{
window.location.href="home.html";
},800);

}

});

showSlide(0);

/* VIVIDNESS */

const vividBlocks=document.querySelectorAll(".vivid-block");

vividBlocks.forEach(block=>{

block.addEventListener("click",()=>{

vividnessValue=parseInt(block.dataset.value);

vividBlocks.forEach(b=>{
const value=parseInt(b.dataset.value);
b.classList.toggle("active",value<=vividnessValue);
});

});

});

});