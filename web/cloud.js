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
    profile = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
    document.getElementById("whoami").innerHTML = profile.getEmail() + " " + profile.getName();
    loadBoardList();
});
}

function handleSignInClick(event) {
// Ideally the button should only show up after gapi.client.init finishes, so that this
// handler won't be called before OAuth is initialized.
gapi.auth2.getAuthInstance().signIn();
}

function handleSignOutClick(event) {
gapi.auth2.getAuthInstance().signOut();
}

function loadBoardList() {
gapi.client.sheets.spreadsheets.values.get({
  spreadsheetId: '1u9w_rAWrPBUnmQ_G4TYvnIEDifVQg4HWKhbqvFET2Yk',
  range: 'A1:A9999',
}).then(function(result) {
    console.log(result);
    rows = result.result.values;
    for (i=0; i<rows.length; ++i) {
      b = document.createElement("button");
      b.innerHTML = "Load board " + (i + 1);
      b.dataset.json = rows[i][0];
      b.dataset.sheetRow = i+1;
      b.addEventListener("click", setLettersFromDataset);
      document.getElementById("boardList").appendChild(b);
    }
});
}

function saveBoardResult() {
console.log("Saving...");
profile = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
console.log(profile);
gapi.client.sheets.spreadsheets.values.update({
  spreadsheetId: '1u9w_rAWrPBUnmQ_G4TYvnIEDifVQg4HWKhbqvFET2Yk',
  range: "B" + sheetRow,
  valueInputOption: "RAW",
  resource: {
    values: [
      [profile.getEmail(), profile.getName(), score, found_words.join()],
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
