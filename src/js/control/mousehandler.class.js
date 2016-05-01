/* @depends ../misc/utils.class.js */
//handle mouse stuff and examine cursor
const MouseHandler = class MouseHandler {
	constructor(board) {
		this.board = board;
		let cursor = document.createElement("div");
		cursor.id = "cursor";
		cursor.style.width = this.board.tileSize + "px";
		cursor.style.height = this.board.tileSize + "px";

		this.cursor = cursor;
		document.body.appendChild(this.cursor);
	}

	//set cursor position
	//input screen coordinates
	cursorFromScreen(point) {
		let [x, y] = Utils.screenToTiles(point, this.board.tileSize, this.board.spacing).get;
		this.cursor.style.top = y + "px";
		this.cursor.style.left = x + "px";
	}

	//input game coordinates
	cursorFromGame(point) {
		let [x, y] = Utils.gameToScreen(point, this.board.tileSize, this.board.spacing).get;
		this.cursor.style.top = y + "px";
		this.cursor.style.left = x  + "px";
	}
};