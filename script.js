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

// ----- Helper Functions -----

// Shuffle an array using Fisher-Yates algorithm.
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// ----- Dictionary / Word Data for Anagrams -----
// Mapping sorted letters (string) to array of valid anagrams.
const wordAnagrams = {
  "KOOB": ["BOOK", "KOBO"],
  "ACT": ["CAT", "ACT"],
  "ABT": ["BAT", "TAB"]
};

// Get a random key from wordAnagrams.
function getRandomAnagramKey() {
  const keys = Object.keys(wordAnagrams);
  return keys[Math.floor(Math.random() * keys.length)];
}

// ----- Topics Definition -----
// There are 14 topics covering 500 sublevels.
// The number of sublevels per topic is adjusted accordingly.
const topics = [
  { 
    name: "Alphabets & Sounds", 
    sublevels: 36, 
    generateQuestion: () => {
      // Mix upper and lower cases randomly.
      const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
      const letter = letters.charAt(Math.floor(Math.random() * letters.length));
      gameState.currentAnswer = letter; // expected answer exactly as generated.
      return `Identify the letter and its sound: <strong>${letter}</strong><br>(Answer must match the case)`;
    }
  },
  { 
    name: "Letter Combinations", 
    sublevels: 36, 
    generateQuestion: () => {
      // Use the wordAnagrams dictionary.
      const key = getRandomAnagramKey();
      const validAnswers = wordAnagrams[key];
      // Choose one valid answer as the "base word".
      const baseWord = validAnswers[0];
      // Create an array of letters.
      const letters = baseWord.split("");
      // Shuffle until the scrambled version is different from any valid answer.
      let shuffled;
      do {
        shuffled = shuffleArray([...letters]).join("");
      } while (validAnswers.includes(shuffled));
      gameState.currentAnswer = validAnswers.join("/"); // Store all valid answers separated by slash.
      return `Rearrange the letters to form a word: <strong>${shuffled}</strong><br>(Acceptable answers: ${gameState.currentAnswer})`;
    }
  },
  { 
    name: "Fill in the Gaps", 
    sublevels: 36, 
    generateQuestion: () => {
      // Use a small dictionary array.
      const words = ["ELEPHANT", "COMPUTER", "LANGUAGE", "KNOWLEDGE"];
      const word = words[Math.floor(Math.random() * words.length)];
      // Choose a random index (not first or last to keep it interesting)
      const index = Math.floor(Math.random() * (word.length - 2)) + 1;
      const correctLetter = word.charAt(index);
      // Generate two random letters different from the correct one.
      let options = [correctLetter];
      while (options.length < 3) {
        const randomLetter = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(Math.floor(Math.random() * 26));
        if (!options.includes(randomLetter)) {
          options.push(randomLetter);
        }
      }
      // Shuffle options.
      options = shuffleArray(options);
      // Create gap word with a blank.
      const gapWord = word.substring(0, index) + "_" + word.substring(index + 1);
      gameState.currentAnswer = correctLetter;
      return `Complete the word: <strong>${gapWord}</strong> (${options.join(", ")})`;
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
      return `Is the letter <strong>${letter}</strong> a VOWEL or a CONSONANT?`;
    }
  },
  { 
    name: "Dictation (Fill the Gap)", 
    sublevels: 36, 
    generateQuestion: () => {
      // Simulate a dictation with a missing word.
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
      // Ask about the use of articles.
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
      // Fill in a sentence in simple present tense.
      const sentences = [
        { sentence: "She ____ (to go) to school.", answer: "GOES" },
        { sentence: "He ____ (to eat) breakfast.", answer: "EATS" }
      ];
      const item = sentences[Math.floor(Math.random() * sentences.length)];
      gameState.currentAnswer = item.answer;
      return `Complete the sentence in present tense: <strong>${item.sentence}</strong>`;
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
      // Provide base, past, and past participle forms.
      const verbs = [
        { base: "GO", past: "WENT", participle: "GONE" },
        { base: "EAT", past: "ATE", participle: "EATEN" }
      ];
      const verb = verbs[Math.floor(Math.random() * verbs.length)];
      gameState.currentAnswer = `${verb.base} ${verb.past} ${verb.participle}`;
      return `Provide the base form, simple past, and past participle of: <strong>${verb.base}</strong><br>(Separate by spaces, in uppercase)`;
    }
  },
  { 
    name: "Comparatives & Superlatives", 
    sublevels: 36, 
    generateQuestion: () => {
      // Provide positive, comparative, and superlative forms.
      const adjectives = [
        { positive: "FAST", comparative: "FASTER", superlative: "FASTEST" },
        { positive: "SMART", comparative: "SMARTER", superlative: "SMARTEST" }
      ];
      const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
      gameState.currentAnswer = `${adj.positive} ${adj.comparative} ${adj.superlative}`;
      return `Provide the positive, comparative, and superlative forms for <strong>${adj.positive}</strong><br>(Separate by spaces, in uppercase)`;
    }
  },
  { 
    name: "Sentence Formation", 
    sublevels: 28, 
    generateQuestion: () => {
      // Provide a set of words for sentence formation.
      const words = ["I", "LOVE", "LEARNING", "ENGLISH"];
      gameState.currentAnswer = ""; // Open answer; any non-empty answer accepted.
      return `Form a complete sentence using these words (order not fixed): <strong>${words.join(" ")}</strong>`;
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

// ----- Dictionary API Example -----
// (This function remains available for extension purposes.)
async function lookupWord(word) {
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
    const data = await res.json();
    return data[0]?.meanings[0]?.definitions[0]?.definition || "Definition not found.";
  } catch (error) {
    return "Definition not found.";
  }
}

// ----- Modal Helpers -----
function showModal(contentHTML, callback) {
  const popup = document.getElementById("popup-modal");
  const popupContent = document.getElementById("popup-content");
  popupContent.innerHTML = contentHTML;
  popup.style.display = "block";
  popup.onclick = function (e) {
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

// ----- Score Management -----
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

// ----- Game Flow Functions -----

// Load Beginner Level Menu: display 500 sublevels in a grid.
function loadBeginnerMenu() {
  gameState.currentLevel = "beginner";
  const container = document.getElementById("game-container");
  let html = `<h2>Beginner Level</h2>`;
  html += `<p>Select a sublevel:</p>`;
  html += `<div id="sublevel-grid" class="row">`;
  for (let i = 1; i <= gameState.totalSublevels; i++) {
    html += `<div class="col-6 col-sm-4 col-md-2 mb-2">
               <button class="btn btn-outline-primary sublevel-btn" data-sublevel="${i}">SL ${i}</button>
             </div>`;
  }
  html += `</div>`;
  container.innerHTML = html;

  // Add event listeners for sublevel buttons.
  document.querySelectorAll(".sublevel-btn").forEach(btn => {
    btn.addEventListener("click", function () {
      const sublevel = parseInt(this.getAttribute("data-sublevel"));
      startSublevel(sublevel);
    });
  });
}

// Start a given sublevel.
function startSublevel(sublevelNumber) {
  gameState.currentSublevel = sublevelNumber;
  gameState.trialCount = 0;
  const topic = getCurrentTopic(sublevelNumber);
  if (!topic) return;
  const questionHTML = topic.generateQuestion();
  displayQuestion(topic.name, questionHTML);
}

// Display question and answer input.
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

// Check answer; enforce uppercase when required.
function checkAnswer() {
  const userAnswer = document.getElementById("user-answer").value.trim();
  const expected = gameState.currentAnswer || "";
  const feedbackEl = document.getElementById("feedback");

  // For open-answer questions (e.g., Sentence Formation), accept any non-empty answer.
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
  
  // For letter combination, allow multiple correct answers.
  // The expected answer for letter combination is stored as "BOOK/KOBO" etc.
  if (expected.includes("/")) {
    const validAnswers = expected.split("/");
    if (validAnswers.includes(userAnswer)) {
      feedbackEl.innerHTML = `<span class="correct-icon">&#10004;</span> Correct!`;
      updateScore(1);
      setTimeout(nextSublevel, 1500);
      return;
    } else {
      feedbackEl.innerHTML = `<span class="incorrect-icon">&#10008;</span> Incorrect.`;
      gameState.trialCount++;
    }
  }
  // Enforce uppercase if expected answer is all uppercase.
  else if (expected === expected.toUpperCase() && userAnswer !== userAnswer.toUpperCase()) {
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
  
  if (gameState.trialCount >= 3) {
    gameOver();
  }
}

// Automatically move to next sublevel.
function nextSublevel() {
  if (gameState.currentSublevel < gameState.totalSublevels) {
    startSublevel(gameState.currentSublevel + 1);
  } else {
    saveScore();
    showModal(`<h3>Congratulations, ${gameState.playerName}!</h3>
               <p>You have completed the Beginner Class with a score of ${gameState.score}.</p>
               <button id="restart-beginner" class="btn btn-primary mr-2">Restart Beginner</button>
               <button id="go-intermediate" class="btn btn-success">Move to Intermediate</button>`);
    document.getElementById("popup-content").addEventListener("click", function(e) {
      if (e.target && e.target.id === "restart-beginner") {
        resetGame();
      } else if (e.target && e.target.id === "go-intermediate") {
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
  // Reset game state and restart beginner level.
  gameState.currentLevel = "beginner";
  gameState.currentSublevel = 1;
  gameState.score = 0;
  gameState.trialCount = 0;
  document.getElementById("current-score").textContent = gameState.score;
  loadBeginnerMenu();
}

// ----- Event Listeners -----
// Level selection buttons.
document.querySelectorAll("nav button").forEach(btn => {
  btn.addEventListener("click", function () {
    const level = this.getAttribute("data-level");
    if (level === "beginner") {
      loadBeginnerMenu();
    } else {
      document.getElementById("game-container").innerHTML = `<p>${level} level is under construction.</p>`;
    }
  });
});

// When the user clicks "Start Game" in the intro modal.
document.getElementById("start-game").addEventListener("click", function () {
  const nameInput = document.getElementById("player-name").value.trim();
  if (nameInput === "") {
    alert("Please enter your name to continue.");
    return;
  }
  gameState.playerName = nameInput;
  document.getElementById("current-player").textContent = gameState.playerName;
  hideIntroModal();
  // Automatically start beginner level at sublevel 1.
  loadBeginnerMenu();
});

// Show intro modal on load.
window.onload = function () {
  showIntroModal();
};
