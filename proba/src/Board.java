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
        for (String[] row : letters) {
            result.append("[");
            for (String letter : row) {
                result.append("\"");
                result.append(letter);
                result.append("\",");
            }
            result.append("],");
        }
        result.append("], words: [");
        for (List<Pair<Integer, Integer>> word : words) {
            result.append("[");
            for (Pair<Integer, Integer> coord : word) {
                result.append("[");
                result.append(coord.getKey());
                result.append(",");
                result.append(coord.getValue());
                result.append("],");
            }
            result.append("],");
        }
        result.append("]}");
        return result.toString();
    }
}
