/* @depends ../abstract/item.class.js */
const Armor = class Armor extends Item{
	constructor(slot, name, defence){
		super(null);
		this.slot = slot;
		this.name = name;
		this.defence = defence;
		
		this.glyph = "[";
		this.color = "cyan";
		this.bgColor = TILE_COLOR;
		this.flavorName = this.name;
	}
	
	toString(){
		return `${this.name} (${this.defence})`;
	}
};