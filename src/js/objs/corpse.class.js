/* @depends ../abstract/gameobject.class.js */
const Corpse = class Corpse extends GameObject {
	constructor(position){
		super(position);
		this.bgColor = "hsl(0,40%,40%)";
		this.glyph = "x"; //some block character
		this.color = "hsl(0,40%,10%)";
		this.flavorName = "corpse";
	}
	
	update(){
		return 0;
	}
};