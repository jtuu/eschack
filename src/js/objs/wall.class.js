/* @depends ../abstract/dungeonfeature.class.js */
//todo: create base class Inanimate or something
const Wall = class Wall extends VisionBlocking(MoveBlocking(DungeonFeature)) {
	constructor(position) {
		super(position);
		this.bgColor = "hsl(0,0%,15%)";
		this.glyph = "\u2589"; //some block character
		this.color = "hsl(0,0%,25%)";
		this.flavorName = "wall";
	}

	update() {
		return 0;
	}
};