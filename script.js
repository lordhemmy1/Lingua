class GameEngine {
    constructor() {
        this.API_ENDPOINT = 'https://wordsapiv1.p.rapidapi.com/words/';
        this.API_HEADERS = {
            'X-RapidAPI-Key': 'YOUR_API_KEY',
            'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
        };
        
        this.state = {
            playerName: '',
            score: 0,
            currentLevel: 'beginner',
            currentSublevel: 1,
            totalSublevels: 500,
            progress: []
        };
    }

    async init() {
        await this.loadGameData();
        this.setupEventListeners();
    }

    async loadGameData() {
        const response = await fetch('game-data.json');
        this.gameData = await response.json();
    }

    setupEventListeners() {
        document.getElementById('start-game').addEventListener('click', () => this.startGame());
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModal();
            }
        });
    }

    startGame() {
        const name = document.getElementById('player-name').value.trim();
        if (!name) return alert('Please enter your name');
        
        this.state.playerName = name;
        this.updatePlayerInfo();
        this.showSublevel(1);
        this.hideModal();
    }

    async showSublevel(number) {
        if (number > this.state.totalSublevels) return this.showCompletionModal();
        
        const sublevel = this.gameData[number - 1];
        this.state.currentSublevel = number;
        
        this.renderQuestion(sublevel);
        this.updateProgress();
    }

    renderQuestion(sublevel) {
        const questionHTML = this.generateQuestionHTML(sublevel);
        const answerHTML = this.generateAnswerHTML(sublevel);
        
        document.getElementById('question-container').innerHTML = questionHTML;
        document.getElementById('answer-container').innerHTML = answerHTML;
        
        document.getElementById('submit-answer').addEventListener('click', () => this.checkAnswer(sublevel));
    }

    generateQuestionHTML(sublevel) {
        return `
            <div class="question-card">
                <h2>${sublevel.topic}</h2>
                <p>${sublevel.question}</p>
                ${sublevel.data ? `<div class="question-data">${sublevel.data}</div>` : ''}
            </div>
        `;
    }

    generateAnswerHTML(sublevel) {
        return `
            <input type="text" id="user-answer" placeholder="${sublevel.placeholder || 'Enter your answer'}">
            <button id="submit-answer" class="primary-btn">Submit Answer</button>
        `;
    }

    async checkAnswer(sublevel) {
        const userAnswer = document.getElementById('user-answer').value.trim();
        const correctAnswer = sublevel.answer;
        let isCorrect = false;

        // Case-sensitive validation
        if (sublevel.caseSensitive) {
            isCorrect = userAnswer === correctAnswer;
        } else {
            isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();
        }

        // API validation for word-based questions
        if (sublevel.apiValidation && isCorrect) {
            isCorrect = await this.validateWordViaAPI(userAnswer);
        }

        this.handleAnswerFeedback(isCorrect, sublevel);
    }

    async validateWordViaAPI(word) {
        try {
            const response = await fetch(`${this.API_ENDPOINT}${word}`, {
                headers: this.API_HEADERS
            });
            return response.ok;
        } catch (error) {
            console.error('API Validation Error:', error);
            return false;
        }
    }

    handleAnswerFeedback(isCorrect, sublevel) {
        const feedback = document.getElementById('feedback-container');
        feedback.style.display = 'block';
        feedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        
        if (isCorrect) {
            feedback.innerHTML = `
                <span class="correct-icon">✓</span> 
                <p>Correct! Moving to next level...</p>
            `;
            this.state.score += 10;
            setTimeout(() => this.showSublevel(this.state.currentSublevel + 1), 1500);
        } else {
            feedback.innerHTML = `
                <span class="incorrect-icon">✗</span> 
                <p>Incorrect. Try again!</p>
                ${sublevel.hint ? `<p class="hint">Hint: ${sublevel.hint}</p>` : ''}
            `;
        }
        
        this.updatePlayerInfo();
    }

    showCompletionModal() {
        this.showModal(`
            <h2>Congratulations!</h2>
            <p>You've completed all 500 beginner levels!</p>
            <p>Final Score: ${this.state.score}</p>
            <button class="primary-btn" onclick="game.restartGame()">Restart Beginner</button>
            <button class="primary-btn" onclick="game.startIntermediate()">Intermediate Level</button>
        `);
    }

    updatePlayerInfo() {
        document.getElementById('current-player').textContent = this.state.playerName;
        document.getElementById('current-score').textContent = this.state.score;
        document.getElementById('current-level').textContent = 
            `Beginner ${this.state.currentSublevel}/${this.state.totalSublevels}`;
            
        const progressPercent = (this.state.currentSublevel / this.state.totalSublevels) * 100;
        document.querySelector('.progress-bar').style.width = `${progressPercent}%`;
    }

    showModal(content) {
        document.getElementById('game-modal-content').innerHTML = content;
        document.getElementById('game-modal').classList.add('active');
    }

    hideModal() {
        document.getElementById('game-modal').classList.remove('active');
    }

    restartGame() {
        this.state.currentSublevel = 1;
        this.state.score = 0;
        this.hideModal();
        this.showSublevel(1);
    }

    startIntermediate() {
        // Placeholder for intermediate level implementation
        this.showModal('<p>Intermediate level coming soon!</p>');
    }
}

// Initialize game
const game = new GameEngine();
game.init();
