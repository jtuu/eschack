/* @depends ../abstract/enemy.class.js */
const Redcap = class Redcap extends Enemy {
	constructor(position){
		super(position, null, null);
		this.bgColor = "hsl(66, 10%, 70%)";
		this.glyph = "^";
		this.color = "hsl(0, 80%, 60%)";
		
		this.stats.maxHP = 10;
		this.stats.HP = 10;
		this.stats.viewDistance = 7;
		this.stats.moveSpeed = 10;
		this.flavorName = "the redcap";
		this.flavor = "A malevolent murderous dwarf-like creature.";
		this.createLifebar();
		
		this.canWield = true;
		this.canWear = true;
	}
};