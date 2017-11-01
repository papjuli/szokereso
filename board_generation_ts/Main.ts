//import {hungarian_vocabulary} from './hungarian_vocabulary.js';

let board: Board = Board.getExampleBoard();
console.log(board.asJson());
document.getElementById("mydiv").innerHTML = board.asJson();

console.log("creating a board generator...");
let boardGenerator = new BoardGenerator(["elme", "elem", "eme", "emel"]);
let board2 = boardGenerator.generateBoard(3, 180, 0);
console.log(board2.asJson());

let hunBoardGenerator = new BoardGenerator(hungarian_vocabulary);
let board3 = hunBoardGenerator.generateBoard(3, 180, 20);
console.log(board3.asJson());
