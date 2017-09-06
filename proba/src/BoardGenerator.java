import java.util.*;

public class BoardGenerator {
    private ArrayList<String> vocab;
    private String[] alphabet;
    private double[] letterFreqs;
    private Random random;
    private static int[] nextRowOffset = new int[] {-1, -1, 0, 1, 1, 1, 0, -1};
    private static int[] nextColOffset = new int[] {0, 1, 1, 1, 0, -1, -1, -1};

    BoardGenerator(ArrayList<String> vocabulary) {
        vocabulary.sort(Comparator.naturalOrder());
        this.vocab = vocabulary;
        this.getLetterFreqs();
        this.random = new Random();
    }

    private void getLetterFreqs() {
        TreeMap<String, Integer> result = new TreeMap<>();
        int count = 0;
        for (String word: this.vocab) {
            for (int i = 0; i < word.length(); i++) {
                count++;
                String letter = word.substring(i,i+1);
                if (!result.containsKey(letter)) {
                    result.put(letter, 1);
                } else {
                    result.put(letter, result.get(letter) + 1);
                }
            }
        }
        alphabet = new String[result.size()];
        letterFreqs = new double[result.size()];
        int i = 0;
        for (String letter: result.keySet()) {
            alphabet[i] = letter;
            letterFreqs[i] = result.get(letter).doubleValue() / count;
            i++;
        }
    }

    Board generateBoard(int size, int timeSeconds) {
        Board board = new Board();
        board.size = size;
        board.timeSeconds = timeSeconds;
        board.letters = new String[size][size];
        for (int row = 0; row < size; row++) {
            for (int col = 0; col < size; col++) {
                board.letters[row][col] = getRandomLetter();
            }
        }
        solveBoard(board);
        return board;
    }

    private String getRandomLetter() {
        double d = random.nextDouble();
        double sum = 0;
        for (int i = 0; i < alphabet.length; i++) {
            sum += letterFreqs[i];
            if (sum > d) {
                return alphabet[i];
            }
        }
        return alphabet[alphabet.length - 1];
    }

    private void solveBoard(Board board) {
        TreeSet<String> words = new TreeSet<>();

        for (int startRow = 0; startRow < board.size; startRow++ ) {
            for (int startCol = 0; startCol < board.size; startCol++) {
                boolean[][] taken = new boolean[board.size][board.size];
                taken[startRow][startCol] = true;
                Deque<Position> stack = new ArrayDeque<>();
                stack.add(new Position(startRow, startCol, 0, vocab.size(), board.letters[startRow][startCol]));
                while (!stack.isEmpty()) {
                    Position current = stack.peek();
                    Position next = current.getNextNeighbor(board);
                    if (next == null) {
                        taken[current.row][current.col] = false;
                        stack.pop();
                        continue;
                    }
                    if (taken[next.row][next.col] || next.lo >= next.hi) {
                        continue;
                    }
                    if (vocab.get(next.lo).length() == next.prefix.length()) {
                        words.add(next.prefix);
                    }
                    taken[next.row][next.col] = true;
                    stack.push(next);
                }
            }
        }

        board.words = new ArrayList<>();
        board.words.addAll(words);
    }

    class Position {
        int row;
        int col;
        int hi;
        int lo;
        int nextPos;
        String prefix;

        Position(int row, int col, int prevLo, int prevHi, String prefix) {
            this.row = row;
            this.col = col;
            this.nextPos = 0;
            this.prefix = prefix;

            if (prevLo >= prevHi || vocab.get(prevHi - 1).compareTo(prefix) < 0) {
                hi = lo = prevLo;
                return;
            }

            int ll = prevLo;
            int lh = prevHi;
            int m;
            while (ll < lh) {
                m = (lh + ll) / 2;
                int comp = vocab.get(m).compareTo(prefix);
                if (comp < 0) {
                    ll = m + 1;
                } else if (comp == 0) {
                    ll = lh = m;
                } else {
                    lh = m;
                }
            }
            lo = ll;

            if (!vocab.get(lo).startsWith(prefix)) {
                hi = lo;
            } else {
                int hl = lo;
                int hh = prevHi;
                while (hl < hh - 1) {
                    m = (hl + hh) / 2;
                    if (vocab.get(m).startsWith(prefix)) {
                        hl = m;
                    } else {
                        hh = m;
                    }
                }
                hi = hl + 1;
            }
        }

        Position getNextNeighbor(Board board) {
            int nextRow;
            int nextCol;
            while (true) {
                if (nextPos == 8) return null;
                nextRow = row + nextRowOffset[nextPos];
                if (nextRow < 0 || nextRow >= board.size) {
                    nextPos++;
                    continue;
                }
                nextCol = col + nextColOffset[nextPos];
                if (nextCol < 0 || nextCol >= board.size) {
                    nextPos++;
                    continue;
                }
                break;
            }
            nextPos++;
            return new Position(nextRow, nextCol, lo, hi, prefix + board.letters[nextRow][nextCol]);
        }
    }

    public static void main(String[] args) {
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
        System.out.println(Arrays.toString(boardGenerator.letterFreqs));

        System.out.println(vocab);
        Position pos = boardGenerator.new Position(0, 0, 0, vocab.size(), "É");
        System.out.println(pos.lo + " " + pos.hi);

        Board board = Board.getExampleBoard(); //boardGenerator.generateBoard(2, 300);
        boardGenerator.solveBoard(board);
        System.out.println(board.asJson());

        Board board2 = boardGenerator.generateBoard(5, 200);
        System.out.println(board2.asJson());
    }
}
