/*
@depends ../core/game.class.js
@depends ../objs/player.class.js
*/

var game = new Game(
	new TileGroup(null, {
		origin: new Point(0, 0),
		baseColor: "slategrey",
		tileSize: 25,
		spacing: 1,
		w: 40,
		h: 20
	}), Utils.loadGame() || Utils.DungeonGenerator.makeLevel(new Player(new Point(10,10)))
);
Utils.initUIButtons(game);

if (env === "dev") {
	Utils.exportObjs(Utils.exports);
} else if (env === "prod") {

} else {
	throw new TypeError("Invalid environment");
}

game.start();