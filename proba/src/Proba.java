public class Proba {
    public static void main(String[] args) {
        System.out.println("Hello world!");
        BoardGenerator generator = new BoardGenerator();
        System.out.println(generator.generateBoard(2, 60, new Vocabulary()).asJson());
    }
}
