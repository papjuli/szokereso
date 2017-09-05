import javafx.util.Pair;

import java.util.List;

class Board {
    String[][] letters;
    int size;
    int timeSeconds;
    List<List<Pair<Integer, Integer>>> words;

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
        result.append("], words: [");
        boolean firstWord = true;
        for (List<Pair<Integer, Integer>> word : words) {
            result.append(firstWord ? "[" : ",[");
            firstWord = false;
            boolean firstCoord = true;
            for (Pair<Integer, Integer> coord : word) {
                result.append(firstCoord ? "[" : ",[");
                firstCoord = false;
                result.append(coord.getKey());
                result.append(",");
                result.append(coord.getValue());
                result.append("]");
            }
            result.append("]");
        }
        result.append("]}");
        return result.toString();
    }
}
