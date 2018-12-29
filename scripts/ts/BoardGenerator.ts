class BoardGenerator {
  public alphabet: Array<string>;
  public letterFreqs: Array<number>;
  private vocab: Array<string>;

  constructor (vocabulary: Array<string>) {
    vocabulary.sort();
    this.vocab = vocabulary;
    this.getLetterFreqs();
  }

  public generateBoard(size: number, 
              timeSeconds: number, 
              scoreThreshold: number) {
    while (true) {
      let board: Board = new Board(size, timeSeconds);
      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
          board.letters[row][col] = this.getRandomLetter();
        }
      }
      let covered: boolean = this.solveBoard(board);
      if (covered && board.totalScore >= scoreThreshold) return board;
    }
  }

  private getRandomLetter(): string {
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
  
  private solveBoard(board: Board): boolean {
    let words: Set<string> = new Set<string>();
    let covered: boolean[][] = new Array<boolean[]>(board.size);
    for (let i = 0; i < board.size; i++) {
      covered[i] = new Array<boolean>(board.size);
      covered[i].fill(false);
    }

    for (let startRow = 0; startRow < board.size; startRow++) {
      for (let startCol = 0; startCol < board.size; startCol++) {
        let taken: boolean[][] = new Array<boolean[]>(board.size);
        for (let i = 0; i < board.size; i++) {
          taken[i] = new Array<boolean>(board.size);
          taken[i].fill(false);
        }
        taken[startRow][startCol] = true;
        let stack: Array<any> = new Array<any>();
        stack.push(new this.Cell(startRow, startCol, 
                          0, this.vocab.length, 
                          board.letters[startRow][startCol],
                          this.vocab));
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
    board.setScoreFromWords();

    let allCovered: boolean = true;
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

  private getLetterFreqs(): void {
    let letterCounts = new Map<string, number>();
    let count = 0;
    for (let word of this.vocab) {
      for (let i = 0; i < word.length; i++) {
        count++;
        let letter = word[i];
        if (!letterCounts.has(letter)) {
          letterCounts.set(letter, 1);
        } else {
          letterCounts.set(letter, letterCounts.get(letter)+1);
        }
      }
    }
    this.alphabet = new Array<string>(letterCounts.size);
    this.letterFreqs = new Array<number>(letterCounts.size);
    let i = 0;
    for (let letter of letterCounts.keys()) {
      this.alphabet[i] = letter;
      this.letterFreqs[i] = letterCounts.get(letter) / count;
      i++;
    }
  }

  Cell = class Cell {
    static nextRowOffset: Array<number> = [-1, -1, 0, 1, 1, 1, 0, -1];
    static nextColOffset: Array<number> = [0, 1, 1, 1, 0, -1, -1, -1];
  
    row: number;
    col: number;
    hi: number;
    lo: number;
    nextPos: number;
    prefix: string;
    vocab: Array<string>;
  
    constructor(row: number, 
        col: number,
        prevLo: number,
        prevHi: number,
        prefix: string,
        vocab: Array<string>) {
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
      let m: number;
      while (ll < lh) {
        let m = Math.floor((lh + ll) / 2);
        if (vocab[m] < prefix) {
          ll = m + 1;
        } else if (vocab[m] == prefix) {
          ll = lh = m;
        } else {
          lh = m;
        }
      }
      this.lo = ll;
  
      if (!vocab[this.lo].startsWith(prefix)) {
        this.hi = this.lo;
      } else {
        let hl = this.lo;
        let hh = prevHi;
        while (hl < hh - 1) {
          m = Math.floor((hl + hh) / 2);
          if (vocab[m].startsWith(prefix)) {
            hl = m;
          } else {
            hh = m;
          }
        }
        this.hi = hl + 1;
      }
    }
  
    public getNextNeighbor(board: Board): Cell {
      let nextRow: number;
      let nextCol: number;
      while (true) {
        if (this.nextPos == 8) return null;
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
      return new Cell(nextRow, nextCol, 
                      this.lo, this.hi, 
                      this.prefix + board.letters[nextRow][nextCol],
                      this.vocab);
    } 
  }
}