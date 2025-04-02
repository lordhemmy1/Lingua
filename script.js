// Game Configuration
const CONFIG = {
    TOTAL_SUBLEVELS: 500,
    MAX_ATTEMPTS: 3,
    SCORE_STORAGE_KEY: "linguaHighScores",
    API_ENDPOINT: "https://wordsapiv1.p.rapidapi.com/words/",
    API_HEADERS: {
        'X-RapidAPI-Key': 'YOUR_API_KEY',
        'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
    }
};

// Game State
let gameState = {
    currentLevel: "beginner",
    currentSublevel: 1,
    score: 0,
    attemptsLeft: CONFIG.MAX_ATTEMPTS,
    playerName: "",
    highScores: [],
    currentQuestion: null,
    gameData: null
};

// DOM Elements
const dom = {
    introModal: document.getElementById("intro-modal"),
    gameOverModal: document.getElementById("game-over-modal"),
    playerName: document.getElementById("player-name"),
    currentScore: document.getElementById("current-score"),
    attemptsLeft: document.getElementById("attempts-left"),
    currentPlayer: document.getElementById("current-player"),
    progressBar: document.querySelector(".progress-bar"),
    questionCard: document.getElementById("question-card"),
    answerInput: document.getElementById("answer-input"),
    feedbackMessage: document.getElementById("feedback-message"),
    highScoresList: document.getElementById("high-scores")
};

// Initialization
async function initializeGame() {
    await loadGameData();
    loadHighScores();
    setupEventListeners();
    showModal(dom.introModal);
}

async function loadGameData() {
    try {
        const response = await fetch('game-data.json');
        gameState.gameData = await response.json();
    } catch (error) {
        console.error("Failed to load game data:", error);
    }
}

function setupEventListeners() {
    document.getElementById("start-game").addEventListener("click", startGame);
    document.getElementById("submit-answer").addEventListener("click", checkAnswer);
    document.querySelectorAll(".modal").forEach(modal => {
        modal.addEventListener("click", e => {
            if (e.target === modal) hideModal(modal);
        });
    });
}

// Game Flow
function startGame() {
    const name = dom.playerName.value.trim();
    if (!name) return alert("Please enter your name");
    
    gameState.playerName = name;
    gameState.score = 0;
    gameState.attemptsLeft = CONFIG.MAX_ATTEMPTS;
    gameState.currentSublevel = 1;
    
    dom.currentPlayer.textContent = name;
    hideModal(dom.introModal);
    loadSublevel(gameState.currentSublevel);
}

function loadSublevel(sublevel) {
    if (sublevel > CONFIG.TOTAL_SUBLEVELS) return showCompletionScreen();
    
    const levelData = gameState.gameData.beginnerLevels.find(
        l => l.sublevel === sublevel
    );
    
    gameState.currentQuestion = levelData;
    renderQuestion(levelData);
    updateUI();
}

function renderQuestion(data) {
    let questionText = data.question;
    
    switch(data.type) {
        case "alphabet-recognition":
            const letter = data.data[Math.floor(Math.random() * data.data.length)];
            questionText = questionText.replace("{letter}", letter);
            gameState.currentQuestion.answer = letter;
            break;
            
        case "word-formation":
            const word = data.data[Math.floor(Math.random() * data.data.length)];
            const shuffled = word.split("").sort(() => Math.random() - 0.5).join("");
            questionText = questionText.replace("{letters}", shuffled);
            gameState.currentQuestion.answer = word;
            break;
    }
    
    dom.questionCard.innerHTML = `
        <h2>${data.topic}</h2>
        <p class="question-text">${questionText}</p>
        ${data.description ? `<p class="hint">${data.description}</p>` : ""}
    `;
}

async function checkAnswer() {
    const userAnswer = dom.answerInput.value.trim();
    const isCorrect = await validateAnswer(userAnswer);
    
    dom.feedbackMessage.innerHTML = isCorrect ? 
        `<span class="correct-icon">✓</span> Correct!` :
        `<span class="incorrect-icon">✕</span> Incorrect`;
        
    dom.feedbackMessage.className = `feedback ${isCorrect ? "correct" : "incorrect"}`;
    dom.feedbackMessage.style.display = "block";
    
    if (isCorrect) {
        gameState.score += 10;
        gameState.currentSublevel++;
        dom.answerInput.value = "";
        setTimeout(() => loadSublevel(gameState.currentSublevel), 1500);
    } else {
        gameState.attemptsLeft--;
        if (gameState.attemptsLeft <= 0) showGameOver();
    }
    
    updateUI();
}

async function validateAnswer(answer) {
    const question = gameState.currentQuestion;
    
    // Case-sensitive validation
    if (question.answerType === "case-sensitive") {
        return answer === question.answer;
    }
    
    // API validation
    if (question.apiValidation) {
        try {
            const response = await fetch(`${CONFIG.API_ENDPOINT}${answer}`, {
                headers: CONFIG.API_HEADERS
            });
            return response.ok;
        } catch (error) {
            console.error("API validation failed:", error);
            return false;
        }
    }
    
    // Default case-insensitive validation
    return answer.toLowerCase() === question.answer.toLowerCase();
}

// UI Updates
function updateUI() {
    dom.currentScore.textContent = gameState.score;
    dom.attemptsLeft.textContent = gameState.attemptsLeft;
    
    const progress = (gameState.currentSublevel / CONFIG.TOTAL_SUBLEVELS) * 100;
    dom.progressBar.style.width = `${progress}%`;
}

function showCompletionScreen() {
    const isNewHighScore = gameState.score > Math.max(...gameState.highScores.map(s => s.score));
    
    showModal(dom.gameOverModal, `
        <h2>🎉 Level Complete! 🎉</h2>
        <p>Final Score: ${gameState.score}</p>
        ${isNewHighScore ? "<p class='high-score-notice'>New High Score! 🏆</p>" : ""}
        <div class="game-over-buttons">
            <button class="primary-btn" onclick="restartGame()">Play Again</button>
            <button class="primary-btn" onclick="showIntermediate()">Next Level</button>
        </div>
    `);
    
    saveHighScore();
}

function showGameOver() {
    showModal(dom.gameOverModal, `
        <h2>Game Over 😞</h2>
        <p>Final Score: ${gameState.score}</p>
        <div class="game-over-buttons">
            <button class="primary-btn" onclick="restartGame()">Try Again</button>
            <button class="primary-btn" onclick="showMainMenu()">Main Menu</button>
        </div>
    `);
    
    saveHighScore();
}

// High Scores
function loadHighScores() {
    const saved = localStorage.getItem(CONFIG.SCORE_STORAGE_KEY);
    gameState.highScores = saved ? JSON.parse(saved) : [];
    renderHighScores();
}

function saveHighScore() {
    gameState.highScores.push({
        name: gameState.playerName,
        score: gameState.score,
        date: new Date().toISOString()
    });
    
    gameState.highScores.sort((a, b) => b.score - a.score);
    localStorage.setItem(CONFIG.SCORE_STORAGE_KEY, JSON.stringify(gameState.highScores));
    renderHighScores();
}

function renderHighScores() {
    dom.highScoresList.innerHTML = gameState.highScores.slice(0, 5).map((score, i) => `
        <div class="high-score-item">
            <span>${i + 1}. ${score.name}</span>
            <span>${score.score}</span>
        </div>
    `).join("");
}

// Utility Functions
function showModal(modal, content) {
    if (content) modal.querySelector(".modal-content").innerHTML = content;
    modal.style.display = "flex";
}

function hideModal(modal) {
    modal.style.display = "none";
}

function restartGame() {
    gameState.currentSublevel = 1;
    gameState.score = 0;
    gameState.attemptsLeft = CONFIG.MAX_ATTEMPTS;
    hideModal(dom.gameOverModal);
    loadSublevel(1);
}

// Initialize the game
window.addEventListener("load", initializeGame);
