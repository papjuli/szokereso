enum GameState {
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

class GameStateManager {
    private sheet: Sheet;

    private state: GameState;

    private boardGenerator: BoardGenerator;

    private gameManager: GameManager;

    constructor() {
        // TODO: use real vocabulary
        this.boardGenerator = new BoardGenerator(["HELLO"]);
        this.sheet = new Sheet(this);
        this.sheet.loadLastRow();
        this.showStartPage();
    }

    // The sheet will notify us when data loading is ready through this function.
    // This allows us to render the appropriate ui elements on the current page.
    // This is particularly important for the start page, where we don't yet have
    // any row loaded when the start page is displayed.
    public notifyDataReady(): void {
        if (this.sheet.didIPlayOnCurrentBoard()) {
            this.showLastGameResultsButton();
        } else {
            this.showJoinLastGameButton();
        }
    }

    // This should be the event listener of the create game button.
    public createGamePressed(event: Event): void {
        let board = this.boardGenerator.generateBoard(3, 300, 30);
        this.sheet.addNewBoard(board);
        this.showReadyToPlay();
    }

    private showStartPage(): void {
        this.state = GameState.START_PAGE;
        // TODO change ui
    }

    private showLastGameResultsButton(): void {
        // TODO
    }

    private showJoinLastGameButton(): void {
        // TODO
    }

    private showReadyToPlay(): void {
        this.state = GameState.READY_TO_PLAY;
        // TODO change ui
        // 
        // Do this, with the correct id, to install the correct event listener.
        // document.getElementById("startGameButton").addEventListener("onclick", this.startGamePressed);
    }

    // This should be the event lsitener of the start game button on the ready to play page.
    public startGamePressed(event: Event): void {
        this.state = GameState.PLAYING;
        this.gameManager = new GameManager(this.sheet.currentBoard(), this);
        // TODO change ui
    }

    // Called by the game manager, when the game ends (either by out of time or by clicking
    // the 'give up' button).
    public gameOver(): void {
        this.state = GameState.FINISHED_PLAYING;
        // TODO change ui
    }
}