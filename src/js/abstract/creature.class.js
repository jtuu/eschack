/*
@depends ../core/globals.js
@depends ../abstract/gameobject.class.js
@depends ../misc/mixins.js
@depends ../objs/weapon.class.js
@depends ../objs/armor.class.js
 */
//any living dead undead whatever creature
const Creature = class Creature extends Hittable(MoveBlocking(GameObject)) {
	constructor(position, stats, weapon) {
		super(position);
		//actions actually contains arrays of actions
		this.actions = [];

		let self = this;
		this.stats = stats || {
			"maxHP": 3,
			"HP": 3,
			"viewDistance": 5,
			"moveSpeed": 10,
			"inventorySize": 5,
			"STR": 1,
			"INT": 1,
			"DEX": 1,
			"XP": 0,
			"XL": 1,
			get AC() {
				//add up the defence values of all equipped armor
				return Object.keys(self.equipment)
					.filter(k => self.equipment[k] && self.equipment[k].constructor === Armor)
					.reduce((p, c) => self.equipment[c].defence + p, 0);
			}
		};

		this.inventory = [];
		this.equipment = {
			"weapon": weapon || new Weapon("Fists"),
			"head": null,
			"body": null,
			"hands": null,
			"legs": null,
			"feet": null
		};

		this.flavorName = "creature";
		this.flavor = "It is mundane."; //flavor text used in examine

		this.killcount = 0;
	}

	//oh boy
	update(logger, time = 0) {

		let updateCount = 0,
			elapsedTime = 0;

		//go through all the possible actions given by actionmanager and
		//test their logic in the gameobjects context
		//they should already be in prioritized order so
		//we just use the first one that succeeds
		this.actions.forEach(proposals => {
			//actually they contain functions that create the action instances so yeah
			try {
				let chosen;

				proposals.some(p => {
					let action = p();
					if (action.try(this, time)) {
						chosen = action;
						return true;
					} else {
						return false;
					}
				});
				elapsedTime += chosen.do(this);
				updateCount++;
			} catch (err) {
				// console.warn("None of the proposed actions were suitable for " + this.constructor.name);
				// console.log(err);
			}
		});

		for (let i = 0; i < updateCount; i++) {
			this.actions.shift();
		}

		return elapsedTime;
	}

	gainXP(amount) {
		this.stats.XP += amount;

		if (this.stats.XP >= BASE_XP * Math.pow(this.stats.XL + 1, BASE_XP_GROWTH)) {
			return this.levelUp();
		}
		return false;
	}

	levelUp() {
		this.stats.XL++;
		let possibleStats = ["maxHP", "STR", "INT", "DEX"],
			chosenStat = possibleStats[Math.floor(Math.random() * possibleStats.length)];

		this.stats[chosenStat]++;
		if(chosenStat === "maxHP"){
			this.lifebar.set();
		}
		return chosenStat;
	}

	toString() {
		return `${this.type}<br>${this.stats.HP} HP<br>${this.flavor}<br>${this.equipment.weapon.damage} ATT`;
	}

	get items() {
		let items = this.inventory.concat(Object.values(this.equipment)).filter(v => v);
		return items;
	}
};
