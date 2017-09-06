import java.util.ArrayList;

public class Proba {
    public static void main(String[] args) {
        System.out.println("Hello world!");

        ArrayList<String> vocab = new ArrayList<>();
        vocab.add("ESŐ");
        vocab.add("ÉK");
        vocab.add("ÉS");
        vocab.add("KÉS");
        vocab.add("KÉSŐ");
        vocab.add("KŐ");
        vocab.add("ŐK");
        vocab.add("ŐS");

        BoardGenerator generator = new BoardGenerator(vocab);
        System.out.println(generator.generateBoard(3, 300).asJson());

        System.out.println(generator.generateBoard(4, 400).asJson());
    }
}
