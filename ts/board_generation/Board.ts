class Board {
  public letters: Array<Array<string>>;
  public words: Array<string>;
  public totalScore: number;
  public size: number;
  private timeSeconds: number;

  constructor (size: number, timeSeconds: number) {
    this.size = size;
    this.timeSeconds = timeSeconds;
    this.letters = Array(size);
    for (let i = 0; i < size; i++) {
      this.letters[i] = Array(size);
    }
    this.totalScore = 0;
  }
 
  public asJson(): string {
    return JSON.stringify(this);
  }

  public static fromJson(boardJson: string): Board {
    let boardObj = JSON.parse(boardJson);
    let board = new Board(boardObj.size, boardObj.timeSeconds);
    for (var prop in boardObj) board[prop] = boardObj[prop];
    return board;
  }

  public setWords(words: Set<string>): void {
    this.words = new Array<string>();
    for (let word of words) {
      this.words.push(word);
    }
    this.words.sort();
    this.setScoreFromWords();
  }
  
  public setScoreFromWords(): void {
    this.totalScore = 0;
    for (let word of this.words) {
      let length = word.length;
      if (length == 2) {
        this.totalScore += 1;
      } else {
        this.totalScore += Math.floor((length * length - 5 * length + 10) / 2);
      }
    }
  }

  public static getExampleBoard(): Board {
    let board = new Board(2, 60);
    board.letters[0][0] = "É";
    board.letters[0][1] = "S";
    board.letters[1][0] = "K";
    board.letters[1][1] = "Ő";
    board.words = new Array<string>();
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