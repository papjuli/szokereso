declare function getUserProfile(): any;

class UserState {
  public name: string;
  public email: string;
  public score: number;
  public foundWords: Array<string>;
  public startedGame: boolean;

  constructor (name: string, email: string) {
    this.name = name;
    this.email = email;
    this.score = 0;
    this.foundWords = Array<string>();
    this.startedGame = false;
  }

  public asJson(): string {
    return JSON.stringify(this);
  }

  public static fromJson(userJson: string): UserState {
    let userObj = JSON.parse(userJson);
    let userState = new UserState(userObj.name, userObj.email);
    for (var prop in userObj) userState[prop] = userObj[prop];
    return userState;
  }

  public addFoundWord(word: string) {
    this.foundWords.push(word);
    this.score += Board.getWordScore(word);
  }
}