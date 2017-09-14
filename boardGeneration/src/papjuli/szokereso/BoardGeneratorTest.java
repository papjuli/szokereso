package papjuli.szokereso;

import java.util.ArrayList;
import java.util.Arrays;
import org.junit.Test;
import static org.junit.Assert.assertEquals;

public class BoardGeneratorTest {

    @Test
    public void test() {
        ArrayList<String> vocab = new ArrayList<>();
        vocab.add("ESŐ");
        vocab.add("ÉK");
        vocab.add("ÉS");
        vocab.add("KÉS");
        vocab.add("KÉSŐ");
        vocab.add("KŐ");
        vocab.add("ŐK");
        vocab.add("ŐS");
        BoardGenerator boardGenerator = new BoardGenerator(vocab);
        System.out.println(Arrays.toString(boardGenerator.alphabet));
        assertEquals(5, boardGenerator.alphabet.length);
        System.out.println(Arrays.toString(boardGenerator.letterFreqs));
        double sum = Arrays.stream(boardGenerator.letterFreqs).sum();
        assertEquals(1, sum, 0.001);

        System.out.println(vocab);
        BoardGenerator.Position pos = boardGenerator.new Position(0, 0, 0, vocab.size(), "É");
        System.out.println(pos.lo + " " + pos.hi);

        Board board = Board.getExampleBoard(); //boardGenerator.generateBoard(2, 300);
        boardGenerator.solveBoard(board);
        System.out.println(board.asJson());

        Board board2 = boardGenerator.generateBoard(5, 200, 0);
        System.out.println(board2.asJson());

    }
}
