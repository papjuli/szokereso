
board = null;
letters = null;
words = null;
timeLeft = null;

sheetRow = -1;

found_words = [];
score = 0;

word = "";

prevElem = null;
prevPrevElem = null;
timer = null;

function startTimer() {
  timer = setInterval(function() {
    document.getElementById("timer").innerHTML = timeLeft;
    timeLeft -= 1;
    if (timeLeft == 0) {
      stop(timer);
    }
  }, 1000);
}

function stopTimer() {
  if (timer != null) {
    clearInterval(timer);
    saveBoardResult();
  }
}

function toMenu() {
  document.getElementById("game").style.display = "none";
  document.getElementById("menu").style.display = "inline";
  playable = true;
  found_words = [];
  score = 0;
  document.getElementById("found").innerHTML = "";
  document.getElementById("score").innerHTML = "";
  document.getElementById("timer").innerHTML = "";
  document.getElementById("board").classList.remove("unplayable");
  loadBoardList();
}

playable = true;

function mytouchstart(event) {
  if (!playable) return;
  touch = event.touches[0];
  elem = document.elementFromPoint(touch.clientX, touch.clientY);
  if (elem.dataset.letter != 1) {
    return;
  }
  prevElem = elem;
  prevPrevElem = null;
  word = elem.innerHTML;
  mark(elem);
  showCurrentGuess();
}

function mytouchmove(event) {
  if (!playable) return;
  touch = event.touches[0];
  elem = document.elementFromPoint(touch.clientX, touch.clientY);
  if (elem.dataset.letter != 1) {
    return;
  }
  if (elem == prevElem) {
    return;
  }
  if (elem == prevPrevElem) {
    unmark(prevElem);
    word = word.slice(0, word.length - 1);
    showCurrentGuess();
    prevElem = elem;
    prevPrevElem = null;
    return;
  }
  if (isMarked(elem)) {
    return;
  }
  dr = elem.dataset.row - prevElem.dataset.row;
  dc = elem.dataset.col - prevElem.dataset.col;
  d = dr*dr + dc*dc;
  if (d == 0 || d > 2) {
    return;
  }
  word = word + elem.innerHTML;
  showCurrentGuess();
  mark(elem);
  prevPrevElem = prevElem;
  prevElem = elem;
}

function mytouchend(event) {
  if (!playable) return;
  guessWord();
  word = "";
  showCurrentGuess();
  divs = document.getElementById("board").getElementsByTagName("div");
  for (i=0; i<divs.length; ++i) {
    unmark(divs[i]);
  }
}

function guessWord() {
  if (words.indexOf(word) != -1) {
    if (found_words.indexOf(word) == -1) {
      document.getElementById("found").innerHTML += " " + word;
      length = word.length;
      if (length == 2) {
        score += 1;
      } else {
        score += (length * length - 5 * length + 10) / 2;
      }
      document.getElementById("score").innerHTML = score;
      found_words.push(word);
    }
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

function showCurrentGuess() {
  document.getElementById("result").innerHTML = word;
}

function makeUnplayable() {
  playable = false;
  document.getElementById("board").className += " unplayable";
  document.getElementById("saveButton").style.display = "none";
  document.getElementById("endOfGameButtons").style.display = "inline";
  getBoardResults();
}

function updateBoardResults(results) {
  document.getElementById("boardResults").innerHTML = results + "<br>All words: " + words;
}

function setLettersFromDataset(event) {
  console.log("Clicked " + event);
  boardData = JSON.parse(event.target.dataset.json)
  setLetters(boardData);
  sheetRow = event.target.dataset.sheetRow;
  document.getElementById("saveButton").style.display = "inline";
  document.getElementById("endOfGameButtons").style.display = "none";
  document.getElementById("boardResults").innerHTML = "";
  if (event.target.dataset.playable != "true") {
    makeUnplayable();
  } else {
    playable = true;
  }
  document.getElementById("game").style.display = "inline";
  document.getElementById("menu").style.display = "none";
  if (playable) {
    startTimer();
  }
  document.getElementById("solvedByMe").innerHTML = "";
  document.getElementById("solvedBySomeone").innerHTML = "";
  document.getElementById("unsolved").innerHTML = "";
}

function setLetters(boardData) {
  console.log(boardData)
  words = boardData.words;
  letters = boardData.letters;
  timeLeft = boardData.timeSeconds;
  document.getElementById("board").innerHTML = "";
  document.getElementById("board").style.setProperty("--boardSize", boardData.size);

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