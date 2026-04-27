let score = 0;
let time = 60;
let gameRunning = false;

const target = document.getElementById("target");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const gameArea = document.getElementById("gameArea");

const startBtn = document.getElementById("startBtn");
const nameInput = document.getElementById("playerName");
const leaderboardEl = document.getElementById("leaderboard");

let timerInterval = null;
let moveInterval = null;

// API URL
const API_URL = "https://script.google.com/macros/s/AKfycbxctGU2_rnCxa6hO1DpBco2WsBH70iPqGDKKPaEKorCd71-jzZ2A9Pk1ynrAn2-7gxtVQ/exec";

// move target
function moveTarget() {
  const maxX = gameArea.clientWidth - 60;
  const maxY = gameArea.clientHeight - 60;

  const x = Math.random() * maxX;
  const y = Math.random() * maxY;

  target.style.left = x + "px";
  target.style.top = y + "px";
}

// click = score
target.addEventListener("click", () => {
  if (!gameRunning) return;

  score++;
  scoreEl.textContent = score;

  moveTarget();
});

// start game
startBtn.addEventListener("click", () => {
  if (!nameInput.value) {
    alert("Please enter your name!");
    return;
  }

  startGame();
});

function startGame() {
  score = 0;
  time = 60;
  gameRunning = true;

  scoreEl.textContent = score;
  timeEl.textContent = time;

  moveTarget();
  startTimer();

  clearInterval(moveInterval);
  moveInterval = setInterval(() => {
    if (gameRunning) moveTarget();
  }, 800);
}

// timer
function startTimer() {
  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    if (!gameRunning) return;

    time--;
    timeEl.textContent = time;

    if (time <= 0) {
      endGame();
    }
  }, 1000);
}

// end game
function endGame() {
  gameRunning = false;

  clearInterval(timerInterval);
  clearInterval(moveInterval);

  alert("Game over! Score: " + score);

  saveScore();
  showLeaderboard();
}

// POST score to Google Sheets
function saveScore() {
  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      name: nameInput.value,
      score: score
    })
  })
    .then(async res => {
      const text = await res.text();
      console.log("RAW RESPONSE:", text);
      return JSON.parse(text);
    })
    .then(data => {
      console.log("Saved:", data);
      alert("Score saved!");
    })
    .catch(err => {
      console.error("Save error:", err);
      alert("Failed to save score.");
    });
}

// GET leaderboard
function showLeaderboard() {
  fetch(API_URL)
    .then(res => res.json())
    .then(scores => {

      scores.sort((a, b) => b.score - a.score);

      leaderboardEl.innerHTML = "";

      scores.forEach((entry, index) => {
        const li = document.createElement("li");
        li.textContent = `${index + 1}. ${entry.name}: ${entry.score}`;
        leaderboardEl.appendChild(li);
      });

    })
    .catch(err => {
      console.error("Leaderboard error:", err);
      leaderboardEl.innerHTML = "<li>Could not load leaderboard</li>";
    });
}

moveTarget();
showLeaderboard();
