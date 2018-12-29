class GameUI {
    private foundWords: string[];

    constructor() { this.foundWords = new Array(); }

    public setTimeRemaining(seconds: number): void {
        document.getElementById("timeLeft").innerHTML = 
            String(Math.floor(seconds / 60) + ":" + ("00" + seconds % 60).slice(-2));
    }

    public setCurrentGuess(word: string): void {
        document.getElementById("currentWord").innerHTML = word;
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

    public displayAllWords(words: string[]): void {
        document.getElementById("allWords").innerHTML = 
            words.join(", ");
    }

    public displayTotalScore(totalScore: number): void {
        document.getElementById("totalScore").innerHTML = String(totalScore);
    }
}
