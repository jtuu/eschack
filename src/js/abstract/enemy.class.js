/* @depends creature.class.js */
//maybe this should be abstract
const Enemy = class Enemy extends Creature {
	constructor(position, stats, weapon) {
		super(position, stats, weapon);
		this.actions = [];
		this.bgColor = "hsl(30, 30%, 45%)";
		this.glyph = "E";
		this.color = "white";

		this.stats.maxHP = 3;
		this.stats.HP = 3;
		this.stats.viewDistance = 7;
		this.stats.moveSpeed = 9;
		this.stats.XP = 1;

		this.stats = stats || this.stats;

		this.flavorName = "the enemy";
		this.flavor = "It has a fearsome visage.";
	}

	toString() {
		return this.type + "<br>Lvl. " + this.stats.XL + "<br>" + (this.noticed ? "It has noticed you." : "It has not noticed you.") + "<br>" + this.flavor;
	}

	createLifebar(){
		this.lifebar = new Lifebar(this.id, this.type, document.getElementById("info-container-other-life"), this.stats);
	}
};
