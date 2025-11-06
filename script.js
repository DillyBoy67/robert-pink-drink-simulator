// ====================== GAME VARIABLES ======================
let baseTime = 60;
let timeLeft = baseTime;
let score = 0;
let points = 0;
let timer;
let gameActive = false;
let bonusSeconds = 0;
let pointsPerDrink = 1;
let canType = true;
let timePaused = false;

// Time Stop
let timeStopLevel = 0;
let timeStopBaseCost = 150;
let timeStopDuration = 0;
let timeStopActive = false;

// Skins
let skins = [
  {name: "Dio Roberto", unlocked: false}
];
let selectedSkin = null;
let activeSkin = null;

// ====================== ELEMENTS ======================
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');
const input = document.getElementById('drinkInput');
const startBtn = document.getElementById('startBtn');
const addSecondBtn = document.getElementById('addSecondBtn');
const addPointBtn = document.getElementById('addPointBtn');
const buyTimeStopBtn = document.getElementById('buyTimeStopBtn');
const activateTimeStopBtn = document.getElementById('activateTimeStopBtn');
const timeStopInfo = document.getElementById('timeStopInfo');
const gambleSkinBtn = document.getElementById('gambleSkinBtn');
const skinsList = document.getElementById('skinsList');
const equipSkinBtn = document.getElementById('equipSkinBtn');
const drinkImg = document.getElementById('drinkImg');

// ====================== EVENTS ======================
startBtn.addEventListener('click', startGame);
input.addEventListener('input', handleInput);
addSecondBtn.addEventListener('click', buySecond);
addPointBtn.addEventListener('click', buyPointUpgrade);
buyTimeStopBtn.addEventListener('click', buyTimeStop);
activateTimeStopBtn.addEventListener('click', activateTimeStop);
gambleSkinBtn.addEventListener('click', gambleSkin);
equipSkinBtn.addEventListener('click', equipSkin);

// DISABLE COPY/PASTE
input.addEventListener('paste', e=>e.preventDefault());
input.addEventListener('copy', e=>e.preventDefault());
input.addEventListener('cut', e=>e.preventDefault());
input.addEventListener('contextmenu', e=>e.preventDefault());

// ====================== GAME FUNCTIONS ======================
function startGame() {
  score = 0;
  timeLeft = baseTime + bonusSeconds;
  gameActive = true;
  input.disabled = false;
  input.value = '';
  input.focus();
  scoreDisplay.textContent = "Score: 0";
  timerDisplay.textContent = "⏰ Time: " + timeLeft;
  startBtn.disabled = true;
  buyTimeStopBtn.disabled = true;
  updateButtons();

  timer = setInterval(() => {
    if (!timePaused) {
      timeLeft--;
      timerDisplay.textContent = "⏰ Time: " + timeLeft;
      if (timeLeft <= 0) endGame();
    }
  }, 1000);
}

function handleInput() {
  if (!gameActive || !canType) return;
  const value = input.value.trim().toLowerCase();
  if (value === 'drink') {
    score += pointsPerDrink;
    scoreDisplay.textContent = "Score: " + score;
    input.value = '';
    canType = false;
    setTimeout(()=>canType=true,200);
  }
}

function endGame() {
  clearInterval(timer);
  gameActive = false;
  input.disabled = true;
  startBtn.disabled = false;
  buyTimeStopBtn.disabled = false;
  timerDisplay.textContent = "⏰ Time's up!";
  points += score;
  alert(`You typed 'drink' ${score} times!\nYou earned ${score} points!\nTotal points: ${points}`);
  saveGame();
  updateButtons();
}

function buySecond() { if(points>=5){points-=5; bonusSeconds++; alert(`+1 second! Total bonus: ${bonusSeconds}`); saveGame(); updateButtons();} }
function buyPointUpgrade() { if(points>=25){points-=25; pointsPerDrink++; alert(`+${pointsPerDrink} points per drink!`); saveGame(); updateButtons();} }

function buyTimeStop() {
  const cost = timeStopBaseCost*(timeStopLevel+1);
  if(gameActive) return alert("Can't buy during a round!");
  if(points>=cost){
    points-=cost;
    timeStopLevel++;
    timeStopDuration=5*timeStopLevel;
    alert(`Time Stop upgraded to Level ${timeStopLevel}! Duration: ${timeStopDuration}s`);
    saveGame();
    updateButtons();
    updateTimeStopUI();
  } else alert(`Need ${cost} points to buy/upgrade Time Stop!`);
}

function activateTimeStop() {
  if(!gameActive || timeStopLevel===0 || timeStopActive) return;
  timePaused=true;
  timeStopActive=true;
  if(activeSkin==="Dio Roberto") document.body.style.filter="grayscale(100%)";
  activateTimeStopBtn.disabled=true;
  setTimeout(()=>{
    timePaused=false;
    timeStopActive=false;
    if(activeSkin==="Dio Roberto") applySkin(); // revert color
    activateTimeStopBtn.disabled=false;
  }, timeStopDuration*1000);
}

// ====================== SKINS ======================
function gambleSkin() {
  if(points<1000) return alert("Need 1000 points to gamble!");
  if(timeStopLevel<5) return alert("Time Stop level 5 required to gamble for Dio Roberto!");
  points-=1000;
  skins[0].unlocked=true;
  alert("You unlocked the skin: Dio Roberto!");
  saveGame();
  updateSkinMenu();
  updateButtons();
}

function updateSkinMenu() {
  skinsList.innerHTML='';
  skins.forEach((skin,index)=>{
    const li=document.createElement('li');
    li.textContent=skin.name+(skin.unlocked?" ✅":" ❌");
    if(skin.unlocked){
      li.style.cursor='pointer';
      li.onclick=()=>{ selectedSkin=index; equipSkinBtn.disabled=false; }
    }
    skinsList.appendChild(li);
  });
}

function equipSkin() {
  if(selectedSkin===null) return;
  activeSkin=skins[selectedSkin].name;
  alert(`Equipped: ${activeSkin}`);
  applySkin();
  saveGame();
}

function applySkin(){
  if(activeSkin==="Dio Roberto"){
    document.body.style.background="linear-gradient(135deg, #ffff70, #ffeb3b)";
    drinkImg.style.filter="hue-rotate(45deg)";
  } else {
    document.body.style.background="linear-gradient(135deg, #ffb6c1, #ff6f91)";
    drinkImg.style.filter="hue-rotate(0deg)";
  }
}

// ====================== LOCAL STORAGE ======================
function saveGame(){
  const data={
    points,
    bonusSeconds,
    pointsPerDrink,
    timeStopLevel,
    skins: skins.map(s=>s.unlocked),
    activeSkin
  };
  localStorage.setItem('robertDrinkSave', JSON.stringify(data));
}

function loadGame(){
  const data = JSON.parse(localStorage.getItem('robertDrinkSave'));
  if(!data) return;
  points = data.points||0;
  bonusSeconds = data.bonusSeconds||0;
  pointsPerDrink = data.pointsPerDrink||1;
  timeStopLevel = data.timeStopLevel||0;
  data.skins.forEach((unlocked,i)=>skins[i].unlocked=unlocked);
  activeSkin = data.activeSkin||null;
  applySkin();
  updateSkinMenu();
  updateButtons();
}

function updateButtons(){
  addSecondBtn.disabled = points<5;
  addPointBtn.disabled = points<25;
  buyTimeStopBtn.disabled = points<timeStopBaseCost*(timeStopLevel+1)||gameActive;
  activateTimeStopBtn.disabled = timeStopLevel===0||!gameActive;
  gambleSkinBtn.disabled = points<1000 || timeStopLevel<5;
  equipSkinBtn.disabled = selectedSkin===null;
}

function updateTimeStopUI(){
  const nextCost = timeStopBaseCost*(timeStopLevel+1);
  timeStopInfo.textContent=`Level: ${timeStopLevel} | Cost: ${nextCost} pts`;
}

// Load on start
window.onload = loadGame;
