/* @depends ../abstract/enemy.class.js */
const Jackalope = class Jackalope extends Enemy {
	constructor(position){
		super(position, null, new Weapon("Antlers", 2, 5));
		this.bgColor = "hsl(35, 25%, 65%)";
		this.glyph = "J";
		this.color = "hsl(35, 35%, 5%)";
		
		this.equipment.weapon.canDrop = false;
		
		this.stats.maxHP = 6;
		this.stats.HP = 6;
		this.stats.viewDistance = 7;
		this.stats.moveSpeed = 8;
		this.flavorName = "the jackalope";
		this.flavor = "A large agressive rabbit with antlers on its head.";
		this.createLifebar();
	}
};