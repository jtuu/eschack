/* @depends ../abstract/item.class.js */
const Weapon = class Weapon extends Item{
	//todo: basespeed (weight?), special properties (cleave, reach)
	//stuff
	constructor(name, damage, speed) {
		super(null);
		this.slot = "weapon";
		this.damage = damage || 1;
		this.speed = speed || 10;
		this.name = name;
		
		this.glyph = "(";
		this.color = "red";
		this.bgColor = TILE_COLOR;
		this.flavorName = this.name;
	}
	
	toString(){
		return `${this.name} (${this.damage}, ${this.speed})`;
	}
};