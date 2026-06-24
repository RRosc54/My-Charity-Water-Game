// Water Collector Game

const gameBoard = document.getElementById("gameBoard");
const levelDisplay = document.getElementById("levelDisplay");
const timerDisplay = document.getElementById("timerDisplay");
const movesDisplay = document.getElementById("movesDisplay");
const scoreDisplay = document.getElementById("scoreDisplay");
const livesDisplay = document.getElementById("livesDisplay");
const message = document.getElementById("message");

const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const nextBtn = document.getElementById("nextBtn");

const upBtn = document.getElementById("upBtn");
const downBtn = document.getElementById("downBtn");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

const celebration = document.getElementById("celebration");

// Game state
let level = 1;
let score = 0;
let moves = 0;
let lives = 3;
let timeLeft = 30;
let timer = null;
let gameActive = false;

let rows = 5;
let cols = 5;

let playerPosition = { row: 0, col: 0 };
let bucketPosition = { row: 4, col: 4 };

let blockedCells = [];
let filledCells = [];

// Create random level
function createLevel() {
  rows = 5;
  cols = 5;

  // Timer gets slightly harder each level, but not too hard
  timeLeft = Math.max(15, 32 - level * 2);

  playerPosition = {
    row: 0,
    col: 0
  };

  bucketPosition = {
    row: rows - 1,
    col: cols - 1
  };

  blockedCells = [];
  filledCells = [];

  // Start square counts as filled
  filledCells.push(positionKey(playerPosition.row, playerPosition.col));

  generateRandomBlocks();
  updateDisplay();
  drawBoard();

  message.textContent = "Fill every square, then reach the bucket!";
}

// Random obstacle generation
function generateRandomBlocks() {
  const numberOfBlocks = Math.min(2 + level, 6);

  while (blockedCells.length < numberOfBlocks) {
    const randomRow = Math.floor(Math.random() * rows);
    const randomCol = Math.floor(Math.random() * cols);

    const key = positionKey(randomRow, randomCol);

    const isStart = randomRow === playerPosition.row && randomCol === playerPosition.col;
    const isBucket = randomRow === bucketPosition.row && randomCol === bucketPosition.col;

    if (!isStart && !isBucket && !blockedCells.includes(key)) {
      blockedCells.push(key);
    }
  }
}

// Draw board
function drawBoard() {
  gameBoard.innerHTML = "";
  gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = document.createElement("div");
      const key = positionKey(row, col);

      cell.classList.add("cell");

      if (filledCells.includes(key)) {
        cell.classList.add("filled");
      }

      if (blockedCells.includes(key)) {
        cell.classList.add("blocked");
        cell.textContent = "✕";
      }

      if (row === bucketPosition.row && col === bucketPosition.col) {
        cell.classList.add("bucket");
        cell.textContent = "🪣";
      }

      if (row === playerPosition.row && col === playerPosition.col) {
        cell.classList.add("player");
        cell.textContent = "💧";
      }

      gameBoard.appendChild(cell);
    }
  }
}

// Start game
function startGame() {
  if (gameActive) return;

  gameActive = true;
  nextBtn.style.display = "none";
  message.textContent = "Game started! Move the water drop.";

  clearInterval(timer);

  timer = setInterval(() => {
    timeLeft--;
    updateDisplay();

    if (timeLeft <= 0) {
      loseLife();
    }
  }, 1000);
}

// Move player
function movePlayer(direction) {
  if (!gameActive) {
    message.textContent = "Press Start Game first!";
    return;
  }

  let newRow = playerPosition.row;
  let newCol = playerPosition.col;

  if (direction === "up") newRow--;
  if (direction === "down") newRow++;
  if (direction === "left") newCol--;
  if (direction === "right") newCol++;

  if (!isValidMove(newRow, newCol)) {
    message.textContent = "You can't move there!";
    return;
  }

  playerPosition.row = newRow;
  playerPosition.col = newCol;
  moves++;

  const key = positionKey(newRow, newCol);

  if (!filledCells.includes(key) && !isBucket(newRow, newCol)) {
    filledCells.push(key);
    score += 5;
    message.textContent = "Square filled! +5 points";
  } else {
    message.textContent = "Keep going!";
  }

  checkBucket();
  updateDisplay();
  drawBoard();
}

// Check if move is legal
function isValidMove(row, col) {
  const key = positionKey(row, col);

  const insideGrid = row >= 0 && row < rows && col >= 0 && col < cols;
  const isBlocked = blockedCells.includes(key);

  return insideGrid && !isBlocked;
}

// Check if player reached bucket
function checkBucket() {
  if (!isBucket(playerPosition.row, playerPosition.col)) {
    return;
  }

  if (allSquaresFilled()) {
    winLevel();
  } else {
    message.textContent = "Fill all squares before reaching the bucket!";
  }
}

// Check all open squares are filled
function allSquaresFilled() {
  let totalOpenSquares = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const key = positionKey(row, col);

      if (!blockedCells.includes(key) && !isBucket(row, col)) {
        totalOpenSquares++;
      }
    }
  }

  return filledCells.length >= totalOpenSquares;
}

// Win level
function winLevel() {
  gameActive = false;
  clearInterval(timer);

  const timeBonus = timeLeft * 10;
  const movePenalty = moves * 2;
  const levelBonus = 100;

  score += Math.max(levelBonus + timeBonus - movePenalty, 25);

  message.textContent = "Level Complete! You delivered clean water!";
  nextBtn.style.display = "inline-block";

  updateDisplay();
  drawBoard();
  showCelebration();
}

// Lose life
function loseLife() {
  gameActive = false;
  clearInterval(timer);

  lives--;

  if (lives > 0) {
    message.textContent = `Time's up! You lost a life. Lives left: ${lives}`;
    resetCurrentLevel();
  } else {
    message.textContent = "Game over! You ran out of lives.";
    fullReset();
  }

  updateDisplay();
}

// Reset current level after losing life
function resetCurrentLevel() {
  setTimeout(() => {
    moves = 0;
    createLevel();
  }, 1200);
}

// Full reset after losing all lives
function fullReset() {
  setTimeout(() => {
    level = 1;
    score = 0;
    moves = 0;
    lives = 3;
    createLevel();
  }, 1500);
}

// Next level
function nextLevel() {
  level++;
  moves = 0;
  createLevel();
  nextBtn.style.display = "none";
}

// Manual reset
function resetGame() {
  clearInterval(timer);

  level = 1;
  score = 0;
  moves = 0;
  lives = 3;
  gameActive = false;

  createLevel();
  nextBtn.style.display = "none";
  message.textContent = "Game reset. Press Start Game to play again.";
}

// Celebration animation
function showCelebration() {
  celebration.classList.remove("hidden");

  setTimeout(() => {
    celebration.classList.add("hidden");
  }, 1600);
}

// Helpers
function positionKey(row, col) {
  return `${row}-${col}`;
}

function isBucket(row, col) {
  return row === bucketPosition.row && col === bucketPosition.col;
}

function updateDisplay() {
  levelDisplay.textContent = level;
  timerDisplay.textContent = timeLeft;
  movesDisplay.textContent = moves;
  scoreDisplay.textContent = score;
  livesDisplay.textContent = "💧".repeat(lives);
}

// Keyboard controls
document.addEventListener("keydown", function(event) {
  if (event.key === "ArrowUp" || event.key.toLowerCase() === "w") {
    movePlayer("up");
  }

  if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") {
    movePlayer("down");
  }

  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
    movePlayer("left");
  }

  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
    movePlayer("right");
  }
});

// Button controls
startBtn.addEventListener("click", startGame);
resetBtn.addEventListener("click", resetGame);
nextBtn.addEventListener("click", nextLevel);

upBtn.addEventListener("click", () => movePlayer("up"));
downBtn.addEventListener("click", () => movePlayer("down"));
leftBtn.addEventListener("click", () => movePlayer("left"));
rightBtn.addEventListener("click", () => movePlayer("right"));

// Load first level
createLevel();