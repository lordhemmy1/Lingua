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

const SCORE_STORAGE_KEY = "linguaScores";

// Define topics with progression ranges and generator functions.
// There are 14 topics; we assign roughly equal numbers to cover 500 sublevels.
const topics = [
  { 
    name: "Alphabets & Sounds", 
    sublevels: 36, 
    generateQuestion: () => {
      // Show a letter and its sound (for simplicity, display text sound)
      const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const letter = letters.charAt(Math.floor(Math.random() * letters.length));
      gameState.currentAnswer = letter; // case sensitive: must be uppercase.
      return `Identify the letter and its sound: <strong>${letter}</strong><br>(Expected answer: uppercase letter)`;
    }
  },
  { 
    name: "Letter Combinations", 
    sublevels: 36, 
    generateQuestion: () => {
      // Combine letters to form a word.
      const words = ["CAT", "DOG", "SUN", "BOOK", "TREE"];
      const word = words[Math.floor(Math.random() * words.length)];
      const shuffled = word.split("").sort(() => 0.5 - Math.random()).join("");
      gameState.currentAnswer = word;
      return `Rearrange the letters to form a word: <strong>${shuffled}</strong>`;
    }
  },
  { 
    name: "Fill in the Gaps", 
    sublevels: 36, 
    generateQuestion: () => {
      // Provide a word with a missing letter.
      const words = ["ELEPHANT", "COMPUTER", "LANGUAGE", "KNOWLEDGE"];
      const word = words[Math.floor(Math.random() * words.length)];
      const index = Math.floor(Math.random() * word.length);
      const gapWord = word.substring(0, index) + "_" + word.substring(index + 1);
      gameState.currentAnswer = word;
      return `Fill in the gap: <strong>${gapWord}</strong>`;
    }
  },
  { 
    name: "Vowels & Consonants", 
    sublevels: 36, 
    generateQuestion: () => {
      // Ask whether a given letter is a vowel or consonant.
      const vowels = "AEIOU";
      const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const letter = letters.charAt(Math.floor(Math.random() * letters.length));
      gameState.currentAnswer = vowels.includes(letter) ? "VOWEL" : "CONSONANT";
      return `Is the letter <strong>${letter}</strong> a vowel or a consonant? (Answer in uppercase)`;
    }
  },
  { 
    name: "Dictation (Fill the Gap)", 
    sublevels: 36, 
    generateQuestion: () => {
      // Simulate a dictation where a sentence is missing a word.
      const sentences = [
        { sentence: "I ____ to school every day.", answer: "GO" },
        { sentence: "She ____ a book.", answer: "READS" }
      ];
      const item = sentences[Math.floor(Math.random() * sentences.length)];
      gameState.currentAnswer = item.answer;
      return `Complete the dictation: <strong>${item.sentence}</strong>`;
    }
  },
  { 
    name: "Parts of Speech", 
    sublevels: 36, 
    generateQuestion: () => {
      // Identify the part of speech.
      const parts = [
        { word: "RUN", pos: "VERB" },
        { word: "HAPPY", pos: "ADJECTIVE" },
        { word: "QUICKLY", pos: "ADVERB" },
        { word: "BOOK", pos: "NOUN" }
      ];
      const item = parts[Math.floor(Math.random() * parts.length)];
      gameState.currentAnswer = item.pos;
      return `What part of speech is the word <strong>${item.word}</strong>? (Answer in uppercase)`;
    }
  },
  { 
    name: "Punctuations", 
    sublevels: 36, 
    generateQuestion: () => {
      // Ask about punctuation usage.
      const questions = [
        { q: "Which punctuation mark ends a declarative sentence?", answer: "PERIOD" },
        { q: "Which punctuation mark is used to indicate a pause?", answer: "COMMA" }
      ];
      const item = questions[Math.floor(Math.random() * questions.length)];
      gameState.currentAnswer = item.answer;
      return `<strong>${item.q}</strong>`;
    }
  },
  { 
    name: "Articles", 
    sublevels: 36, 
    generateQuestion: () => {
      // Ask about use of articles.
      const questions = [
        { q: "Which article is used before a vowel sound? (A, AN, or THE)", answer: "AN" },
        { q: "Which article is used for a specific object? (A, AN, or THE)", answer: "THE" }
      ];
      const item = questions[Math.floor(Math.random() * questions.length)];
      gameState.currentAnswer = item.answer;
      return `<strong>${item.q}</strong>`;
    }
  },
  { 
    name: "Singular & Plural", 
    sublevels: 36, 
    generateQuestion: () => {
      // Given a singular noun, ask for the plural.
      const nouns = [
        { singular: "CAT", plural: "CATS" },
        { singular: "BOX", plural: "BOXES" },
        { singular: "BERRY", plural: "BERRIES" }
      ];
      const item = nouns[Math.floor(Math.random() * nouns.length)];
      gameState.currentAnswer = item.plural;
      return `What is the plural of <strong>${item.singular}</strong>?`;
    }
  },
  { 
    name: "Present Tense", 
    sublevels: 36, 
    generateQuestion: () => {
      // Convert a sentence to simple present tense.
      const sentences = [
        { sentence: "She ____ (to go) to school.", answer: "GOES" },
        { sentence: "He ____ (to eat) breakfast.", answer: "EATS" }
      ];
      const item = sentences[Math.floor(Math.random() * sentences.length)];
      gameState.currentAnswer = item.answer;
      return `Fill in the blank in present tense: <strong>${item.sentence}</strong>`;
    }
  },
  { 
    name: "Past Tense", 
    sublevels: 36, 
    generateQuestion: () => {
      // Convert a sentence to simple past tense.
      const sentences = [
        { sentence: "I ____ (to walk) to the park.", answer: "WALKED" },
        { sentence: "They ____ (to play) soccer.", answer: "PLAYED" }
      ];
      const item = sentences[Math.floor(Math.random() * sentences.length)];
      gameState.currentAnswer = item.answer;
      return `Convert to past tense: <strong>${item.sentence}</strong>`;
    }
  },
  { 
    name: "Tenses & Participles", 
    sublevels: 36, 
    generateQuestion: () => {
      // Ask for present, past and past participle forms.
      const verbs = [
        { base: "GO", past: "WENT", participle: "GONE" },
        { base: "EAT", past: "ATE", participle: "EATEN" }
      ];
      const verb = verbs[Math.floor(Math.random() * verbs.length)];
      gameState.currentAnswer = `${verb.base} ${verb.past} ${verb.participle}`;
      return `Provide the base form, simple past, and past participle of the verb: <strong>${verb.base}</strong><br>(Separate your answers by spaces, in uppercase)`;
    }
  },
  { 
    name: "Comparatives & Superlatives", 
    sublevels: 36, 
    generateQuestion: () => {
      // Ask for the comparative and superlative forms.
      const adjectives = [
        { positive: "FAST", comparative: "FASTER", superlative: "FASTEST" },
        { positive: "SMART", comparative: "SMARTER", superlative: "SMARTEST" }
      ];
      const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
      gameState.currentAnswer = `${adj.positive} ${adj.comparative} ${adj.superlative}`;
      return `Provide the positive, comparative, and superlative forms for: <strong>${adj.positive}</strong><br>(Separate answers by spaces, in uppercase)`;
    }
  },
  { 
    name: "Sentence Formation", 
    sublevels: 32, 
    generateQuestion: () => {
      // Provide a set of words to form a sentence.
      const words = ["I", "LOVE", "LEARNING", "ENGLISH"];
      gameState.currentAnswer = ""; // Open answer; assumed correct if not empty.
      return `Form a complete sentence using these words (order is not fixed): <strong>${words.join(" ")}</strong>`;
    }
  }
];

// Build cumulative sublevel ranges for topics.
let cumulative = 0;
topics.forEach(topic => {
  topic.start = cumulative + 1;
  cumulative += topic.sublevels;
  topic.end = cumulative;
});

// Helper: get topic based on current sublevel.
function getCurrentTopic(sublevel) {
  return topics.find(topic => sublevel >= topic.start && sublevel <= topic.end);
}

// --------------------
// Dictionary API example (using free dictionary API)
// --------------------
async function lookupWord(word) {
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
    const data = await res.json();
    // Return the first definition as an example.
    return data[0]?.meanings[0]?.definitions[0]?.definition || "Definition not found.";
  } catch (error) {
    return "Definition not found.";
  }
}

// --------------------
// Modal Helpers
// --------------------
function showModal(contentHTML, callback) {
  const popup = document.getElementById("popup-modal");
  const popupContent = document.getElementById("popup-content");
  popupContent.innerHTML = contentHTML;
  popup.style.display = "block";
  popup.onclick = function (e) {
    // Prevent closing if clicking on a button
    if (e.target.tagName !== "BUTTON") {
      popup.style.display = "none";
      if (callback) callback();
    }
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

// Load Beginner Level Menu: display 500 sublevels in a grid (2 rows)
function loadBeginnerMenu() {
  gameState.currentLevel = "beginner";
  const container = document.getElementById("game-container");
  let html = `<h2>Beginner Level</h2>`;
  html += `<p>Select a sublevel:</p>`;
  html += `<div id="sublevel-grid" class="row">`;
  for (let i = 1; i <= gameState.totalSublevels; i++) {
    html += `<div class="col-6 col-md-2 mb-2">
               <button class="btn btn-outline-primary sublevel-btn" data-sublevel="${i}">SL ${i}</button>
             </div>`;
  }
  html += `</div>`;
  container.innerHTML = html;

  // Add event listeners for sublevel buttons
  document.querySelectorAll(".sublevel-btn").forEach(btn => {
    btn.addEventListener("click", function () {
      const sublevel = parseInt(this.getAttribute("data-sublevel"));
      startSublevel(sublevel);
    });
  });
}

// Start a given sublevel based on number.
function startSublevel(sublevelNumber) {
  gameState.currentSublevel = sublevelNumber;
  gameState.trialCount = 0;
  // Determine topic based on sublevel.
  const topic = getCurrentTopic(sublevelNumber);
  if (!topic) return;
  // Generate question from current topic.
  const questionHTML = topic.generateQuestion();
  displayQuestion(topic.name, questionHTML);
}

// Display a question with answer input.
function displayQuestion(topicName, questionHTML) {
  const container = document.getElementById("game-container");
  let html = `<h2>Beginner - Sublevel ${gameState.currentSublevel}: ${topicName}</h2>`;
  html += `<div class="question mb-3">${questionHTML}</div>`;
  html += `<input type="text" id="user-answer" class="form-control mb-3" placeholder="Type your answer here">`;
  html += `<button id="submit-answer" class="btn btn-success mr-2">Submit</button>`;
  html += `<button id="back-to-menu" class="btn btn-secondary">Back to Sublevels</button>`;
  html += `<div class="feedback mt-3" id="feedback"></div>`;
  container.innerHTML = html;

  document.getElementById("submit-answer").addEventListener("click", checkAnswer);
  document.getElementById("back-to-menu").addEventListener("click", loadBeginnerMenu);
}

// Check answer (case sensitive for uppercase answers).
function checkAnswer() {
  const userAnswer = document.getElementById("user-answer").value.trim();
  const expected = gameState.currentAnswer || "";
  const feedbackEl = document.getElementById("feedback");

  // For open-answer questions (e.g. sentence formation), accept any non-empty answer.
  if (expected === "") {
    if (userAnswer.length > 0) {
      feedbackEl.innerHTML = `<span class="correct-icon">&#10004;</span> Answer recorded.`;
      updateScore(1);
      setTimeout(nextSublevel, 1500);
    } else {
      feedbackEl.innerHTML = `<span class="incorrect-icon">&#10008;</span> Please enter an answer.`;
    }
    return;
  }
  
  // Enforce case sensitivity for uppercase expected answers.
  if (expected === expected.toUpperCase() && userAnswer !== userAnswer.toUpperCase()) {
    feedbackEl.innerHTML = `<span class="incorrect-icon">&#10008;</span> Please enter your answer in uppercase.`;
    gameState.trialCount++;
  } else if (userAnswer === expected) {
    feedbackEl.innerHTML = `<span class="correct-icon">&#10004;</span> Correct!`;
    updateScore(1);
    setTimeout(nextSublevel, 1500);
    return;
  } else {
    feedbackEl.innerHTML = `<span class="incorrect-icon">&#10008;</span> Incorrect.`;
    gameState.trialCount++;
  }
  
  // If 3 trials reached, game over.
  if (gameState.trialCount >= 3) {
    gameOver();
  }
}

// Automatically move to next sublevel.
function nextSublevel() {
  if (gameState.currentSublevel < gameState.totalSublevels) {
    startSublevel(gameState.currentSublevel + 1);
  } else {
    // Completed beginner class.
    saveScore();
    showModal(`<h3>Congratulations, ${gameState.playerName}!</h3>
               <p>You have completed the Beginner Class with a score of ${gameState.score}.</p>
               <button id="restart-beginner" class="btn btn-primary mr-2">Restart Beginner</button>
               <button id="go-intermediate" class="btn btn-success">Move to Intermediate</button>`);
    document.getElementById("popup-content").addEventListener("click", function(e) {
      if (e.target && e.target.id === "restart-beginner") {
        resetGame();
      } else if (e.target && e.target.id === "go-intermediate") {
        // For demo, simply alert.
        alert("Intermediate level is under construction.");
      }
    });
  }
}

function gameOver() {
  saveScore();
  showModal(`<h3>Game Over</h3>
             <p>Player: ${gameState.playerName}</p>
             <p>Your final score is: ${gameState.score}</p>
             <button id="new-game" class="btn btn-primary">Start New Game</button>`);
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

// --------------------
// Event Listeners for Level Selection and Intro Modal
// --------------------
document.querySelectorAll("nav button").forEach(btn => {
  btn.addEventListener("click", function () {
    const level = this.getAttribute("data-level");
    if (level === "beginner") {
      loadBeginnerMenu();
    } else {
      // Placeholder for other levels.
      document.getElementById("game-container").innerHTML = `<p>${level} level is under construction.</p>`;
    }
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
  // Automatically start Beginner class at sublevel 1.
  loadBeginnerMenu();
});

// Start by showing the intro modal.
window.onload = function () {
  showIntroModal();
};
