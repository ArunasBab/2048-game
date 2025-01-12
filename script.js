const gridElement = document.getElementById("grid");
const scoreElement = document.getElementById("score");

const gridSize = 4;
let grid = [];
let score = 0;

function createGrid() {
  grid = Array(gridSize)
    .fill(null)
    .map(() => Array(gridSize).fill(0));
  gridElement.innerHTML = "";
  for (let i = 0; i < gridSize * gridSize; i++) {
    const tile = document.createElement("div");
    tile.classList.add("tile");
    gridElement.append(tile);
  }
  addRandomTile();
  addRandomTile();
  updateGrid();
}

function updateGrid() {
  const tiles = document.querySelectorAll(".tile");
  let has2048 = false;

  tiles.forEach((tile, index) => {
    const x = Math.floor(index / gridSize);
    const y = index % gridSize;
    const value = grid[x][y];

    tile.textContent = value === 0 ? "" : value; // Atvaizduoja vertę
    tile.dataset.value = value; // Prideda duomenų atributą stiliams

    if (value === 2048) {
      has2048 = true;
    }
  });

  scoreElement.textContent = score;
  if (has2048) {
    showWinMessage();
  }
  // updateRecord();
}

function addRandomTile() {
  const emptyTiles = [];
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      if (grid[x][y] === 0) {
        emptyTiles.push({ x, y });
      }
    }
  }

  if (emptyTiles.length > 0) {
    const { x, y } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
    grid[x][y] = Math.random() < 0.9 ? 2 : 4;
  }
}

function slide(row) {
  const nonZero = row.filter((value) => value !== 0);
  const newRow = [];
  while (nonZero.length > 0) {
    if (nonZero.length > 1 && nonZero[0] === nonZero[1]) {
      newRow.push(nonZero.shift() * 2);
      score += newRow[newRow.length - 1];
      nonZero.shift();
    } else {
      newRow.push(nonZero.shift());
    }
  }
  while (newRow.length < gridSize) {
    newRow.push(0);
  }
  return newRow;
}

function move(direction) {
  let rotated = false;
  let newGrid = grid;

  if (direction === "up" || direction === "down") {
    newGrid = transpose(newGrid);
    rotated = true;
  }

  if (direction === "right" || direction === "down") {
    newGrid = newGrid.map((row) => row.reverse());
  }

  newGrid = newGrid.map(slide);

  if (direction === "right" || direction === "down") {
    newGrid = newGrid.map((row) => row.reverse());
  }

  if (rotated) {
    newGrid = transpose(newGrid);
  }

  if (!gridsEqual(grid, newGrid)) {
    grid = newGrid;
    addRandomTile();
    updateGrid();
    checkGameOver();
  }
}

function transpose(matrix) {
  return matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));
}

function gridsEqual(grid1, grid2) {
  return JSON.stringify(grid1) === JSON.stringify(grid2);
}

function checkGameOver() {
  if (grid.flat().includes(0)) return;
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      const value = grid[x][y];
      if (
        (x > 0 && grid[x - 1][y] === value) ||
        (y > 0 && grid[x][y - 1] === value) ||
        (x < gridSize - 1 && grid[x + 1][y] === value) ||
        (y < gridSize - 1 && grid[x][y + 1] === value)
      ) {
        return;
      }
    }
  }
  alert("Žaidimas baigtas!");
}

document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowUp":
      move("up");
      break;
    case "ArrowDown":
      move("down");
      break;
    case "ArrowLeft":
      move("left");
      break;
    case "ArrowRight":
      move("right");
      break;
  }
});

// Įkeliame rekordą iš localStorage arba nustatome 0, jei nėra
let record = parseInt(localStorage.getItem("record")) || 0;
document.getElementById("record").textContent = record;

function startGame() {
  updateRecord();
  score = 0;
  document.querySelector("#score").textContent = score;

  createGrid();
}

document.querySelector("#restartButton").addEventListener("click", startGame);

startGame();

function updateRecord() {
  if (score > record) {
    record = score;
    localStorage.setItem("record", record);
    document.getElementById("record").textContent = record;
  }
}

function showWinMessage() {
  // Sukuriame pranešimo elementą
  const winMessage = document.createElement("div");
  winMessage.classList.add("win-message");
  winMessage.textContent = "Jūs laimėjote!";

  document.body.append(winMessage);

  setTimeout(() => {
    winMessage.style.display = "none"; // Paslėpti pranešimą po 3 sekundžių
  }, 3000);
}
