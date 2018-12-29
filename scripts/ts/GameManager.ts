class GameManager {
    private game: Game;
    private foundWords: string[];
    private remainingWords: number[];
    private score: number;
    private timeRemaining: number;
    private timer;

    constructor(private board: Board, private app: App) {
        this.game = new Game(board, this);
        this.score = 0;
        this.timeRemaining = board.timeSeconds;
        this.foundWords = new Array();
        this.remainingWords = [0, 0, 0, 0, 0, 0, 0];
        for (let word of board.words) {
            let len = word.length;
            if (len < 2) continue;
            if (len > 8) len = 8;
            this.remainingWords[len - 2] += 1;
        }
        
        this.setScore(this.score);
        this.setCurrentGuess("");
        this.setTimeRemaining(this.timeRemaining);
        this.setWordRemaining(this.remainingWords);

        this.timer = setInterval(() => this.tick(this), 1000);
    }

    private tick(self: GameManager): void {
        self.timeRemaining -= 1;
        self.setTimeRemaining(self.timeRemaining);
        if (self.timeRemaining <= 0) {
            self.endGame(self);
        }
    }

    public partialWord(word: string): void {
        this.setCurrentGuess(word);
    }

    public finalWord(word: string): void {
        this.setCurrentGuess("");
        let kind = "Incorrect";
        if (this.board.words.indexOf(word) >= 0) {
            if (this.foundWords.indexOf(word) == -1) {
                kind = "Correct";
                this.score += Board.getWordScore(word);
                let len = word.length;
                if (len > 8) len = 8;
                if (len >= 2) {
                    this.remainingWords[len - 2] -= 1;
                }
                this.setScore(this.score);
                this.setWordRemaining(this.remainingWords);
                this.addFoundWord(word);
            } else {
                kind = "Duplicate";
            }
        }
        this.setGuessedWord(word, kind);
    }

    public endGame(self): void {
        self.game.disable();
        clearInterval(self.timer);
        self.displayAllWords(self.board.words);
        self.displayTotalScore(self.board.totalScore);
        self.app.gameOver();
    }

    public setTimeRemaining(seconds: number): void {
        document.getElementById("timeLeft").innerHTML = 
            String(Math.floor(seconds / 60) + ":" + ("00" + seconds % 60).slice(-2));
    }

    public setCurrentGuess(word: string): void {
        document.getElementById("currentWord").innerHTML = word;
        document.getElementById("guessedWord").className = "guessedWordHidden";
    }

    public setGuessedWord(word: string, kind: string): void {
        document.getElementById("guessedWord").innerHTML = word;
        document.getElementById("guessedWord").className = "guessedWord" + kind;    
    }

    public setScore(score: number): void {
        document.getElementById("score").innerHTML = String(score);
    }

    public setWordRemaining(wordCounts: number[]): void {
        for (let i = 2; i < 9; ++i) {
            document.getElementById("remaining-" + i + (i == 8 ? "+" : "")).innerHTML = 
                String(wordCounts[i - 2]);
        }
    }

    public addFoundWord(word: string): void {
        this.foundWords.push(word);
        this.foundWords.sort();
        document.getElementById("found").innerHTML = this.foundWords.join(" ");
    }

    public displayAllWords(words: string[]): void {
        document.getElementById("allWords").innerHTML = 
            words.join(", ");
    }

    public displayTotalScore(totalScore: number): void {
        document.getElementById("totalScore").innerHTML = String(totalScore);
    }
}
