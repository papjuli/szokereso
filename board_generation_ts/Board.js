class Board {
    constructor(size, timeSeconds) {
        this.size = size;
        this.timeSeconds = timeSeconds;
        this.letters = Array(size);
        for (let i = 0; i < size; i++) {
            this.letters[i] = Array(size);
        }
        this.totalScore = 0;
    }
    setWords(words) {
        this.words = new Array();
        for (let word of words) {
            this.words.push(word);
        }
        this.words.sort();
        this.setScoreFromWords();
    }
    static getExampleBoard() {
        let board = new Board(2, 60);
        board.letters[0][0] = "É";
        board.letters[0][1] = "S";
        board.letters[1][0] = "K";
        board.letters[1][1] = "Ő";
        board.words = new Array();
        board.words.push("ÉS");
        board.words.push("ÉK");
        board.words.push("KÉS");
        board.words.push("KÉSŐ");
        board.words.push("KŐ");
        board.words.push("ŐK");
        board.words.push("ŐS");
        return board;
    }
    asJson() {
        return JSON.stringify(this);
    }
    setScoreFromWords() {
        this.totalScore = 0;
        for (let word of this.words) {
            let length = word.length;
            if (length == 2) {
                this.totalScore += 1;
            }
            else {
                this.totalScore += Math.floor((length * length - 5 * length + 10) / 2);
            }
        }
    }
}
//# sourceMappingURL=Board.js.map