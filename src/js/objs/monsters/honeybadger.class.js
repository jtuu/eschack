/* @depends ../abstract/enemy.class.js */
const Honeybadger = class Honeybadger extends Enemy {
	constructor(position){
		super(position, null, new Weapon("Claws", 4, 11));
		this.bgColor = "hsl(25, 5%, 10%)";
		this.glyph = "B";
		this.color = "hsl(5, 5%, 90%)";
		
		this.equipment.weapon.canDrop = false;
		
		this.stats.maxHP = 10;
		this.stats.HP = 10;
		this.stats.viewDistance = 7;
		this.stats.moveSpeed = 10;
		this.flavorName = "the honeybadger";
		this.flavor = "Notorious for their ferocity.";
		this.createLifebar();
	}
};