enum AppState {
    // The start page shows when Szokereso is launching and we're still fetching
    // data from the sheet for the first time. On the start page the user can
    // click a button to 
    START_PAGE,

    // When the current row does not contain results from us, we can start playing.
    READY_TO_PLAY,

    // When we play, the current row still does not contain a result from us.
    // When we finish playing, either by clicking 'give up' or when the time
    // runs out, we store our result to the sheet and switch to finished playing.
    PLAYING,

    // When we are done playing, we show everybody's results for the current row.
    // The user can click a reload button to fetch new results and remain in this state
    // or click a 'new' button to go to 'ready to play' and either join a new current
    // or create a new one. (Or something like this, this last part is not fully
    // clear to me).
    FINISHED_PLAYING
}

class App {
    private sheet: Sheet;
    private state: AppState;
    private boardGenerator: BoardGenerator;
    private gameManager: GameManager;
    private user: UserState;

    constructor(vocabulary, gUserProfile) {
        this.boardGenerator = new BoardGenerator(vocabulary);
        this.sheet = new Sheet(this);
        this.sheet.loadLastRow();
        this.showStartPage();

        this.user = new UserState(gUserProfile.getName(), gUserProfile.getEmail());
        console.log(this.user);

        document.getElementById("createGameButton").addEventListener(
            "click", (event) => this.createGamePressed(this, event));
        document.getElementById("startGameButton").addEventListener(
            "click", (event) => this.startGamePressed(this, event));
        document.getElementById("playLastGameButton").addEventListener(
            "click", (event) => this.startGamePressed(this, event));
        document.getElementById("menuButton").addEventListener(
            "click", (event) => this.backToMenuPressed(this, event));
        document.getElementById("stopButton").addEventListener(
            "click", () => this.gameManager.endGame(this.gameManager));
        document.getElementById("rotateBoard").addEventListener(
            "click", () => this.gameManager.rotateBoard(this.gameManager));
            document.body.addEventListener(
            "touchmove", (event) => this.bodyTouchMove(this, event), {passive: false});

        console.log("App created");
    }

    // The sheet will notify us when data loading is ready through this function.
    // This allows us to render the appropriate ui elements on the current page.
    // This is particularly important for the start page, where we don't yet have
    // any row loaded when the start page is displayed.
    public notifyDataReady(): void {
        console.log("notifyDataReady");
        document.getElementById("lastGameIndex").innerHTML = String(this.sheet.getCurrentRowIndex());
        if (this.sheet.didIPlayOnCurrentBoard()) {
            this.showLastGameResults();
        } else {
            this.showJoinLastGameButton();
        }
    }

    private getValue(id: string): number {
        let elem = document.getElementById(id);
        if (!(elem instanceof HTMLSelectElement)) return;
        return Number(elem.options[elem.selectedIndex].value);
    }

    // This should be the event listener of the create game button.
    public createGamePressed(self: App, event: Event): void {
        console.log("App.createGamePressed");

        let board = self.boardGenerator.generateBoard(
            this.getValue("howBig"), this.getValue("howLong"), this.getValue("minimumScore"));
        self.sheet.addNewBoard(board);
        self.showReadyToPlay();
    }

    private showStartPage(): void {
        this.state = AppState.START_PAGE;
        // TODO change ui
        document.getElementById("menu").style.display = "block";
        document.getElementById("readyToPlay").style.display = "none";
        document.getElementById("results").style.display = "none";
        document.getElementById("game").style.display = "none";
    }

    private showLastGameResults(): void {
        // TODO
        document.getElementById("playLastGameButton").style.display = "none";
        document.getElementById("lastGameResults").style.display = "block";
        document.getElementById("lastGameResults").innerHTML = String(this.sheet.getCurrentGamesPlayers());
    }

    private showJoinLastGameButton(): void {
        // TODO
        console.log("showJoinLastGameButton");
        document.getElementById("playLastGameButton").style.display = "block";
        document.getElementById("lastGameResults").style.display = "none";
        document.getElementById("lastGameResults").innerHTML = "";
    }

    private showReadyToPlay(): void {
        this.state = AppState.READY_TO_PLAY;
        document.getElementById("readyToPlay").style.display = "block";
        document.getElementById("menu").style.display = "none";
    }

    // This should be the event lsitener of the start game button on the ready to play page.
    public startGamePressed(self: App, event: Event): void {
        console.log("App.startGamePressed");
        self.state = AppState.PLAYING;
        self.gameManager = new GameManager(self.sheet.currentBoard(), self);
        document.getElementById("board").classList.remove("unplayable"); // kell?
        document.getElementById("readyToPlay").style.display = "none";
        document.getElementById("menu").style.display = "none";
        document.getElementById("results").style.display = "none";
        document.getElementById("game").style.display = "block";
        document.getElementById("standing").style.display = "block";
        document.getElementById("timeLeftPar").style.display = "block";
        document.getElementById("timeIsUp").style.display = "none";
        document.getElementById("stopButton").style.display = "block";
    }

    // Called by the game manager, when the game ends (either by out of time or by clicking
    // the 'give up' button).
    public gameOver(): void {
        console.log("App.gameOver");
        this.state = AppState.FINISHED_PLAYING;
        this.gameManager.updateUser(this.user);
        this.sheet.addUserStateToCurrentBoard(this.user);
        document.getElementById("board").classList.add("unplayable"); // kell?
        document.getElementById("timeLeftPar").style.display = "none";
        document.getElementById("timeIsUp").style.display = "block";
        document.getElementById("results").style.display = "block";
        document.getElementById("stopButton").style.display = "none";
    }

    public backToMenuPressed(self: App, event: Event): void {
        console.log("App.backPressed");
        self.state = AppState.START_PAGE;
        self.gameManager = null;
        document.getElementById("readyToPlay").style.display = "none";
        document.getElementById("menu").style.display = "block";
        document.getElementById("results").style.display = "none";
        document.getElementById("game").style.display = "none";
        document.getElementById("standing").style.display = "none";
        document.getElementById("found").innerHTML = "";
    }

    public bodyTouchMove(self: App, event: Event): void {
        if (self.state == AppState.PLAYING) {
            event.preventDefault();
        }
    }
}