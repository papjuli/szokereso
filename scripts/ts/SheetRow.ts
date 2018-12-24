class SheetRow {
    constructor(private board: Board, private users: UserState[]) {}

    public getBoard(): Board { return this.board; }
    public getUsers(): UserState[] { return this.users; }
}