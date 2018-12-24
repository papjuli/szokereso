
function handleClientLoad() {
  // Loads the client library and the auth2 library together for efficiency.
  // Loading the auth2 library is optional here since `gapi.client.init` function will load
  // it if not already loaded. Loading it upfront can save one network request.
  gapi.load('client:auth2', initClient);
}

function initClient() {
  // Initialize the client with API key and People API, and initialize OAuth with an
  // OAuth 2.0 client ID and scopes (space delimited string) to request access.
  gapi.client.init({
    discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
    clientId: '544351928107-lnucrgo39ustk9aq28s7hnp9kdto6k5j.apps.googleusercontent.com',
    scope: 'https://www.googleapis.com/auth/spreadsheets'
  }).then(function() {
    var auth2 = gapi.auth2.getAuthInstance();
    if (auth2.isSignedIn.get()) {
      signedIn(auth2.currentUser.get());
    } else {
      signedOut();
    }
  });
}

function signedIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  document.getElementById("whoami").innerHTML = profile.getEmail() + " " + profile.getName();
  document.getElementById("signin-button").style.display = "none";
  document.getElementById("signout-button").style.display = "inline";
  // loadBoardList(profile);
  loadLatestBoard(profile);
}

function signedOut() {
  document.getElementById("whoami").innerHTML = "";
  document.getElementById("signin-button").style.display = "inline";
  document.getElementById("signout-button").style.display = "none";
  document.getElementById("unsolved").innerHTML = "";
  document.getElementById("solvedBySomeone").innerHTML = "";
  document.getElementById("solvedByMe").innerHTML = "";
}

function getUserProfile() {
  return gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
}

function handleSignInClick(event) {
  // Ideally the button should only show up after gapi.client.init finishes, so that this
  // handler won't be called before OAuth is initialized.
  gapi.auth2.getAuthInstance().signIn().then(signedIn);
}

function handleSignOutClick(event) {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(signedOut);
}

// nem kell
function loadLatestBoard(profile) {
  if (!profile) {
    profile = getUserProfile();
  }
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: '1u9w_rAWrPBUnmQ_G4TYvnIEDifVQg4HWKhbqvFET2Yk',
    range: 'games!A1:Z9999',
  }).then(function(result) {
    console.log(result);
  })
}

// kell
function loadAllRows() {
  return gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: '1u9w_rAWrPBUnmQ_G4TYvnIEDifVQg4HWKhbqvFET2Yk',
    range: 'A1:Z9999',
  });
}

// nem kell
function loadBoardList(profile) {
  if (!profile) {
    profile = getUserProfile();
  }
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: '1u9w_rAWrPBUnmQ_G4TYvnIEDifVQg4HWKhbqvFET2Yk',
    range: 'A1:Z9999',
  }).then(function(result) {
    console.log(result);
    var rows = result.result.values;
    var sizes = new Map();
    sizes.set("unsolved", new Map());
    sizes.set("solvedBySomeone", new Map());
    sizes.set("solvedByMe", new Map());
    document.getElementById("unsolved").innerHTML = "";
    document.getElementById("solvedBySomeone").innerHTML = "";
    document.getElementById("solvedByMe").innerHTML = "";
    for (i=0; i<rows.length; ++i) {
      var b = document.createElement("button");
      b.innerHTML = "Load board " + (i + 1);
      b.dataset.json = rows[i][0];
      b.dataset.sheetRow = i+1;
      b.dataset.playable = true;
      b.addEventListener("click", startGame);
      var kind = "unsolved";
      if (rows[i].length > 1) {
        kind = "solvedBySomeone";
        for (j = 1; j < rows[i].length; ++j) {
          if (rows[i][j] == profile.getEmail()) {
            kind = "solvedByMe";
            b.dataset.playable = false;
          }
        }
      }
      var currentSizes = sizes.get(kind);
      var currentDiv = document.getElementById(kind);
      var parsedBoard = JSON.parse(b.dataset.json);
      var sizeAndTime = "Size " + parsedBoard.size + " time " + parsedBoard.timeSeconds;
      if (!currentSizes.has(sizeAndTime)) {
        var titleDiv = document.createElement("div");
        titleDiv.innerHTML = sizeAndTime;
        currentDiv.appendChild(titleDiv);
        contentDiv = document.createElement("div");
        currentSizes.set(sizeAndTime, contentDiv);
        currentDiv.appendChild(contentDiv);
      }
      currentSizes.get(sizeAndTime).appendChild(b);
    }
  });
}

// nem kell
function getBoardResults() {
  var range = "A" + szk.sheetRow + ":Z" + szk.sheetRow;
  gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: '1u9w_rAWrPBUnmQ_G4TYvnIEDifVQg4HWKhbqvFET2Yk',
      range: range,
    }).then(function(result) {
      console.log(result);
      var list = document.getElementById("boardResults");
      list.innerHTML = "";
      row = result.result.values[0];
      for (i = 1; i < row.length; i += 4) {
        var r = document.createElement("li");
        r.innerHTML = row[i+1] + " &lt" + row[i] + "&gt: <br>Score: " + row[i+2]  + "<br>Words found: " + row[i+3];
        list.appendChild(r);
      }
      document.getElementById("allWords").innerHTML = szk.boardData.words.join(", ");
  });
}

// kell
function updateSheet(range, value) {
  gapi.client.sheets.spreadsheets.values.update({
    spreadsheetId: '1u9w_rAWrPBUnmQ_G4TYvnIEDifVQg4HWKhbqvFET2Yk',
    range: range,
    valueInputOption: "RAW",
    resource: {
      values: [
        [value],
      ],
    }
  }).then(function(err, result) {
    if(err) {
      // Handle error
      console.log(err);
    } else {
      console.log('%d cells updated.', result.updatedCells);
    }
  });
}

// nem kell
function saveBoardResult() {
  unmarkAll();
  console.log("Saving...");
  var profile = getUserProfile();
  console.log(profile);

  var range = "A" + szk.sheetRow + ":Z" + szk.sheetRow;
  szk.emptyColIndex = -1;
  gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: '1u9w_rAWrPBUnmQ_G4TYvnIEDifVQg4HWKhbqvFET2Yk',
      range: range,
    }).then(function(result) {
      console.log(result);
      szk.emptyColIndex = result.result.values[0].length;
      console.log(szk.emptyColIndex);
  }).then(function() {
      var range = String.fromCharCode("A".charCodeAt(0) + szk.emptyColIndex) + szk.sheetRow;

      console.log(range);
      gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: '1u9w_rAWrPBUnmQ_G4TYvnIEDifVQg4HWKhbqvFET2Yk',
        range: range,
        valueInputOption: "RAW",
        resource: {
          values: [
            [profile.getEmail(), profile.getName(), szk.score,
             szk.foundWords.length == 0 ? " " : szk.foundWords.join(", ")],
          ],
        }
      }).then(function(err, result) {
        if(err) {
          // Handle error
          console.log(err);
        } else {
          console.log('%d cells updated.', result.updatedCells);
        }
      });
      makeUnplayable();
  });

}
