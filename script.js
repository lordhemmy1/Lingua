class LinguaGame {
    constructor() {
        this.gameData = null;
        this.config = {
            totalSublevels: 500,
            apiKey: 'YOUR_WORDS_API_KEY',
            levels: ['beginner', 'intermediate', 'conversational', 'native']
        };
        
        this.state = {
            currentLevel: 'beginner',
            currentSublevel: 1,
            score: 0,
            playerName: '',
            progress: {}
        };
    }

    async init() {
        await this.loadGameData();
        this.setupEventListeners();
        this.loadPlayerProgress();
    }

    async loadGameData() {
        const response = await fetch('game-data.json');
        this.gameData = await response.json();
    }

    setupEventListeners() {
        document.getElementById('start-game').addEventListener('click', () => this.startGame());
        document.getElementById('submit-answer').addEventListener('click', () => this.checkAnswer());
    }

    startGame() {
        const name = document.getElementById('player-name').value.trim();
        if (!name) return this.showError('Please enter your name');
        
        this.state.playerName = name;
        this.updatePlayerDisplay();
        this.hideModal();
        this.loadSublevel(1);
    }

    loadSublevel(sublevelNumber) {
        if (sublevelNumber > this.config.totalSublevels) {
            return this.showCompletionScreen();
        }
        
        const sublevelData = this.gameData.beginnerLevels.find(
            level => level.sublevel === sublevelNumber
        );
        
        this.displayQuestion(sublevelData);
        this.updateProgressDisplay(sublevelNumber);
    }

    displayQuestion(data) {
        const questionCard = document.getElementById('question-card');
        let questionText = data.question;
        
        switch(data.type) {
            case 'alphabet-recognition':
                const letter = this.getRandomElement(data.data);
                questionText = questionText.replace('{letter}', letter);
                this.currentAnswer = letter;
                break;
                
            case 'word-formation':
                const letters = this.shuffleWord(this.getRandomElement(data.data));
                questionText = questionText.replace('{letters}', letters.split('').join(', '));
                this.currentAnswer = this.getRandomElement(data.data);
                break;
        }
        
        questionCard.innerHTML = `
            <h2>${data.topic}</h2>
            <p class="question-text">${questionText}</p>
            ${data.description ? `<p class="hint">${data.description}</p>` : ''}
        `;
    }

    async checkAnswer() {
        const userAnswer = document.getElementById('answer-input').value.trim();
        const validation = this.validateAnswer(userAnswer);
        
        if (validation.correct) {
            await this.handleCorrectAnswer();
        } else {
            this.handleIncorrectAnswer(validation.message);
        }
    }

    validateAnswer(answer) {
        const currentSublevel = this.gameData.beginnerLevels.find(
            l => l.sublevel === this.state.currentSublevel
        );
        
        // Case-sensitive validation
        if (currentSublevel.answerType === 'case-sensitive' && answer !== this.currentAnswer) {
            return { correct: false, message: 'Case sensitive answer required' };
        }
        
        // API-based validation for word existence
        if (currentSublevel.apiValidation) {
            return this.validateWithAPI(answer);
        }
        
        // Default validation
        return { correct: answer.toLowerCase() === this.currentAnswer.toLowerCase() };
    }

    async validateWithAPI(word) {
        try {
            const response = await fetch(`https://wordsapiv1.p.rapidapi.com/words/${word}`, {
                headers: {
                    'X-RapidAPI-Key': this.config.apiKey,
                    'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
                }
            });
            return { correct: response.ok };
        } catch (error) {
            console.error('API Validation Error:', error);
            return { correct: false };
        }
    }

    updateProgressDisplay(sublevel) {
        document.getElementById('current-sublevel').textContent = 
            `${sublevel}/${this.config.totalSublevels}`;
        
        const progressPercent = (sublevel / this.config.totalSublevels) * 100;
        document.querySelector('.progress-bar').style.width = `${progressPercent}%`;
    }

    showCompletionScreen() {
        this.showModal(`
            <h2>🎉 Congratulations! 🎉</h2>
            <p>You've completed all 500 beginner levels!</p>
            <div class="button-group">
                <button class="restart-btn">Restart Beginner</button>
                <button class="next-level-btn">Start Intermediate</button>
            </div>
        `);
    }
}

// Initialize Game
const game = new LinguaGame();
game.init();
