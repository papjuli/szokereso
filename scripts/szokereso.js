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
            this.totalScore += Board.getWordScore(word);
        }
    }
    static getWordScore(word) {
        let length = word.length;
        if (length == 2) {
            return 1;
        }
        else {
            return Math.floor((length * length - 5 * length + 10) / 2);
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
class Game {
    constructor(board, manager) {
        this.board = board;
        this.manager = manager;
        this.playable = true;
        this.selectedLetters = new Array();
        let boardDiv = this.boardDiv();
        boardDiv.innerHTML = "";
        boardDiv.style.setProperty("--boardSize", String(board.size));
        for (let i = 0; i < board.size; ++i) {
            for (let j = 0; j < board.size; ++j) {
                let letter = document.createElement("div");
                letter.innerHTML = board.letters[i][j];
                letter.dataset.row = String(i);
                letter.dataset.col = String(j);
                letter.dataset.letter = "yes, this is a letter";
                letter.className = "letter";
                letter.addEventListener("touchstart", this.touchStart);
                letter.addEventListener("touchmove", this.touchMove);
                letter.addEventListener("touchend", this.touchEnd);
                boardDiv.appendChild(letter);
            }
        }
    }
    disable() {
        this.playable = false;
        this.unmarkAll();
    }
    boardDiv() {
        let boardDiv = document.getElementById("board");
        if (boardDiv instanceof HTMLDivElement)
            return boardDiv;
        return null;
    }
    target(event) {
        if (!this.playable) {
            return null;
        }
        let touch = event.touches[0];
        let elem = document.elementFromPoint(touch.clientX, touch.clientY);
        if (!(elem instanceof HTMLDivElement)) {
            return null;
        }
        if (elem.dataset.letter != "yes, this is a letter") {
            return null;
        }
        return [elem, [Number(elem.dataset.row), Number(elem.dataset.col)]];
    }
    addLetter(target) {
        this.selectedLetters.push(target[1]);
        target[0].classList.add("marked");
        this.word += this.board.letters[target[1][0]][target[1][1]];
        this.manager.partialWord(this.word);
    }
    unmarkAll() {
        for (let child of this.boardDiv().children) {
            child.classList.remove("marked");
        }
    }
    touchStart(event) {
        this.selectedLetters.length = 0;
        let target = this.target(event);
        if (target == null)
            return;
        this.addLetter(target);
    }
    touchMove(event) {
        let target = this.target(event);
        if (target == null)
            return;
        // If this drag has not started on a letter, ignore.
        if (this.selectedLetters.length == 0)
            return;
        let dx = target[1][0] - this.selectedLetters[-1][0];
        let dy = target[1][1] - this.selectedLetters[-1][1];
        let d = dx * dx + dy * dy;
        // If the user still touches the last letter, do nothing.
        if (d == 0)
            return;
        // If the user touches far from the last letter, do nothing.
        if (d > 2)
            return;
        this.addLetter(target);
    }
    touchEnd(event) {
        this.manager.finalWord(this.word);
        this.word = "";
        this.selectedLetters.length = 0;
        this.unmarkAll();
    }
}
class GameManager {
    constructor(board) {
        this.board = board;
        this.game = new Game(board, this);
        this.score = 0;
        this.timeRemaining = board.timeSeconds;
        this.remainingWords = [0, 0, 0, 0, 0, 0, 0];
        for (let word of board.words) {
            let len = word.length;
            if (len < 2)
                continue;
            if (len > 8)
                len = 8;
            this.remainingWords[len - 2] += 1;
        }
        // TODO: update UI
        setInterval(this.tick, 1000);
    }
    tick() {
        // TODO: update UI
        this.timeRemaining -= 1;
        if (this.timeRemaining <= 0) {
            this.game.disable();
        }
    }
    partialWord(word) {
        // TODO: update UI
    }
    finalWord(word) {
        // TODO: update UI
        if (this.board.words.indexOf(word) >= 0) {
            this.score += Board.getWordScore(word);
            let len = word.length;
            if (len > 8)
                len = 8;
            if (len >= 2) {
                this.remainingWords[len - 2] -= 1;
            }
        }
    }
}
class UserState {
    constructor(name, email) {
        this.name = name;
        this.email = email;
        this.score = 0;
        this.foundWords = Array();
        this.startedGame = false;
    }
    asJson() {
        return JSON.stringify(this);
    }
    static fromJson(userJson) {
        let userObj = JSON.parse(userJson);
        let userState = new UserState(userObj.name, userObj.email);
        for (var prop in userObj)
            userState[prop] = userObj[prop];
        return userState;
    }
    addFoundWord(word) {
        this.foundWords.push(word);
        this.score += Board.getWordScore(word);
    }
}
//# sourceMappingURL=szokereso.js.map