let questions = [
  { question: "What is the first letter of the English alphabet (uppercase)?", answer: "A" },
  { question: "Fill the gap: C _ T", answer: "A" },
  { question: "Is 'E' a vowel or consonant?", answer: "vowel" },
  { question: "Give the plural of 'baby'", answer: "babies" },
  { question: "What is the present tense of 'went'?", answer: "go" },
  { question: "Identify the part of speech: 'quickly'", answer: "adverb" },
  { question: "Which article would you use: ___ apple?", answer: "an" },
  { question: "What is the simple past of 'eat'?", answer: "ate" },
  { question: "Give the comparative form of 'big'", answer: "bigger" },
  { question: "Form a sentence using the word 'dog'", answer: "open" } // this one is open-ended
];

let dictionary = {}; // Will be loaded from JSON
let currentQuestion = 0;
let score = 0;
let wrongAttempts = 0;
let userName = "";

const welcomeBox = document.getElementById("welcomeBox");
const gameArea = document.getElementById("gameArea");
const playerName = document.getElementById("playerName");
const questionBox = document.getElementById("questionBox");
const answerInput = document.getElementById("answerInput");
const submitBtn = document.getElementById("submitAnswer");
const feedback = document.getElementById("feedback");
const scoreBoard = document.getElementById("score");

document.getElementById("startGame").addEventListener("click", () => {
  const nameInput = document.getElementById("userName").value.trim();
  if (nameInput !== "") {
    userName = nameInput;
    playerName.textContent = userName;
    welcomeBox.classList.add("d-none");
    gameArea.classList.remove("d-none");
    loadQuestion();
  }
});

submitBtn.addEventListener("click", checkAnswer);
answerInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") checkAnswer();
});

function loadQuestion() {
  feedback.textContent = "";
  if (currentQuestion < questions.length) {
    questionBox.textContent = questions[currentQuestion].question;
    answerInput.value = "";
    answerInput.focus();
  } else {
    showCompletionModal();
  }
}

function checkAnswer() {
  const userAnswer = answerInput.value.trim();
  const correctAnswer = questions[currentQuestion].answer;

  if (correctAnswer === "open") {
    // Skip validation for open-ended
    score += 10;
    updateScore();
    currentQuestion++;
    loadQuestion();
    return;
  }

  if (userAnswer === "") return;

  if (userAnswer === correctAnswer || userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
    if (correctAnswer.match(/[A-Z]/) && userAnswer !== correctAnswer) {
      feedback.innerHTML = "<span class='text-danger'>Use correct uppercase letter.</span>";
      return;
    }
    score += 10;
    updateScore();
    currentQuestion++;
    wrongAttempts = 0;
    loadQuestion();
  } else {
    // Wrong answer
    wrongAttempts++;
    if (dictionary[userAnswer.toLowerCase()]) {
      feedback.innerHTML = `<span class='text-danger'>Incorrect. Did you mean: <strong>${dictionary[userAnswer.toLowerCase()].word}</strong>?</span>`;
    } else {
      feedback.innerHTML = `<span class='text-danger'>Incorrect. Try again (${3 - wrongAttempts} attempts left).</span>`;
    }

    if (wrongAttempts >= 3) {
      showGameOver();
    }
  }
}

function updateScore() {
  scoreBoard.textContent = score;
}

function showGameOver() {
  const gameOverModal = new bootstrap.Modal(document.getElementById("gameOverModal"));
  gameOverModal.show();
}

function showCompletionModal() {
  const completionModal = new bootstrap.Modal(document.getElementById("completionModal"));
  completionModal.show();
}

// Restart game
document.getElementById("restartGame").addEventListener("click", () => location.reload());
document.getElementById("repeatBeginner").addEventListener("click", () => location.reload());
document.getElementById("nextLevel").addEventListener("click", () => {
  alert("Intermediate level coming soon...");
  location.reload();
});

// Load dictionary JSON
fetch("dictionary.json")
  .then(res => res.json())
  .then(data => {
    dictionary = data.reduce((acc, word) => {
      acc[word.word.toLowerCase()] = word;
      return acc;
    }, {});
  });
