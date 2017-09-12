
var szk = {
  foundWords: [],
  score: 0,
  word: "",
  playable: false
};

function startTimer() {
  szk.timer = setInterval(function() {
    document.getElementById("timer").innerHTML = szk.timeLeft;
    szk.timeLeft -= 1;
    if (szk.timeLeft == 0) {
      stopTimer();
    }
  }, 1000);
}

function stopTimer() {
  if (szk.timer != null) {
    clearInterval(szk.timer);
    saveBoardResult();
  }
}

function toMenu() {
  document.getElementById("game").style.display = "none";
  document.getElementById("menu").style.display = "inline";
  szk.playable = false;
  szk.foundWords = [];
  szk.score = 0;
  document.getElementById("found").innerHTML = "";
  document.getElementById("score").innerHTML = "";
  document.getElementById("timer").innerHTML = "";
  document.getElementById("boardResults").innerHTML = "";
  document.getElementById("board").classList.remove("unplayable");
  loadBoardList();
}

function mytouchstart(event) {
  if (!szk.playable) return;
  var touch = event.touches[0];
  var elem = document.elementFromPoint(touch.clientX, touch.clientY);
  if (elem.dataset.letter != 1) {
    return;
  }
  szk.prevElem = elem;
  szk.prevPrevElem = null;
  szk.word = elem.innerHTML;
  mark(elem);
}

function mytouchmove(event) {
  if (!szk.playable) return;
  var touch = event.touches[0];
  var elem = document.elementFromPoint(touch.clientX, touch.clientY);
  if (elem.dataset.letter != 1) {
    return;
  }
  if (elem == szk.prevElem) {
    return;
  }
  if (elem == szk.prevPrevElem) {
    unmark(szk.prevElem);
    szk.word = szk.word.slice(0, szk.word.length - 1);
    szk.prevElem = elem;
    szk.prevPrevElem = null;
    return;
  }
  if (isMarked(elem)) {
    return;
  }
  var dr = elem.dataset.row - szk.prevElem.dataset.row;
  var dc = elem.dataset.col - szk.prevElem.dataset.col;
  var d = dr*dr + dc*dc;
  if (d == 0 || d > 2) {
    return;
  }
  szk.word = szk.word + elem.innerHTML;
  mark(elem);
  szk.prevPrevElem = szk.prevElem;
  szk.prevElem = elem;
}

function bodyTouchMove(event) {
  if (szk.playable) {
    event.preventDefault();
  }
}

function mytouchend(event) {
  if (!szk.playable) return;
  guessWord();
  szk.word = "";
  var divs = document.getElementById("board").getElementsByTagName("div");
  for (i=0; i<divs.length; ++i) {
    unmark(divs[i]);
  }
}

function guessWord() {
  var length = szk.word.length < 8 ? szk.word.length : "8+";
  var index = szk.remainingWords[length].indexOf(szk.word);
  if (index != -1) {
    szk.score += scoreOf(szk.word);
    document.getElementById("score").innerHTML = szk.score;
    szk.foundWords.push(szk.word);
    szk.foundWords.sort();
    document.getElementById("found").innerHTML = szk.foundWords.join(" "); //+= " " + szk.word;
    szk.remainingWords[length].splice(index, 1);
    document.getElementById("remaining-" + length).innerHTML = szk.remainingWords[length].length;
  }
}

function scoreOf(word) {
  var length = word.length;
  if (length == 2) {
    return 1;
  } else {
    return (length * length - 5 * length + 10) / 2;
  }
}

function mark(elem) {
  elem.classList.add("marked");
}

function unmark(elem) {
  elem.classList.remove("marked");
}

function isMarked(elem) {
  elem.classList.contains("marked");
}

function makeUnplayable() {
  szk.playable = false;
  document.getElementById("board").className += " unplayable";
  document.getElementById("gameplay").style.display = "none";
  document.getElementById("results").style.display = "inline";
  getBoardResults();
}

function startGame(event) {
  console.log("Clicked " + event);
  szk.boardData = JSON.parse(event.target.dataset.json);
  setRemainingWords();
  setLetters(szk.boardData);
  szk.sheetRow = event.target.dataset.sheetRow;
  document.getElementById("game").style.display = "inline";
  document.getElementById("menu").style.display = "none";
  document.getElementById("gameplay").style.display = "inline";
  document.getElementById("results").style.display = "none";
  if (event.target.dataset.playable != "true") {
    makeUnplayable();
  } else {
    szk.playable = true;
  }

  if (szk.playable) {
    startTimer();
  }
}

function setLetters(boardData) {
  console.log(boardData)
  szk.timeLeft = boardData.timeSeconds;
  document.getElementById("board").innerHTML = "";
  document.getElementById("board").style.setProperty("--boardSize", boardData.size);
  var totalScore = boardData.totalScore
  if (totalScore == undefined) {
    totalScore = 0;
    for (var i = 0; i < boardData.words.length; i++) {
      totalScore += scoreOf(boardData.words[i]);
    }
  }
  document.getElementById("totalScore").innerHTML = totalScore;

  for (i=0; i<boardData.size; ++i) {
    for (j=0; j<boardData.size; ++j) {
      d = document.createElement("div");
      d.innerHTML = boardData.letters[i][j];
      d.dataset.row = i;
      d.dataset.col = j;
      d.dataset.letter = 1;
      d.className = "letter";
      d.addEventListener("touchend", mytouchend);
      d.addEventListener("touchstart", mytouchstart);
      d.addEventListener("touchmove", mytouchmove);
      document.getElementById("board").appendChild(d);
    }
  }
}

function setRemainingWords() {
  szk.remainingWords = [[], [], [], [], [], [], [], []];
  szk.remainingWords["8+"] = [];
  for (var i = 0; i < szk.boardData.words.length; i++) {
    var word = szk.boardData.words[i];
    var length = word.length < 8 ? word.length : "8+";
    szk.remainingWords[length].push(word);
  }
  console.log(szk.remainingWords);
  for (var i = 2; i < 8; i++) {
    var length = szk.remainingWords[i].length;
    document.getElementById("remaining-"+i).innerHTML = length > 0 ? length : "-";
  }
  var length = szk.remainingWords["8+"].length;
  document.getElementById("remaining-8+").innerHTML = length > 0 ? length : "-";
}