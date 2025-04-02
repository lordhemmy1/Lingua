// Game state
const gameState = {
  currentSublevel: 1,
  totalSublevels: 500,
  currentAnswer: "",
  score: 0,
  playerName: ""
};

// Beginner structured sublevels
const beginnerSublevels = [];
const dictionaryAPI = "https://api.dictionaryapi.dev/api/v2/entries/en/";

// Generate structured questions
for (let i = 1; i <= 500; i++) {
  beginnerSublevels.push({
    sublevel: i,
    generateQuestion: function () {
      if (i <= 50) return generateAlphabetQuestion();
      if (i <= 100) return generateWordFormation();
      if (i <= 150) return generateFillGaps();
      return generateSentenceFormation();
    }
  });
}

// Sample question generators
function generateAlphabetQuestion() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const randomLetter = letters.charAt(Math.floor(Math.random() * letters.length));
  gameState.currentAnswer = randomLetter;
  return `What is this uppercase letter? <strong>${randomLetter}</strong>`;
}

function generateWordFormation() {
  const words = ["CAT", "DOG", "SUN", "TREE"];
  const word = words[Math.floor(Math.random() * words.length)];
  const shuffled = word.split("").sort(() => 0.5 - Math.random()).join("");
  gameState.currentAnswer = word;
  return `Rearrange to form a word: <strong>${shuffled}</strong>`;
}

// Validate dictionary words
async function validateWord(word) {
  try {
    let response = await fetch(dictionaryAPI + word.toLowerCase());
    return response.ok;
  } catch {
    return false;
  }
}

// Check answer
function checkAnswer() {
  const userInput = document.getElementById("user-answer").value.trim();
  const correctAnswer = gameState.currentAnswer;

  if (userInput === correctAnswer) {
    updateScore(1);
    if (gameState.currentSublevel < gameState.totalSublevels) {
      gameState.currentSublevel++;
      startSublevel(gameState.currentSublevel);
    } else {
      showCompletionModal();
    }
  } else {
    alert("Incorrect. Try again.");
  }
}

// Start sublevel
function startSublevel(sublevel) {
  gameState.currentSublevel = sublevel;
  const sublevelData = beginnerSublevels[sublevel - 1];
  const questionHTML = sublevelData.generateQuestion();
  displayQuestion(questionHTML);
}

function displayQuestion(questionHTML) {
  const container = document.getElementById("game-container");
  container.innerHTML = `<h2>Beginner - Sublevel ${gameState.currentSublevel}</h2>`;
  container.innerHTML += `<div>${questionHTML}</div>`;
  container.innerHTML += `<input type="text" id="user-answer" />`;
  container.innerHTML += `<button onclick="checkAnswer()">Submit</button>`;
}

// Score update
function updateScore(points) {
  gameState.score += points;
  document.getElementById("current-score").innerText = gameState.score;
}

// Completion modal
function showCompletionModal() {
  document.getElementById("completion-modal").style.display = "block";
}

// Event listeners
document.getElementById("start-game").addEventListener("click", function () {
  const nameInput = document.getElementById("player-name").value.trim();
  if (nameInput) {
    gameState.playerName = nameInput;
    document.getElementById("current-player").innerText = nameInput;
    document.getElementById("intro-modal").style.display = "none";
    startSublevel(1);
  } else {
    alert("Please enter your name.");
  }
});

document.getElementById("restart-beginner").addEventListener("click", function () {
  gameState.currentSublevel = 1;
  gameState.score = 0;
  document.getElementById("completion-modal").style.display = "none";
  startSublevel(1);
});
