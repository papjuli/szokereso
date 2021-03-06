declare function loadAllRows(): any;
declare function updateSheet(range: string, value: string, callback: (response) => void): void;

class Sheet {
    private currentRow: SheetRow;
    private currentRowIndex: number;

    constructor(private app: App) {}

    // Reloads the current row, even if new rows have been added after it.
    // This is useful when a game has ended and someone may have already created
    // a new game but we still want to read others' results from the correct row.
    public reloadCurrentRow(): void {
        loadAllRows().then((response) => this.receiveData(this.currentRowIndex, response));
    }

    // Loads the last row, this is useful when we're done looking at others' results
    // and are ready to play the latest new game.
    public loadLastRow(): void {
        loadAllRows().then((response) => this.receiveData(-1, response));
    }

    private receiveData(rowIndex: number, response: any): void {
        var values = response.result.values;
        this.currentRowIndex = rowIndex == -1 ? values.length - 1 : rowIndex;
        let row = values[this.currentRowIndex];
        if (row.length == 0) return;
        let board = Board.fromJson(row[0]);
        let users = new Array<UserState>();
        for (let j = 1; j < row.length; ++j) {
            users.push(UserState.fromJson(row[j]));
        }
        this.currentRow = new SheetRow(board, users);
        this.app.notifyDataReady();
    }

    public currentBoard(): Board { return this.currentRow.getBoard(); }

    public getCurrentRowIndex(): number { return this.currentRowIndex; }

    public getCurrentGamesPlayers(reload: boolean): UserState[] {
        if (reload) {
            this.reloadCurrentRow();
        }
        return this.currentRow.getUsers();
    }

    public didIPlayOnCurrentBoard(): boolean {
        for (let user of this.currentRow.getUsers()) {
            if (user.email == myEmailAddress()) return true;
        }
        return false;
    }

    // Used when I am ready playing a board and want to store my results to the sheet.
    public addUserStateToCurrentBoard(user: UserState, callback: any): void {
        loadAllRows().then((response) => this.appendUserState(
            user, response, callback));
    }

    private appendUserState(user: UserState, response: any, callback: any): void {
        // The column to store into is the one one after the last column set, so eg. if two
        // players have already stored their results, then A123 contains the board, 
        // B123 and C123 contain the results of those players and we want to write to D123.
        var values = response.result.values;
        let rowIndex = this.currentRowIndex;
        let col = String.fromCharCode("A".charCodeAt(0) + values[rowIndex].length);
        console.log("games!" + col + String(1 + rowIndex));
        console.log(user.asJson());
        updateSheet("games!" + col + String(1 + rowIndex), user.asJson(), callback);
    }

    // Used when a new board is created.
    public addNewBoard(board: Board): void {
        loadAllRows().then((response) => this.appendNewBoard(
            board, response));
    }

    private appendNewBoard(board: Board, response: any): void {
        var values = response.result.values;
        this.currentRow = new SheetRow(board, []);
        this.currentRowIndex = values.length;
        updateSheet("games!A" + (values.length + 1), board.asJson(), null);
    }
}
