package papjuli.szokereso;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;

public class Proba {
    public static void main(String[] args) throws IOException {
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

        ClassLoader classloader = Thread.currentThread().getContextClassLoader();
        URL url = classloader.getResource("resources/szavak.txt");
        if (url == null) {
            System.out.println("szavak.txt not found!");
        } else {
            File file = new File(url.getFile());
            BoardGenerator boardGenerator2 = new BoardGenerator(file);
            System.out.println(Arrays.toString(boardGenerator2.alphabet));
            System.out.println(boardGenerator2.generateBoard(3, 300).asJson());
        }
    }
}
