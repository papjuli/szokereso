
board = null;
letters = null;
words = null;

sheetRow = -1;

found_words = [];
score = 0;

word = "";

prevElem = null;
prevPrevElem = null;

function mytouchstart(event) {
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
  elem.style.backgroundColor = "red";
}

function unmark(elem) {
  elem.style.backgroundColor = "white";
}

function isMarked(elem) {
  return elem.style.backgroundColor == "red";
}

function showCurrentGuess() {
  document.getElementById("result").innerHTML = word;
}

function setLettersFromDataset(event) {
  console.log("Clicked " + event);
  setLetters(JSON.parse(event.target.dataset.json));
  sheetRow = event.target.dataset.sheetRow;
  document.getElementById("boardList").innerHTML = "";
}

function setLetters(b) {
  words = b.words;
  letters = b.letters;
  document.getElementById("board").innerHTML = "";
  document.getElementById("board").style.setProperty("--boardSize", b.size);

  for (i=0; i<b.size; ++i) {
    for (j=0; j<b.size; ++j) {
      d = document.createElement("div");
      d.innerHTML = b.letters[i][j];
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