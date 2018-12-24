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
                letter.addEventListener("touchstart", this.touchStart);
                letter.addEventListener("touchmove", this.touchMove);
                letter.addEventListener("touchend", this.touchEnd);
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

    private target(event: TouchEvent): [HTMLDivElement, [number, number]] {
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

    private touchStart(event: TouchEvent): void {
        this.selectedLetters.length = 0;
        let target = this.target(event);
        if (target == null) return;
        this.addLetter(target);
    }

    private touchMove(event: TouchEvent): void {
        let target = this.target(event);
        if (target == null) return;
        // If this drag has not started on a letter, ignore.
        if (this.selectedLetters.length == 0) return;
        let dx = target[1][0] - this.selectedLetters[-1][0];
        let dy = target[1][1] - this.selectedLetters[-1][1];
        let d = dx*dx + dy*dy;
        // If the user still touches the last letter, do nothing.
        if (d == 0) return;
        // If the user touches far from the last letter, do nothing.
        if (d > 2) return;
        this.addLetter(target);
    }

    private touchEnd(event: TouchEvent): void {
        this.manager.finalWord(this.word);
        this.word = "";
        this.selectedLetters.length = 0;
        this.unmarkAll();
    }
}