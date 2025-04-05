// LINGUA Game Script let beginnerQuestions = [ { topic: "Alphabets", question: "What is the first letter of the English alphabet (uppercase)?", answer: "A" }, { topic: "Word Formation", question: "Fill the gap: C _ T", answer: "A" }, { topic: "Vowels/Consonants", question: "Is 'E' a vowel or consonant?", answer: "vowel" }, { topic: "Parts of Speech", question: "Identify the part of speech: 'quickly'", answer: "adverb" }, { topic: "Articles", question: "Which article would you use: ___ apple?", answer: "an" }, { topic: "Plural Rules", question: "Give the plural of 'baby'", answer: "babies" }, { topic: "Present Tense", question: "What is the present tense of 'went'?", answer: "go" }, { topic: "Past Tense", question: "What is the simple past of 'eat'?", answer: "ate" }, { topic: "Comparatives", question: "Give the comparative form of 'big'", answer: "bigger" }, { topic: "Sentence Formation", question: "Form a sentence using the word 'dog'", answer: "open" } ];

let dictionary = {}; // Loaded from dictionary.json let currentQuestion = 0; let score = 0; let wrongAttempts = 0; let userName = "";

const welcomeBox = document.getElementById("welcomeBox"); const gameArea = document.getElementById("gameArea"); const playerName = document.getElementById("playerName"); const questionBox = document.getElementById("questionBox"); const answerInput = document.getElementById("answerInput"); const submitBtn = document.getElementById("submitAnswer"); const feedback = document.getElementById("feedback"); const scoreBoard = document.getElementById("score");

document.getElementById("startGame").addEventListener("click", () => { const nameInput = document.getElementById("userName").value.trim(); if (nameInput !== "") { userName = nameInput; playerName.textContent = userName; welcomeBox.classList.add("d-none"); gameArea.classList.remove("d-none"); loadQuestion(); } });

submitBtn.addEventListener("click", checkAnswer); answerInput.addEventListener("keyup", (e) => { if (e.key === "Enter") checkAnswer(); });

function loadQuestion() { feedback.textContent = ""; if (currentQuestion < beginnerQuestions.length) { questionBox.textContent = beginnerQuestions[currentQuestion].question; answerInput.value = ""; answerInput.focus(); } else { showCompletionModal(); } }

function checkAnswer() { const userAnswer = answerInput.value.trim(); const correctAnswer = beginnerQuestions[currentQuestion].answer;

if (correctAnswer === "open") { score += 10; updateScore(); currentQuestion++; wrongAttempts = 0; loadQuestion(); return; }

if (userAnswer === "") return;

if (userAnswer === correctAnswer || userAnswer.toLowerCase() === correctAnswer.toLowerCase()) { if (correctAnswer.match(/[A-Z]/) && userAnswer !== correctAnswer) { feedback.innerHTML = "<span class='text-danger'>Use correct uppercase letter.</span>"; return; } score += 10; updateScore(); currentQuestion++; wrongAttempts = 0; loadQuestion(); } else { wrongAttempts++; if (wrongAttempts < 3) { if (dictionary[userAnswer.toLowerCase()]) { feedback.innerHTML = <span class='text-danger'>Incorrect. Did you mean: <strong>${dictionary[userAnswer.toLowerCase()].word}</strong>? (${3 - wrongAttempts} attempts left)</span>; } else { feedback.innerHTML = <span class='text-danger'>Incorrect. Try again (${3 - wrongAttempts} attempts left).</span>; } } else { feedback.innerHTML = <span class='text-danger'>Correct answer: <strong>${correctAnswer}</strong></span>; setTimeout(showGameOver, 2000); } } }

function updateScore() { scoreBoard.textContent = score; }

function showGameOver() { const gameOverModal = new bootstrap.Modal(document.getElementById("gameOverModal")); gameOverModal.show(); }

function showCompletionModal() { const completionModal = new bootstrap.Modal(document.getElementById("completionModal")); completionModal.show(); }

document.getElementById("restartGame").addEventListener("click", () => location.reload()); document.getElementById("repeatBeginner").addEventListener("click", () => location.reload()); document.getElementById("nextLevel").addEventListener("click", () => { alert("Intermediate level coming soon..."); location.reload(); });

fetch("dictionary.json") .then(res => res.json()) .then(data => { dictionary = data.reduce((acc, word) => { acc[word.word.toLowerCase()] = word; return acc; }, {}); });

