// Global Game State
const gameState = {
  currentLevel: "beginner",  // default to beginner level
  currentSublevel: 1,
  totalSublevels: 20,
  currentQuestion: null,
  currentAnswer: null,
  trialCount: 0, // count of attempts per question
  score: 0,
  playerName: ""
};

// Use localStorage to store previous scores as an array of objects: { name, score }
const SCORE_STORAGE_KEY = "linguaScores";

// Beginner sublevel topics and generators
const beginnerSublevels = [
  {
    name: "Alphabets",
    description: "Identify the letter.",
    generateQuestion: function () {
      // Randomly choose a letter from A-Z
      const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const randomLetter = letters.charAt(Math.floor(Math.random() * letters.length));
      gameState.currentAnswer = randomLetter;
      return `What is the letter shown? <br><strong>${randomLetter}</strong>`;
    }
  },
  {
    name: "Random Letters",
    description: "Identify a randomly generated letter (in lower case).",
    generateQuestion: function () {
      const letters = "abcdefghijklmnopqrstuvwxyz";
      const randomLetter = letters.charAt(Math.floor(Math.random() * letters.length));
      gameState.currentAnswer = randomLetter;
      return `Identify the letter: <br><strong>${randomLetter}</strong>`;
    }
  },
  {
    name: "Combine Letters to Form a Word",
    description: "Arrange the letters to form a common word.",
    generateQuestion: function () {
      const words = ["cat", "dog", "sun", "book", "tree"];
      const word = words[Math.floor(Math.random() * words.length)];
      // Shuffle the letters
      const shuffled = word.split("").sort(() => 0.5 - Math.random()).join("");
      gameState.currentAnswer = word;
      return `Rearrange the letters to form a word: <br><strong>${shuffled}</strong>`;
    }
  },
  {
    name: "Singular and Plural",
    description: "Type the plural form of the given noun.",
    generateQuestion: function () {
      const nouns = ["cat", "dog", "apple", "book"];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      // Naively add "s" for plural (can be extended)
      gameState.currentAnswer = noun + "s";
      return `What is the plural form of: <strong>${noun}</strong>?`;
    }
  },
  {
    name: "Words and Opposites",
    description: "Provide the opposite of the given word.",
    generateQuestion: function () {
      const opposites = {
        hot: "cold",
        up: "down",
        big: "small",
        fast: "slow"
      };
      const keys = Object.keys(opposites);
      const word = keys[Math.floor(Math.random() * keys.length)];
      gameState.currentAnswer = opposites[word];
      return `What is the opposite of: <strong>${word}</strong>?`;
    }
  },
  {
    name: "Parts of Speech",
    description: "Identify the part of speech for the given word.",
    generateQuestion: function () {
      const parts = [
        { word: "run", pos: "verb" },
        { word: "happy", pos: "adjective" },
        { word: "quickly", pos: "adverb" },
        { word: "book", pos: "noun" }
      ];
      const item = parts[Math.floor(Math.random() * parts.length)];
      gameState.currentAnswer = item.pos;
      return `What part of speech is the word: <strong>${item.word}</strong>?<br>(noun, verb, adjective, adverb)`;
    }
  },
  {
    name: "Sentence Formation",
    description: "Form a complete sentence using the given words.",
    generateQuestion: function () {
      const words = ["I", "love", "learning", "English"];
      gameState.currentAnswer = ""; // open answer; manual review if needed
      return `Use the following words to form a sentence (order is not fixed): <br><strong>${words.join(" ")}</strong>`;
    }
  },
  {
    name: "Present to Past Tense",
    description: "Convert the present tense sentence to past tense.",
    generateQuestion: function () {
      const sentences = [
        { present: "I walk to school.", past: "I walked to school." },
        { present: "She eats an apple.", past: "She ate an apple." }
      ];
      const sent = sentences[Math.floor(Math.random() * sentences.length)];
      gameState.currentAnswer = sent.past;
      return `Convert this sentence to past tense: <br><strong>${sent.present}</strong>`;
    }
  }
];

// If there are less than 20 sublevels, repeat some to fill up.
while (beginnerSublevels.length < 20) {
  beginnerSublevels.push(...beginnerSublevels.slice(0, 20 - beginnerSublevels.length));
}

// --------------------
// Modal helper functions
// --------------------
function showModal(contentHTML, callback) {
  const popup = document.getElementById("popup-modal");
  const popupContent = document.getElementById("popup-content");
  popupContent.innerHTML = contentHTML;
  popup.style.display = "block";
  // If callback is provided, call it when user clicks anywhere in the modal
  popup.onclick = function () {
    popup.style.display = "none";
    if (callback) callback();
  };
}

function showIntroModal() {
  document.getElementById("intro-modal").style.display = "block";
}

function hideIntroModal() {
  document.getElementById("intro-modal").style.display = "none";
}

// --------------------
// Score Management
// --------------------
function updateScore(amount) {
  gameState.score += amount;
  document.getElementById("current-score").textContent = gameState.score;
}

function saveScore() {
  let scores = JSON.parse(localStorage.getItem(SCORE_STORAGE_KEY)) || [];
  scores.push({ name: gameState.playerName, score: gameState.score });
  localStorage.setItem(SCORE_STORAGE_KEY, JSON.stringify(scores));
}

function checkForHighScore() {
  let scores = JSON.parse(localStorage.getItem(SCORE_STORAGE_KEY)) || [];
  const maxScore = scores.reduce((max, entry) => (entry.score > max ? entry.score : max), 0);
  if (gameState.score > maxScore) {
    showModal(`<h3>New High Score!</h3><p>Congratulations, ${gameState.playerName}! Your score is now ${gameState.score}.</p>`);
  }
}

// --------------------
// Game Flow Functions
// --------------------
function loadLevel(level) {
  gameState.currentLevel = level;
  if (level === "beginner") {
    loadBeginnerMenu();
  } else {
    // Placeholder for other levels
    document.getElementById("game-container").innerHTML = `<p>${level} level is under construction.</p>`;
  }
}

function loadBeginnerMenu() {
  gameState.currentSublevel = 1;
  const container = document.getElementById("game-container");
  let html = `<h2>Beginner Level</h2>`;
  html += `<p>Select a sublevel (1 to ${gameState.totalSublevels}):</p>`;
  html += `<div id="sublevels">`;
  for (let i = 1; i <= gameState.totalSublevels; i++) {
    html += `<button class="sublevel-btn" data-sublevel="${i}">Sublevel ${i}</button>`;
  }
  html += `</div>`;
  container.innerHTML = html;
  document.querySelectorAll(".sublevel-btn").forEach(btn => {
    btn.addEventListener("click", function () {
      const sublevel = parseInt(this.getAttribute("data-sublevel"));
      startSublevel(sublevel);
    });
  });
}

function startSublevel(sublevelNumber) {
  gameState.currentSublevel = sublevelNumber;
  gameState.trialCount = 0;
  // Use the corresponding sublevel generator (wrap-around if needed)
  const index = (sublevelNumber - 1) % beginnerSublevels.length;
  const sublevelData = beginnerSublevels[index];
  const questionHTML = sublevelData.generateQuestion();
  displayQuestion(sublevelData.name, questionHTML);
}

function displayQuestion(topic, questionHTML) {
  const container = document.getElementById("game-container");
  let html = `<h2>Beginner - Sublevel ${gameState.currentSublevel}: ${topic}</h2>`;
  html += `<div class="question">${questionHTML}</div>`;
  html += `<input type="text" id="user-answer" placeholder="Type your answer here" />`;
  html += `<button id="submit-answer">Submit</button>`;
  html += `<button id="back-to-menu">Back to Sublevels</button>`;
  html += `<div class="feedback" id="feedback"></div>`;
  container.innerHTML = html;
  document.getElementById("submit-answer").addEventListener("click", checkAnswer);
  document.getElementById("back-to-menu").addEventListener("click", loadBeginnerMenu);
}

function checkAnswer() {
  const userAnswer = document.getElementById("user-answer").value.trim().toLowerCase();
  const correctAnswer = (gameState.currentAnswer || "").toLowerCase();
  const feedbackEl = document.getElementById("feedback");

  // For open answers (like sentence formation), we simply record the answer.
  if (correctAnswer === "") {
    feedbackEl.innerHTML = `<span class="correct-icon">&#10004;</span> Your answer has been recorded.`;
    updateScore(1);
    setTimeout(() => levelComplete(), 1500);
    return;
  }

  // Check answer
  if (userAnswer === correctAnswer) {
    feedbackEl.innerHTML = `<span class="correct-icon">&#10004;</span> Correct!`;
    updateScore(1);
    setTimeout(() => levelComplete(), 1500);
  } else {
    gameState.trialCount++;
    feedbackEl.innerHTML = `<span class="incorrect-icon">&#10008;</span> Incorrect.`;
    // If three incorrect trials, show game over popup
    if (gameState.trialCount >= 3) {
      gameOver();
    }
  }
}

function levelComplete() {
  // Popup for level complete and display current score
  showModal(`<h3>Sublevel ${gameState.currentSublevel} Complete!</h3><p>Your current score is: ${gameState.score}</p>`, () => {
    // After closing popup, if not at the last sublevel, go back to menu.
    if (gameState.currentSublevel < gameState.totalSublevels) {
      loadBeginnerMenu();
    } else {
      // If all sublevels are done, end game.
      gameOver();
    }
    // Check and show high score message if applicable.
    checkForHighScore();
  });
}

function gameOver() {
  // Save the score
  saveScore();
  showModal(`<h3>Game Over</h3><p>Player: ${gameState.playerName}</p><p>Your final score is: ${gameState.score}</p><button id="new-game">Start New Game</button>`, () => {
    // Do nothing on modal background click.
  });
  // Add event listener for new game button in the popup content.
  document.getElementById("popup-content").addEventListener("click", function (e) {
    if (e.target && e.target.id === "new-game") {
      resetGame();
    }
  });
}

function resetGame() {
  // Reset game state and start from beginner sublevel 1.
  gameState.currentLevel = "beginner";
  gameState.currentSublevel = 1;
  gameState.score = 0;
  gameState.trialCount = 0;
  document.getElementById("current-score").textContent = gameState.score;
  loadBeginnerMenu();
}

// --------------------
// Event Listeners for Level Selection and Intro Modal
// --------------------
document.querySelectorAll("nav button").forEach(btn => {
  btn.addEventListener("click", function () {
    loadLevel(this.getAttribute("data-level"));
  });
});

document.getElementById("start-game").addEventListener("click", function () {
  const nameInput = document.getElementById("player-name").value.trim();
  if (nameInput === "") {
    alert("Please enter your name to continue.");
    return;
  }
  gameState.playerName = nameInput;
  document.getElementById("current-player").textContent = gameState.playerName;
  hideIntroModal();
  // Automatically start from beginner level sublevel 1
  loadBeginnerMenu();
});

// --------------------
// Start: Show intro modal on load
// --------------------
window.onload = function () {
  showIntroModal();
};
