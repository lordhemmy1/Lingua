// Global Game State
const gameState = {
  currentLevel: "beginner",  // default level
  currentSublevel: 1,
  totalSublevels: 500,
  currentQuestion: null,
  currentAnswer: null,
  trialCount: 0, // attempts for current question
  score: 0,
  playerName: ""
};

// Local storage key for scores
const SCORE_STORAGE_KEY = "linguaScores";

// -----------------------------
// Helper: Fetch definition from dictionary API with error handling
// -----------------------------
async function fetchDefinition(word) {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    // Get first definition from first meaning
    const definition = data[0].meanings[0].definitions[0].definition;
    return definition;
  } catch (error) {
    console.error("Error fetching definition:", error);
    return "No definition available.";
  }
}

// -----------------------------
// Topics & Question Generators for Beginner Class
// There are 13 topics; each gets roughly totalSublevels/13 sublevels (~38 each)
// -----------------------------
const topics = [
  {
    name: "Alphabets & Phonics",
    generateQuestion: function(subIdx) {
      const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const letter = letters[subIdx % letters.length];
      gameState.currentAnswer = letter;
      return `Identify the letter shown: <br><strong>${letter} (sounds like '${letter.toLowerCase()}')</strong><br><em>Answer in UPPERCASE</em>`;
    }
  },
  {
    name: "Letter Formation",
    generateQuestion: async function(subIdx) {
      const words = ["CAT", "DOG", "SUN", "BOOK", "TREE"];
      const word = words[subIdx % words.length];
      const shuffled = word.split("").sort(() => 0.5 - Math.random()).join("");
      let hint = "";
      try {
        const def = await fetchDefinition(word);
        hint = `<br><em>Hint: ${def}</em>`;
      } catch(e) {
        hint = "";
      }
      gameState.currentAnswer = word;
      return `Rearrange the letters to form a word: <br><strong>${shuffled}</strong>${hint}<br><em>Answer in UPPERCASE</em>`;
    }
  },
  {
    name: "Fill in the Gaps",
    generateQuestion: function(subIdx) {
      const sentences = [
        { text: "I ___ English.", missing: "LOVE" },
        { text: "She ___ to school.", missing: "GOES" },
        { text: "They ___ playing.", missing: "ARE" }
      ];
      const s = sentences[subIdx % sentences.length];
      gameState.currentAnswer = s.missing;
      return `Fill in the blank: <br><strong>${s.text}</strong><br><em>Answer in UPPERCASE</em>`;
    }
  },
  {
    name: "Dictation",
    generateQuestion: function(subIdx) {
      const sentences = [
        { text: "Today is a ___ day.", missing: "SUNNY" },
        { text: "He is ___ at math.", missing: "GREAT" }
      ];
      const s = sentences[subIdx % sentences.length];
      gameState.currentAnswer = s.missing;
      return `Listen to the dictation and fill in the gap: <br><strong>${s.text}</strong><br><em>Answer in UPPERCASE</em>`;
    }
  },
  {
    name: "Parts of Speech",
    generateQuestion: function(subIdx) {
      const items = [
        { word: "RUN", pos: "VERB" },
        { word: "HAPPY", pos: "ADJECTIVE" },
        { word: "QUICKLY", pos: "ADVERB" },
        { word: "BOOK", pos: "NOUN" },
        { word: "WOW", pos: "INTERJECTION" }
      ];
      const item = items[subIdx % items.length];
      gameState.currentAnswer = item.pos;
      return `Identify the part of speech for the word: <br><strong>${item.word}</strong><br>(NOUN, PRONOUN, VERB, ADJECTIVE, ADVERB, PREPOSITION, CONJUNCTION, INTERJECTION)<br><em>Answer in UPPERCASE</em>`;
    }
  },
  {
    name: "Punctuations",
    generateQuestion: function(subIdx) {
      const sentences = [
        { text: "Hello how are you", punctuation: "HELLO, HOW ARE YOU?" },
        { text: "Wait stop right there", punctuation: "WAIT! STOP RIGHT THERE." }
      ];
      const s = sentences[subIdx % sentences.length];
      gameState.currentAnswer = s.punctuation;
      return `Insert proper punctuation: <br><strong>${s.text}</strong><br><em>Answer exactly as expected (including punctuation) in UPPERCASE</em>`;
    }
  },
  {
    name: "Articles",
    generateQuestion: function(subIdx) {
      const sentences = [
        { text: "I saw ___ elephant.", missing: "AN" },
        { text: "He is ___ best player.", missing: "THE" }
      ];
      const s = sentences[subIdx % sentences.length];
      gameState.currentAnswer = s.missing;
      return `Choose the correct article to fill in: <br><strong>${s.text}</strong><br><em>Answer in UPPERCASE</em>`;
    }
  },
  {
    name: "Singular and Plural",
    generateQuestion: function(subIdx) {
      const nouns = [
        { singular: "CAT", plural: "CATS" },
        { singular: "BUS", plural: "BUSES" },
        { singular: "CHERRY", plural: "CHERRIES" },
        { singular: "WOLF", plural: "WOLVES" }
      ];
      const item = nouns[subIdx % nouns.length];
      gameState.currentAnswer = item.plural;
      return `Convert to plural: <br><strong>${item.singular}</strong><br><em>Answer in UPPERCASE</em>`;
    }
  },
  {
    name: "Present Tense",
    generateQuestion: function(subIdx) {
      const verbs = [
        { present: "I PLAY", continuous: "I AM PLAYING" },
        { present: "SHE READS", continuous: "SHE IS READING" }
      ];
      const item = verbs[subIdx % verbs.length];
      gameState.currentAnswer = item.continuous;
      return `Convert to present continuous tense: <br><strong>${item.present}</strong><br><em>Answer in UPPERCASE</em>`;
    }
  },
  {
    name: "Past Tense",
    generateQuestion: function(subIdx) {
      const verbs = [
        { present: "I WALK", past: "I WALKED" },
        { present: "SHE EATS", past: "SHE ATE" }
      ];
      const item = verbs[subIdx % verbs.length];
      gameState.currentAnswer = item.past;
      return `Convert to simple past tense: <br><strong>${item.present}</strong><br><em>Answer in UPPERCASE</em>`;
    }
  },
  {
    name: "Tenses Trio",
    generateQuestion: function(subIdx) {
      const verbs = [
        { base: "EAT", past: "ATE", participle: "EATEN" },
        { base: "GO", past: "WENT", participle: "GONE" }
      ];
      const item = verbs[subIdx % verbs.length];
      gameState.currentAnswer = `${item.base}, ${item.past}, ${item.participle}`;
      return `Provide the Present, Past, and Past Participle of the verb: <br><strong>${item.base}</strong><br><em>Answer in the format: PRESENT, PAST, PAST PARTICIPLE (UPPERCASE)</em>`;
    }
  },
  {
    name: "Comparatives & Superlatives",
    generateQuestion: function(subIdx) {
      const adjectives = [
        { base: "FAST", comparative: "FASTER", superlative: "FASTEST" },
        { base: "BIG", comparative: "BIGGER", superlative: "BIGGEST" }
      ];
      const item = adjectives[subIdx % adjectives.length];
      gameState.currentAnswer = `${item.comparative}, ${item.superlative}`;
      return `Give the comparative and superlative forms for: <br><strong>${item.base}</strong><br><em>Answer in the format: COMPARATIVE, SUPERLATIVE (UPPERCASE)</em>`;
    }
  },
  {
    name: "Sentence Formation",
    generateQuestion: function(subIdx) {
      const sentences = [
        { jumbled: ["IS", "THIS", "A", "TEST"], correct: "THIS IS A TEST" },
        { jumbled: ["LOVE", "I", "LANGUAGE"], correct: "I LOVE LANGUAGE" }
      ];
      const item = sentences[subIdx % sentences.length];
      const shuffled = item.jumbled.sort(() => 0.5 - Math.random()).join(" ");
      gameState.currentAnswer = item.correct;
      return `Arrange the words to form a correct sentence: <br><strong>${shuffled}</strong><br><em>Answer in UPPERCASE</em>`;
    }
  }
];

// Calculate sublevels per topic
const topicsCount = topics.length;
const sublevelsPerTopic = Math.floor(gameState.totalSublevels / topicsCount);

// -----------------------------
// Utility: Get current topic and local index for a given sublevel
// -----------------------------
function getTopicForSublevel(sublevelNumber) {
  let topicIndex = Math.floor((sublevelNumber - 1) / sublevelsPerTopic);
  if (topicIndex >= topicsCount) topicIndex = topicsCount - 1;
  const localIndex = (sublevelNumber - 1) % sublevelsPerTopic;
  return { topic: topics[topicIndex], localIndex };
}

// -----------------------------
// Modal helper functions
// -----------------------------
function showModal(contentHTML, callback) {
  const popup = document.getElementById("popup-modal");
  const popupContent = document.getElementById("popup-content");
  popupContent.innerHTML = contentHTML;
  popup.style.display = "block";
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

// -----------------------------
// Score Management
// -----------------------------
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

// -----------------------------
// Game Flow Functions
// -----------------------------
function loadLevel(level) {
  gameState.currentLevel = level;
  if (level === "beginner") {
    loadBeginnerMenu();
  } else {
    // For non-beginner levels, display a placeholder message.
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

async function startSublevel(sublevelNumber) {
  gameState.currentSublevel = sublevelNumber;
  gameState.trialCount = 0;
  const { topic, localIndex } = getTopicForSublevel(sublevelNumber);
  let questionHTML;
  // Support asynchronous question generators (like Letter Formation)
  if (topic.generateQuestion.constructor.name === "AsyncFunction") {
    questionHTML = await topic.generateQuestion(localIndex);
  } else {
    questionHTML = topic.generateQuestion(localIndex);
  }
  displayQuestion(topic.name, questionHTML);
}

function displayQuestion(topicName, questionHTML) {
  const container = document.getElementById("game-container");
  let html = `<h2>Beginner - Sublevel ${gameState.currentSublevel}: ${topicName}</h2>`;
  html += `<div class="question">${questionHTML}</div>`;
  html += `<input type="text" id="user-answer" placeholder="Type your answer here" />`;
  html += `<button id="submit-answer">Submit</button>`;
  html += `<button id="back-to-menu">Back to Sublevels</button>`;
  html += `<div class="feedback" id="feedback"></div>`;
  container.innerHTML = html;
  document.getElementById("submit-answer").addEventListener("click", checkAnswer);
  document.getElementById("back-to-menu").addEventListener("click", loadBeginnerMenu);
}

async function checkAnswer() {
  const userAnswer = document.getElementById("user-answer").value.trim();
  const correctAnswer = gameState.currentAnswer; // Expected answer in UPPERCASE
  const feedbackEl = document.getElementById("feedback");

  // Check case-sensitivity (user must enter answer exactly)
  if (userAnswer === correctAnswer) {
    feedbackEl.innerHTML = `<span class="correct-icon">&#10004;</span> Correct!`;
    updateScore(1);
    // Automatically move to the next sublevel after 1.5 seconds
    setTimeout(() => nextSublevel(), 1500);
  } else {
    gameState.trialCount++;
    feedbackEl.innerHTML = `<span class="incorrect-icon">&#10008;</span> Incorrect.`;
    if (gameState.trialCount >= 3) {
      gameOver();
    }
  }
}

function nextSublevel() {
  if (gameState.currentSublevel < gameState.totalSublevels) {
    startSublevel(gameState.currentSublevel + 1);
  } else {
    // All 500 sublevels completed: show congratulatory popup.
    showModal(`<h3>Congratulations!</h3>
      <p>You have completed the Beginner Class!</p>
      <button id="restart-beginner">Restart Beginner Class</button>
      <button id="goto-intermediate">Go to Intermediate Level</button>`, () => {});
    document.getElementById("popup-content").addEventListener("click", function(e) {
      if (e.target && e.target.id === "restart-beginner") {
        resetGame();
      } else if (e.target && e.target.id === "goto-intermediate") {
        loadLevel("intermediate");
      }
    });
  }
}

function gameOver() {
  saveScore();
  showModal(`<h3>Game Over</h3>
    <p>Player: ${gameState.playerName}</p>
    <p>Your final score is: ${gameState.score}</p>
    <button id="new-game">Start New Game</button>`, () => {});
  document.getElementById("popup-content").addEventListener("click", function(e) {
    if (e.target && e.target.id === "new-game") {
      resetGame();
    }
  });
}

function resetGame() {
  gameState.currentLevel = "beginner";
  gameState.currentSublevel = 1;
  gameState.score = 0;
  gameState.trialCount = 0;
  document.getElementById("current-score").textContent = gameState.score;
  loadBeginnerMenu();
}

// -----------------------------
// Event Listeners for Level Selection and Intro Modal
// -----------------------------
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
  // Automatically start at beginner level sublevel 1
  loadBeginnerMenu();
});

// -----------------------------
// Start: Show intro modal on load
// -----------------------------
window.onload = function () {
  showIntroModal();
};
