import javafx.util.Pair;

import java.util.ArrayList;
import java.util.List;

public class BoardGenerator {
    List<Pair<Integer, Integer>> word(int... coords) {
        ArrayList<Pair<Integer, Integer>> word = new ArrayList<>();
        int prev = -1;
        for (int i : coords) {
            if (prev == -1) {
                prev = i;
                continue;
            }
            word.add(new Pair<>(prev, i));
        }
        return word;
    }

    public Board generateBoard(int size, int timeSeconds, Vocabulary vocabulary) {
        Board board = new Board();
        board.size = 2;
        board.timeSeconds = 60;
        board.letters = new String[2][2];
        board.letters[0][0] = "É";
        board.letters[0][1] = "S";
        board.letters[1][0] = "K";
        board.letters[1][1] = "Ő";
        board.words = new ArrayList<>();
        board.words.add(word(0,0, 0,1));
        board.words.add(word(0,0, 1,0));
        board.words.add(word(1,0, 0,0, 0,1));
        board.words.add(word(1,0, 1,1));
        board.words.add(word(1,1, 0,1));
        return board;
    }
}
