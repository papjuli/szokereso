declare function loadAllRows(callback: any): any;
declare function updateSheet(range: string, value: string): void;

class Sheet {
    private currentRow: SheetRow;
    private currentRowIndex: number;

    constructor(private manager: GameStateManager) {}

    // Reloads the current row, even if new rows have been added after it.
    // This is useful when a game has ended and someone may have already created
    // a new game but we still want to read others' results from the correct row.
    public reloadCurrentRow(): void {
        loadAllRows((values) => this.receiveData(this.currentRowIndex, values));
    }

    // Loads the last row, this is useful when we're done looking at others' results
    // and are ready to play the latest new game.
    public loadLastRow(): void {
        loadAllRows((values) => this.receiveData(-1, values));
    }

    private receiveData(rowIndex: number, values: any): void {
        this.currentRowIndex = rowIndex == -1 ? values.length() - 1 : rowIndex;
        let row = values[rowIndex];
        if (row.length == 0) return;
        let board = Board.fromJson(row[0]);
        let users = new Array<UserState>();
        for (let j = 1; j < row.length; ++j) {
            users.push(UserState.fromJson(row[j]));
        }
        this.currentRow = new SheetRow(board, users);
        this.manager.notifyDataReady();
    }

    public currentBoard(): Board { return this.currentRow.getBoard(); }

    public didIPlayOnCurrentBoard(): boolean {
        for (let user of this.currentRow.getUsers()) {
            if (user.email == myEmailAddress()) return true;
        }
        return false;
    }

    // Used when I am ready playing a board and want to store my results to the sheet.
    public addUserStateToCurrentBoard(user: UserState): void {
        loadAllRows((values) => this.appendUserState(this.currentRowIndex, user, values));
    }

    private appendUserState(rowIndex: number, user: UserState, values: any): void {
        // The column to store into is the one one after the last column set, so eg. if two
        // players have already stored their results, then A123 contains the board, 
        // B123 and C123 contain the results of those players and we want to write to D123.
        let col = String.fromCharCode("A".charCodeAt(0) + values[rowIndex].length + 1);
        updateSheet(col + String(1 + rowIndex), user.asJson());
    }

    // Used when a new board is created.
    public addNewBoard(board: Board): void {
        loadAllRows((values) => this.appendNewBoard(board, values));
    }

    private appendNewBoard(board: Board, values: any): void {
        this.currentRowIndex = values.length;
        this.currentRow = new SheetRow(board, []);
        updateSheet("A" + (1 + this.currentRowIndex), board.asJson());
    }
}