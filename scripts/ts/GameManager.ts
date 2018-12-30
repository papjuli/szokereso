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
        self.app.gameOver();
    }

    public rotateBoard(self): void {
        self.game.rotateBoard();
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

    private sign(color: string): string {
        return "<font color=\"" + color + "\">●</font>";
    }

    public displayAllWords(userStates: UserState[]): void {
        let result = "";
        let myState: UserState = null;
        let othersStates = new Array<UserState>();
        let allStates = new Array<UserState>();
        for (let state of userStates) {
            allStates.push(state);
            if (state.email == myEmailAddress()) {
                myState = state;
            } else {
                othersStates.push(state);
            }
        }
        let foundWordColor = "black";
        let notFoundWordColor = "darkGrey";
        let myColor = "blue";
        let othersColors = ["red", "green", "orange", "purple", "brown"];
        allStates.sort((a, b) => b.score - a.score);
        for (let state of allStates) {
            let color = myColor;
            if (othersStates.indexOf(state) >= 0) {
                color = othersColors[othersStates.indexOf(state)];
            }
            result += state.email + this.sign(color) + " " +
                String(state.score) + "/" + String(this.board.totalScore) + "<br>";
        }
        for (let word of this.board.words) {
            let finders = "";
            let found = false;
            let someoneMissed = false;
            if (myState.foundWords.indexOf(word) >= 0) {
                console.log("Found");
                found = true;
                finders += this.sign(myColor);
            } else {
                someoneMissed = true;
            }
            for (let i = 0; i < othersStates.length; ++i) {
                if (othersStates[i].foundWords.indexOf(word) >= 0) {
                    found = true;
                    finders += this.sign(othersColors[i]);
                } else {
                    someoneMissed = true;
                }
            }
            if (found && !someoneMissed) {
                finders = "<font color=\"" + foundWordColor + "\">○</font>";
            }
            let renderedWord = "<span>";
            if (found) {
                renderedWord += "<font color=\"" + foundWordColor + "\">" + word + "</font>";
                renderedWord += finders;
            } else {
                renderedWord += "<font color=\"" + notFoundWordColor + "\">" + word + "</font>";
            }
            renderedWord += " </span>";
            result += renderedWord;
        }
        document.getElementById("allWords").innerHTML = result;
    }

    public updateUser(user: UserState): void {
        user.score = this.score;
        user.foundWords = this.foundWords;
    }

    public renderUserStates(userStates: UserState[]): void {
        // TODO remove all this once we get real results.
        let otherUser = new UserState("Someone Else", "other@email.com");
        otherUser.score = 5;
        otherUser.foundWords = [this.foundWords[0], this.foundWords[1]];
        let anotherUser = new UserState("Someone Other", "another@email.com");
        anotherUser.score = 3;
        anotherUser.foundWords = [this.foundWords[0], this.foundWords[2]];
        this.displayAllWords([userStates[0], anotherUser, otherUser]);
    }
}
