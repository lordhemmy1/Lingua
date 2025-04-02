// Global Game State
const gameState = {
  currentLevel: null,
  currentSublevel: 0,
  totalSublevels: 20,
  currentQuestion: null,
  currentAnswer: null
};

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
      // Sample word list for demonstration
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
      // Sample nouns
      const nouns = ["cat", "dog", "apple", "book"];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      // Naively add "s" for plural; can be extended for irregulars
      gameState.currentAnswer = noun + "s";
      return `What is the plural form of: <strong>${noun}</strong>?`;
    }
  },
  {
    name: "Words and Opposites",
    description: "Provide the opposite of the given word.",
    generateQuestion: function () {
      // Sample words and their opposites
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
      // Sample words with parts of speech
      const parts = [
        { word: "run", pos: "verb" },
        { word: "happy", pos: "adjective" },
        { word: "quickly", pos: "adverb" },
        { word: "book", pos: "noun" }
      ];
      const item = parts[Math.floor(Math.random() * parts.length)];
      gameState.currentAnswer = item.pos;
      return `What part of speech is the word: <strong>${item.word}</strong>? <br> (Answer options: noun, verb, adjective, adverb)`;
    }
  },
  {
    name: "Sentence Formation",
    description: "Form a complete sentence using the given words.",
    generateQuestion: function () {
      // For demo, provide words and expect user to form a sentence (answer not auto-checkable)
      const words = ["I", "love", "learning", "English"];
      gameState.currentAnswer = ""; // Open answer; teacher check or auto-check later
      return `Use the following words to form a sentence (order is not fixed): <br><strong>${words.join(" ")}</strong>`;
    }
  },
  {
    name: "Present to Past Tense",
    description: "Convert the present tense sentence to past tense.",
    generateQuestion: function () {
      // A simple conversion example
      const sentences = [
        { present: "I walk to school.", past: "I walked to school." },
        { present: "She eats an apple.", past: "She ate an apple." }
      ];
      const sent = sentences[Math.floor(Math.random() * sentences.length)];
      gameState.currentAnswer = sent.past;
      return `Convert this sentence to past tense: <br><strong>${sent.present}</strong>`;
    }
  }
  // ... You can add more sublevel objects up to 20 covering all beginner topics.
];

// For demonstration, if we have less than 20, we cycle/repeat some topics.
while (beginnerSublevels.length < 20) {
  beginnerSublevels.push(...beginnerSublevels.slice(0, 20 - beginnerSublevels.length));
}

// Function to load a particular level
function loadLevel(level) {
  gameState.currentLevel = level;
  if (level === "beginner") {
    loadBeginnerMenu();
  } else {
    // Placeholder for other levels
    document.getElementById("game-container").innerHTML = `<p>${level} level is under construction.</p>`;
  }
}

// Function to display beginner sublevels menu
function loadBeginnerMenu() {
  gameState.currentSublevel = 0;
  const container = document.getElementById("game-container");
  let html = `<h2>Beginner Level</h2>`;
  html += `<p>Select a sublevel (1 to ${gameState.totalSublevels}):</p>`;
  html += `<div id="sublevels">`;
  for (let i = 1; i <= gameState.totalSublevels; i++) {
    html += `<button class="sublevel-btn" data-sublevel="${i}">Sublevel ${i}</button>`;
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

// Function to start a particular beginner sublevel
function startSublevel(sublevelNumber) {
  gameState.currentSublevel = sublevelNumber;
  // Use the corresponding sublevel generator (wrap-around if necessary)
  const index = (sublevelNumber - 1) % beginnerSublevels.length;
  const sublevelData = beginnerSublevels[index];
  const questionHTML = sublevelData.generateQuestion();
  displayQuestion(sublevelData.name, questionHTML);
}

// Function to display a question and answer input area
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

// Function to check the answer
function checkAnswer() {
  const userAnswer = document.getElementById("user-answer").value.trim().toLowerCase();
  const correctAnswer = (gameState.currentAnswer || "").toLowerCase();

  const feedbackEl = document.getElementById("feedback");

  // For open answer questions (like sentence formation), skip strict checking.
  if (correctAnswer === "") {
    feedbackEl.innerHTML = "Your answer has been recorded. (In a real app, this might be reviewed later.)";
  } else if (userAnswer === correctAnswer) {
    feedbackEl.innerHTML = "Correct!";
  } else {
    feedbackEl.innerHTML = `Incorrect. The correct answer is: ${gameState.currentAnswer}`;
  }
}

// Event listeners for level selection
document.querySelectorAll("nav button").forEach(btn => {
  btn.addEventListener("click", function () {
    loadLevel(this.getAttribute("data-level"));
  });
});
