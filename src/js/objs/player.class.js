/* @depends ../abstract/creature.class.js */
const Player = class Player extends Creature {
	constructor(position, stats) {
		super(position, stats);
		this.actions = [];
		this.bgColor = "white";
		this.glyph = "@";
		this.color = "black";

		this.stats.maxHP = 50;
		this.stats.HP = 50;
		this.stats.viewDistance = 8;
		this.stats.moveSpeed = 10;
		//this.stats.inventorySize = 15;
		
		this.stats = stats || this.stats;
		
		this.equipment.head = new Armor("head", "Bronze helmet", 1);
		
		this.equipment.weapon = new Weapon("Blunt Dagger", 1, 5);

		this.lifebar = new Lifebar(this.id, "Hero", document.getElementById("info-container-player"), this.stats.maxHP, this.stats.HP);
		this.flavorName = "you";
		this.flavor = "Hi mom!";
		//todo: store username here?
	}
};