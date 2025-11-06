// ====== Load Persistent Data ======
let points = parseInt(localStorage.getItem('points')) || 0;
let coins = parseInt(localStorage.getItem('coins')) || 0;
let timeStopLevel = parseInt(localStorage.getItem('timeStopLevel')) || 0;
let unlockedSkins = JSON.parse(localStorage.getItem('unlockedSkins')) || [];
let equippedSkin = localStorage.getItem('equippedSkin') || "default";
let extraSeconds = parseInt(localStorage.getItem('extraSeconds')) || 0;
let extraPoints = parseInt(localStorage.getItem('extraPoints')) || 0;

// ====== Game Variables ======
let timer = 60;
let score = 0;
let gameActive = false;
let cooldown = false;
let timeStopActive = false;
const timeStopBaseCost = 150;

// ====== DOM Elements ======
const startBtn = document.getElementById("startBtn");
const drinkInput = document.getElementById("drinkInput");
const timerDisplay = document.getElementById("timer");
const scoreDisplay = document.getElementById("score");
const pointDisplay = document.getElementById("points");
const addSecondBtn = document.getElementById("addSecondBtn");
const addPointBtn = document.getElementById("addPointBtn");
const buyTimeStopBtn = document.getElementById("buyTimeStopBtn");
const activateTimeStopBtn = document.getElementById("activateTimeStopBtn");
const timeStopLevelDisplay = document.getElementById("timeStopLevel");
const gambleSkinBtn = document.getElementById("gambleSkinBtn");
const skinList = document.getElementById("skinList");
const coinCount = document.getElementById("coinCount");
const resetBtn = document.getElementById("resetBtn");
const body = document.body;
const drinkImg = document.getElementById("drinkImg");

// ====== Save Data ======
function saveProgress() {
  localStorage.setItem('points', points);
  localStorage.setItem('coins', coins);
  localStorage.setItem('timeStopLevel', timeStopLevel);
  localStorage.setItem('unlockedSkins', JSON.stringify(unlockedSkins));
  localStorage.setItem('equippedSkin', equippedSkin);
  localStorage.setItem('extraSeconds', extraSeconds);
  localStorage.setItem('extraPoints', extraPoints);
}

// ====== Reset Progress ======
resetBtn.addEventListener("click", () => {
  if (confirm("⚠️ Are you sure you want to reset all progress?")) {
    localStorage.clear();
    points = 0;
    coins = 0;
    timeStopLevel = 0;
    unlockedSkins = [];
    equippedSkin = "default";
    extraSeconds = 0;
    extraPoints = 0;
    score = 0;
    timer = 60;
    updateDisplay();
  }
});

// ====== Update Display ======
function updateDisplay() {
  pointDisplay.textContent = points;
  scoreDisplay.textContent = score;
  timerDisplay.textContent = timer;
  timeStopLevelDisplay.textContent = timeStopLevel;
  coinCount.textContent = coins;
  updateButtons();
  updateSkinMenu();
  applySkin();
}

// ====== Game ======
startBtn.onclick = () => {
  if (gameActive) return;
  score = 0;
  timer = 60 + extraSeconds;
  gameActive = true;
  drinkInput.disabled = false;
  drinkInput.value = "";
  drinkInput.focus();

  const interval = setInterval(() => {
    if (!timeStopActive) timer--;
    timerDisplay.textContent = timer;
    if (timer <= 0) {
      clearInterval(interval);
      gameActive = false;
      drinkInput.disabled = true;
      points += score;
      coins += Math.floor(score / 5);
      saveProgress();
      updateDisplay();
    }
  }, 1000);
};

drinkInput.addEventListener("input", () => {
  if (!gameActive || cooldown) return;
  if (drinkInput.value.toLowerCase() === "drink") {
    score += 1 + extraPoints;
    drinkInput.value = "";
    cooldown = true;
    setTimeout(() => cooldown = false, 150);
    updateDisplay();
  }
});

// ====== Upgrades ======
addSecondBtn.onclick = () => {
  if (points >= 5) {
    points -= 5;
    extraSeconds++;
    saveProgress();
    updateDisplay();
  }
};

addPointBtn.onclick = () => {
  if (points >= 25) {
    points -= 25;
    extraPoints++;
    saveProgress();
    updateDisplay();
  }
};

// ====== Time Stop ======
buyTimeStopBtn.onclick = () => {
  const cost = timeStopBaseCost * (timeStopLevel + 1);
  if (points >= cost && !gameActive) {
    points -= cost;
    timeStopLevel++;
    saveProgress();
    updateDisplay();
  }
};

activateTimeStopBtn.onclick = () => {
  if (timeStopLevel === 0 || !gameActive || timeStopActive) return;
  timeStopActive = true;
  const duration = 5000 + (timeStopLevel - 1) * 5000;

  if (equippedSkin === "dio") body.style.filter = "grayscale(100%)";

  setTimeout(() => {
    timeStopActive = false;
    if (equippedSkin === "dio") body.style.filter = "none";
  }, duration);
};

// ====== Skins ======
function updateSkinMenu() {
  skinList.innerHTML = "<h4>🎨 Skins</h4>";
  unlockedSkins.forEach(skin => {
    const btn = document.createElement("button");
    btn.textContent = skin === "dio" ? "Dio Roberto" : skin;
    btn.onclick = () => {
      equippedSkin = skin;
      saveProgress();
      updateDisplay();
    };
    if (equippedSkin === skin) btn.style.backgroundColor = "gold";
    skinList.appendChild(btn);
  });
}

gambleSkinBtn.onclick = () => {
  if (points >= 1000 && timeStopLevel >= 5) {
    points -= 1000;
    const chance = Math.random();
    if (chance < 0.25 && !unlockedSkins.includes("dio")) {
      unlockedSkins.push("dio");
      alert("✨ You unlocked Dio Roberto!");
    } else {
      alert("❌ No skin unlocked this time.");
    }
    saveProgress();
    updateDisplay();
  } else if (timeStopLevel < 5) {
    alert("❗ You need Time Stop Level 5 to unlock Dio Roberto!");
  }
};

function applySkin() {
  if (equippedSkin === "dio") {
    body.style.background = "linear-gradient(135deg, #ffeb3b, #fbc02d)";
    drinkImg.style.backgroundColor = "yellow";
  } else {
    body.style.background = "linear-gradient(135deg, #ffb6c1, #ff6f91)";
    drinkImg.style.backgroundColor = "pink";
  }
}

function updateButtons() {
  addSecondBtn.disabled = points < 5;
  addPointBtn.disabled = points < 25;
  buyTimeStopBtn.disabled = points < (150 * (timeStopLevel + 1)) || gameActive;
  activateTimeStopBtn.disabled = timeStopLevel === 0 || !gameActive;
  gambleSkinBtn.disabled = points < 1000 || timeStopLevel < 5;
}

// ====== Initialize ======
updateDisplay();
