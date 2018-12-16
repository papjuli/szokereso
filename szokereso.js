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
    asJson() {
        return JSON.stringify(this);
    }
    static fromJson(boardJson) {
        let boardObj = JSON.parse(boardJson);
        let board = new Board(boardObj.size, boardObj.timeSeconds);
        for (var prop in boardObj)
            board[prop] = boardObj[prop];
        return board;
    }
    setWords(words) {
        this.words = new Array();
        for (let word of words) {
            this.words.push(word);
        }
        this.words.sort();
        this.setScoreFromWords();
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
}
class BoardGenerator {
    constructor(vocabulary) {
        var _a;
        this.Cell = (_a = class Cell {
                constructor(row, col, prevLo, prevHi, prefix, vocab) {
                    this.row = row;
                    this.col = col;
                    this.nextPos = 0;
                    this.prefix = prefix;
                    this.vocab = vocab;
                    if (prevLo >= prevHi || vocab[prevHi - 1] < prefix) {
                        this.hi = this.lo = prevLo;
                        return;
                    }
                    let ll = prevLo;
                    let lh = prevHi;
                    let m;
                    while (ll < lh) {
                        let m = Math.floor((lh + ll) / 2);
                        if (vocab[m] < prefix) {
                            ll = m + 1;
                        }
                        else if (vocab[m] == prefix) {
                            ll = lh = m;
                        }
                        else {
                            lh = m;
                        }
                    }
                    this.lo = ll;
                    if (!vocab[this.lo].startsWith(prefix)) {
                        this.hi = this.lo;
                    }
                    else {
                        let hl = this.lo;
                        let hh = prevHi;
                        while (hl < hh - 1) {
                            m = Math.floor((hl + hh) / 2);
                            if (vocab[m].startsWith(prefix)) {
                                hl = m;
                            }
                            else {
                                hh = m;
                            }
                        }
                        this.hi = hl + 1;
                    }
                }
                getNextNeighbor(board) {
                    let nextRow;
                    let nextCol;
                    while (true) {
                        if (this.nextPos == 8)
                            return null;
                        nextRow = this.row + Cell.nextRowOffset[this.nextPos];
                        if (nextRow < 0 || nextRow >= board.size) {
                            this.nextPos++;
                            continue;
                        }
                        nextCol = this.col + Cell.nextColOffset[this.nextPos];
                        if (nextCol < 0 || nextCol >= board.size) {
                            this.nextPos++;
                            continue;
                        }
                        break;
                    }
                    this.nextPos++;
                    return new Cell(nextRow, nextCol, this.lo, this.hi, this.prefix + board.letters[nextRow][nextCol], this.vocab);
                }
            },
            _a.nextRowOffset = [-1, -1, 0, 1, 1, 1, 0, -1],
            _a.nextColOffset = [0, 1, 1, 1, 0, -1, -1, -1],
            _a);
        vocabulary.sort();
        this.vocab = vocabulary;
        this.getLetterFreqs();
    }
    generateBoard(size, timeSeconds, scoreThreshold) {
        while (true) {
            let board = new Board(size, timeSeconds);
            for (let row = 0; row < size; row++) {
                for (let col = 0; col < size; col++) {
                    board.letters[row][col] = this.getRandomLetter();
                }
            }
            let covered = this.solveBoard(board);
            if (covered && board.totalScore >= scoreThreshold)
                return board;
        }
    }
    getRandomLetter() {
        let d = Math.random();
        let sum = 0;
        for (let i = 0; i < this.alphabet.length; i++) {
            sum += this.letterFreqs[i];
            if (sum > d) {
                return this.alphabet[i];
            }
        }
        return this.alphabet[this.alphabet.length - 1];
    }
    solveBoard(board) {
        let words = new Set();
        let covered = new Array(board.size);
        for (let i = 0; i < board.size; i++) {
            covered[i] = new Array(board.size);
            covered[i].fill(false);
        }
        for (let startRow = 0; startRow < board.size; startRow++) {
            for (let startCol = 0; startCol < board.size; startCol++) {
                let taken = new Array(board.size);
                for (let i = 0; i < board.size; i++) {
                    taken[i] = new Array(board.size);
                    taken[i].fill(false);
                }
                taken[startRow][startCol] = true;
                let stack = new Array();
                stack.push(new this.Cell(startRow, startCol, 0, this.vocab.length, board.letters[startRow][startCol], this.vocab));
                while (stack.length > 0) {
                    let current = stack[stack.length - 1];
                    let next = current.getNextNeighbor(board);
                    if (next == null) {
                        taken[current.row][current.col] = false;
                        stack.pop();
                        continue;
                    }
                    if (taken[next.row][next.col] || next.lo >= next.hi) {
                        continue;
                    }
                    if (this.vocab[next.lo].length == next.prefix.length) {
                        words.add(next.prefix);
                        for (let cell of stack) {
                            covered[cell.row][cell.col] = true;
                        }
                        covered[next.row][next.col] = true;
                    }
                    taken[next.row][next.col] = true;
                    stack.push(next);
                }
            }
        }
        board.setWords(words);
        let allCovered = true;
        for (let row of covered) {
            for (let element of row) {
                if (!element) {
                    allCovered = false;
                    break;
                }
            }
        }
        return allCovered;
    }
    getLetterFreqs() {
        let letterCounts = new Map();
        let count = 0;
        for (let word of this.vocab) {
            for (let i = 0; i < word.length; i++) {
                count++;
                let letter = word[i];
                if (!letterCounts.has(letter)) {
                    letterCounts.set(letter, 1);
                }
                else {
                    letterCounts.set(letter, letterCounts.get(letter) + 1);
                }
            }
        }
        this.alphabet = new Array(letterCounts.size);
        this.letterFreqs = new Array(letterCounts.size);
        let i = 0;
        for (let letter of letterCounts.keys()) {
            this.alphabet[i] = letter;
            this.letterFreqs[i] = letterCounts.get(letter) / count;
            i++;
        }
    }
}
//# sourceMappingURL=szokereso.js.map