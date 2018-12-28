class GameManager {
    private game: Game;
    private ui: GameUI;

    private remainingWords: number[];
    private score: number;
    private timeRemaining: number;
    private timer;

    constructor(private board: Board, private app: App) {
        this.game = new Game(board, this);
        this.ui = new GameUI();
        this.score = 0;
        this.timeRemaining = board.timeSeconds;
        this.remainingWords = [0, 0, 0, 0, 0, 0, 0];
        for (let word of board.words) {
            let len = word.length;
            if (len < 2) continue;
            if (len > 8) len = 8;
            this.remainingWords[len - 2] += 1;
        }
        
        this.ui.setScore(this.score);
        this.ui.setCurrentGuess("");
        this.ui.setTimeRemaining(this.timeRemaining);
        this.ui.setWordRemaining(this.remainingWords);

        this.timer = setInterval(() => this.tick(this), 1000);
    }

    private tick(self: GameManager): void {
        self.timeRemaining -= 1;
        self.ui.setTimeRemaining(self.timeRemaining);
        if (self.timeRemaining <= 0) {
            self.game.disable();
            clearInterval(self.timer);
            self.app.gameOver();
        }
    }

    public partialWord(word: string): void {
        this.ui.setCurrentGuess(word);
    }

    public finalWord(word: string): void {
        this.ui.setCurrentGuess("");
        // TODO: update UI
        if (this.board.words.indexOf(word) >= 0) {
            this.score += Board.getWordScore(word);
            let len = word.length;
            if (len > 8) len = 8;
            if (len >= 2) {
                this.remainingWords[len - 2] -= 1;
            }
            this.ui.setScore(this.score);
            this.ui.setWordRemaining(this.remainingWords);
            this.ui.addFoundWord(word);
        }
    }
}
