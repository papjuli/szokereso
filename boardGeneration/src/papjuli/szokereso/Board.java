package papjuli.szokereso;

import java.util.ArrayList;
import java.util.List;

class Board {
    String[][] letters;
    int size;
    int timeSeconds;
    List<String> words;
    int score;

    void setScoreFromWords() {
        score = 0;
        for (String word: words) {
            int length = word.length();
            if (length == 2) {
                score += 1;
            } else {
                score += (length * length - 5 * length + 10) / 2;
            }
        }
    }

    String asJson() {
        StringBuilder result = new StringBuilder();
        result.append("{");
        result.append("\"size\": ");
        result.append(size);
        result.append(", \"timeSeconds\": ");
        result.append(timeSeconds);
        result.append(", \"letters\": [");

        boolean firstRow = true;
        for (String[] row : letters) {
            result.append(firstRow ? "[" : ",[");
            firstRow = false;
            boolean firstLetter = true;
            for (String letter : row) {
                result.append(firstLetter ? "\"" : ",\"");
                firstLetter = false;
                result.append(letter);
                result.append("\"");
            }
            result.append("]");
        }
        result.append("]");

        result.append(", \"totalScore\": ");
        result.append(score);

        result.append(", \"words\": [");
        boolean firstWord = true;
        for (String word : words) {
            if (!firstWord) result.append(",");
            firstWord = false;
            result.append("\"");
            result.append(word);
            result.append("\"");
        }

        result.append("]}");
        return result.toString();
    }

    static Board getExampleBoard() {
        Board board = new Board();
        board.size = 2;
        board.timeSeconds = 60;
        board.letters = new String[2][2];
        board.letters[0][0] = "É";
        board.letters[0][1] = "S";
        board.letters[1][0] = "K";
        board.letters[1][1] = "Ő";
        board.words = new ArrayList<>();
        board.words.add("ÉS");
        board.words.add("ÉK");
        board.words.add("KÉS");
        board.words.add("KÉSŐ");
        board.words.add("KŐ");
        board.words.add("ŐK");
        board.words.add("ŐS");
        return board;
    }
}
