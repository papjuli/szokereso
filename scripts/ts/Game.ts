class Game {
    private playable: boolean;

    private selectedLetters: [number, number][];
    private word: string;

    constructor(private board: Board, private manager: GameManager) {
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

    public disable(): void {
        this.playable = false;
        this.unmarkAll();
    }

    private boardDiv(): HTMLDivElement {
        let boardDiv = document.getElementById("board");
        if (boardDiv instanceof HTMLDivElement) return boardDiv;
        return null;
    }

    private target(self: Game, event: TouchEvent): [HTMLDivElement, [number, number]] {
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

    private addLetter(target: [HTMLDivElement, [number, number]]): void {
        this.selectedLetters.push(target[1]);
        target[0].classList.add("marked");
        this.word += this.board.letters[target[1][0]][target[1][1]];
        this.manager.partialWord(this.word);
    }

    private unmarkAll(): void {
        for (let child of this.boardDiv().children) {
            child.classList.remove("marked");
        }
    }

    private touchStart(self: Game, event: TouchEvent): void {
        self.selectedLetters.length = 0;
        let target = self.target(self, event);
        if (target == null) return;
        self.addLetter(target);
    }

    private touchMove(self: Game, event: TouchEvent): void {
        let target = self.target(self, event);
        if (target == null) return;
        // If this drag has not started on a letter, ignore.
        if (self.selectedLetters.length == 0) return;
        let nLetters = self.selectedLetters.length;

        // When moving back to the penultimate letter, remove the last letter.
        if (nLetters > 1) {
            if (target[1][0] == self.selectedLetters[nLetters - 2][0] && 
                target[1][1] == self.selectedLetters[nLetters - 2][1]) {
                    self.selectedLetters.pop();
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
        let dx = target[1][0] - self.selectedLetters[nLetters-1][0];
        let dy = target[1][1] - self.selectedLetters[nLetters-1][1];
        let d = dx*dx + dy*dy;
        // If the user still touches the last letter, do nothing.
        if (d == 0) return;
        // If the user touches far from the last letter, do nothing.
        if (d > 2) return;
        self.addLetter(target);
    }

    private touchEnd(self: Game, event: TouchEvent): void {
        self.manager.finalWord(self.word);
        self.word = "";
        self.selectedLetters.length = 0;
        self.unmarkAll();
    }
}