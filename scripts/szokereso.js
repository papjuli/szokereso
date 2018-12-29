var AppState;
(function (AppState) {
    // The start page shows when Szokereso is launching and we're still fetching
    // data from the sheet for the first time. On the start page the user can
    // click a button to 
    AppState[AppState["START_PAGE"] = 0] = "START_PAGE";
    // When the current row does not contain results from us, we can start playing.
    AppState[AppState["READY_TO_PLAY"] = 1] = "READY_TO_PLAY";
    // When we play, the current row still does not contain a result from us.
    // When we finish playing, either by clicking 'give up' or when the time
    // runs out, we store our result to the sheet and switch to finished playing.
    AppState[AppState["PLAYING"] = 2] = "PLAYING";
    // When we are done playing, we show everybody's results for the current row.
    // The user can click a reload button to fetch new results and remain in this state
    // or click a 'new' button to go to 'ready to play' and either join a new current
    // or create a new one. (Or something like this, this last part is not fully
    // clear to me).
    AppState[AppState["FINISHED_PLAYING"] = 3] = "FINISHED_PLAYING";
})(AppState || (AppState = {}));
class App {
    constructor(vocabulary) {
        // TODO: add event listeners here
        // TODO: use real vocabulary
        this.boardGenerator = new BoardGenerator(vocabulary);
        this.sheet = new Sheet(this);
        this.sheet.loadLastRow();
        this.showStartPage();
        document.getElementById("createGameButton").addEventListener("click", (event) => this.createGamePressed(this, event));
        document.getElementById("startGameButton").addEventListener("click", (event) => this.startGamePressed(this, event));
        document.getElementById("playLastGameButton").addEventListener("click", (event) => this.startGamePressed(this, event));
        document.getElementById("menuButton").addEventListener("click", (event) => this.backToMenuPressed(this, event));
        document.body.addEventListener("touchmove", (event) => this.bodyTouchMove(this, event), { passive: false });
        console.log("App created");
    }
    // The sheet will notify us when data loading is ready through this function.
    // This allows us to render the appropriate ui elements on the current page.
    // This is particularly important for the start page, where we don't yet have
    // any row loaded when the start page is displayed.
    notifyDataReady() {
        console.log("notifyDataReady");
        document.getElementById("lastGameIndex").innerHTML = String(this.sheet.getCurrentRowIndex());
        if (this.sheet.didIPlayOnCurrentBoard()) {
            this.showLastGameResults();
        }
        else {
            this.showJoinLastGameButton();
        }
    }
    // This should be the event listener of the create game button.
    createGamePressed(self, event) {
        console.log("App.createGamePressed");
        let board = self.boardGenerator.generateBoard(3, 300, 30);
        self.sheet.addNewBoard(board);
        self.showReadyToPlay();
    }
    showStartPage() {
        this.state = AppState.START_PAGE;
        // TODO change ui
        document.getElementById("menu").style.display = "block";
        document.getElementById("readyToPlay").style.display = "none";
        document.getElementById("results").style.display = "none";
        document.getElementById("game").style.display = "none";
    }
    showLastGameResults() {
        // TODO
        document.getElementById("playLastGameButton").style.display = "none";
        document.getElementById("lastGameResults").style.display = "block";
        document.getElementById("lastGameResults").innerHTML = String(this.sheet.getCurrentGamesPlayers());
    }
    showJoinLastGameButton() {
        // TODO
        console.log("showJoinLastGameButton");
        document.getElementById("playLastGameButton").style.display = "block";
        document.getElementById("lastGameResults").style.display = "none";
        document.getElementById("lastGameResults").innerHTML = "";
    }
    showReadyToPlay() {
        this.state = AppState.READY_TO_PLAY;
        document.getElementById("readyToPlay").style.display = "block";
        document.getElementById("menu").style.display = "none";
    }
    // This should be the event lsitener of the start game button on the ready to play page.
    startGamePressed(self, event) {
        console.log("App.startGamePressed");
        self.state = AppState.PLAYING;
        self.gameManager = new GameManager(self.sheet.currentBoard(), self);
        document.getElementById("board").className = ""; // kell?
        document.getElementById("readyToPlay").style.display = "none";
        document.getElementById("menu").style.display = "none";
        document.getElementById("results").style.display = "none";
        document.getElementById("game").style.display = "block";
    }
    // Called by the game manager, when the game ends (either by out of time or by clicking
    // the 'give up' button).
    gameOver() {
        this.state = AppState.FINISHED_PLAYING;
        // TODO change ui
        document.getElementById("board").className += " unplayable"; // kell?
        document.getElementById("gameplay").style.display = "none";
        document.getElementById("timer").style.display = "none";
        document.getElementById("results").style.display = "inline";
    }
    backToMenuPressed(self, event) {
        console.log("App.backPressed");
        self.state = AppState.START_PAGE;
        self.gameManager = null;
        document.getElementById("readyToPlay").style.display = "none";
        document.getElementById("menu").style.display = "block";
        document.getElementById("results").style.display = "none";
        document.getElementById("game").style.display = "none";
    }
    bodyTouchMove(self, event) {
        if (self.state == AppState.PLAYING) {
            event.preventDefault();
        }
    }
}
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
        var _a;
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
function myEmailAddress() {
    return getUserProfile().getEmail();
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
                letter.addEventListener("touchstart", (event) => this.touchStart(this, event));
                letter.addEventListener("touchmove", (event) => this.touchMove(this, event));
                letter.addEventListener("touchend", (event) => this.touchEnd(this, event));
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
    target(self, event) {
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
    removeLetter(target) {
        this.selectedLetters.pop();
        target[0].classList.remove("marked");
        this.word = this.word.substring(0, this.word.length - 1);
        this.manager.partialWord(this.word);
    }
    unmarkAll() {
        for (let child of this.boardDiv().children) {
            child.classList.remove("marked");
        }
    }
    touchStart(self, event) {
        self.selectedLetters.length = 0;
        let target = self.target(self, event);
        if (target == null)
            return;
        self.addLetter(target);
    }
    touchMove(self, event) {
        let target = self.target(self, event);
        if (target == null)
            return;
        // If this drag has not started on a letter, ignore.
        if (self.selectedLetters.length == 0)
            return;
        let nLetters = self.selectedLetters.length;
        // When moving back to the penultimate letter, remove the last letter.
        if (nLetters > 1) {
            if (target[1][0] == self.selectedLetters[nLetters - 2][0] &&
                target[1][1] == self.selectedLetters[nLetters - 2][1]) {
                self.removeLetter(target);
                return;
            }
        }
        // If the currently touched letter has already been selected, don't
        // select it again.
        for (let selectedLetter of self.selectedLetters) {
            if (target[1][0] == selectedLetter[0] && target[1][1] == selectedLetter[1]) {
                return;
            }
        }
        let dx = target[1][0] - self.selectedLetters[nLetters - 1][0];
        let dy = target[1][1] - self.selectedLetters[nLetters - 1][1];
        let d = dx * dx + dy * dy;
        // If the user still touches the last letter, do nothing.
        if (d == 0)
            return;
        // If the user touches far from the last letter, do nothing.
        if (d > 2)
            return;
        self.addLetter(target);
    }
    touchEnd(self, event) {
        self.manager.finalWord(self.word);
        self.word = "";
        self.selectedLetters.length = 0;
        self.unmarkAll();
    }
}
class GameManager {
    constructor(board, app) {
        this.board = board;
        this.app = app;
        this.game = new Game(board, this);
        this.ui = new GameUI();
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
        this.ui.setScore(this.score);
        this.ui.setCurrentGuess("");
        this.ui.setTimeRemaining(this.timeRemaining);
        this.ui.setWordRemaining(this.remainingWords);
        this.timer = setInterval(() => this.tick(this), 1000);
    }
    tick(self) {
        self.timeRemaining -= 1;
        self.ui.setTimeRemaining(self.timeRemaining);
        if (self.timeRemaining <= 0) {
            self.game.disable();
            clearInterval(self.timer);
            self.app.gameOver();
        }
    }
    partialWord(word) {
        this.ui.setCurrentGuess(word);
    }
    finalWord(word) {
        this.ui.setCurrentGuess("");
        // TODO: update UI
        if (this.board.words.indexOf(word) >= 0) {
            this.score += Board.getWordScore(word);
            let len = word.length;
            if (len > 8)
                len = 8;
            if (len >= 2) {
                this.remainingWords[len - 2] -= 1;
            }
            this.ui.setScore(this.score);
            this.ui.setWordRemaining(this.remainingWords);
            this.ui.addFoundWord(word);
        }
    }
}
class GameUI {
    constructor() { this.foundWords = new Array(); }
    setTimeRemaining(seconds) {
        document.getElementById("timeLeft").innerHTML =
            String(Math.floor(seconds / 60) + ":" + ("00" + seconds % 60).slice(-2));
    }
    setCurrentGuess(word) {
        document.getElementById("currentWord").innerHTML = word;
    }
    setScore(score) {
        document.getElementById("score").innerHTML = String(score);
    }
    setWordRemaining(wordCounts) {
        for (let i = 2; i < 9; ++i) {
            document.getElementById("remaining-" + i + (i == 8 ? "+" : "")).innerHTML =
                String(wordCounts[i - 2]);
        }
    }
    addFoundWord(word) {
        this.foundWords.push(word);
        this.foundWords.sort();
        document.getElementById("found").innerHTML = this.foundWords.join(" ");
    }
}
class Sheet {
    constructor(app) {
        this.app = app;
    }
    // Reloads the current row, even if new rows have been added after it.
    // This is useful when a game has ended and someone may have already created
    // a new game but we still want to read others' results from the correct row.
    reloadCurrentRow() {
        loadAllRows().then((response) => this.receiveData(this.currentRowIndex, response));
    }
    // Loads the last row, this is useful when we're done looking at others' results
    // and are ready to play the latest new game.
    loadLastRow() {
        loadAllRows().then((response) => this.receiveData(-1, response));
    }
    receiveData(rowIndex, response) {
        var values = response.result.values;
        this.currentRowIndex = rowIndex == -1 ? values.length - 1 : rowIndex;
        let row = values[this.currentRowIndex];
        if (row.length == 0)
            return;
        let board = Board.fromJson(row[0]);
        let users = new Array();
        for (let j = 1; j < row.length; ++j) {
            users.push(UserState.fromJson(row[j]));
        }
        this.currentRow = new SheetRow(board, users);
        this.app.notifyDataReady();
    }
    currentBoard() { return this.currentRow.getBoard(); }
    getCurrentRowIndex() { return this.currentRowIndex; }
    getCurrentGamesPlayers() { return this.currentRow.getUsers(); }
    didIPlayOnCurrentBoard() {
        for (let user of this.currentRow.getUsers()) {
            if (user.email == myEmailAddress())
                return true;
        }
        return false;
    }
    // Used when I am ready playing a board and want to store my results to the sheet.
    addUserStateToCurrentBoard(user) {
        loadAllRows().then((response) => this.appendUserState(this.currentRowIndex, user, response));
    }
    appendUserState(rowIndex, user, values) {
        // The column to store into is the one one after the last column set, so eg. if two
        // players have already stored their results, then A123 contains the board, 
        // B123 and C123 contain the results of those players and we want to write to D123.
        let col = String.fromCharCode("A".charCodeAt(0) + values[rowIndex].length + 1);
        updateSheet(col + String(1 + rowIndex), user.asJson());
    }
    // Used when a new board is created.
    addNewBoard(board) {
        loadAllRows().then((response) => this.appendNewBoard(board, response));
    }
    appendNewBoard(board, values) {
        this.currentRowIndex = values.length;
        this.currentRow = new SheetRow(board, []);
        updateSheet("A" + (1 + this.currentRowIndex), board.asJson());
    }
}
class SheetRow {
    constructor(board, users) {
        this.board = board;
        this.users = users;
    }
    getBoard() { return this.board; }
    getUsers() { return this.users; }
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