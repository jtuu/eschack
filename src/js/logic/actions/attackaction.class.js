/*
@depends ../../abstract/action.class.js
@depends ../objs/corpse.class.js
*/
const AttackAction = class AttackAction extends Action {
	constructor(context, logger, direction) {
		super(context, logger);
		this.direction = direction;
	}

	try (actor, time) {
		if (!actor.equipment.weapon) {
			actor.equipment.weapon = Utils.defaults.weapon();
		}
		this.duration = actor.equipment.weapon.speed;
		if (time % this.duration !== 0) {
			return false;
		}
		let target = new Point(...actor.position.get);
		target.moveBy(this.direction);

		let tile = this.context.get(target);
		return tile && tile.top && tile.top.isHittable && actor.isAlive;
	}

	do(actor) {
		let target = new Point(...actor.position.get);
		target.moveBy(this.direction);
		target = this.context.get(target);

		let damage = Utils.DamageCalculator.physical.melee(actor, target.top);

		if (this.logger) {
			this.logger.log(`${actor.flavorName} hit ${target.top.flavorName} for ${damage} damage with ${actor.equipment.weapon}`, (actor.constructor === Player ? "hit" : "damage"));
		}
		let died = target.top.takeDamage(damage, this.logger);
		if (died) {
			actor.killcount++;
			let leveledUpStat = actor.gainXP(target.top.stats.XP);
			if (leveledUpStat) {
				this.logger.log(actor.flavorName + " leveled up and gained a point in " + leveledUpStat, "hilight");
			}
			//drop all items and corpse
			target.top.items.forEach(item => {
				if (item.canDrop) {
					item.position = new Point(...target.top.position.get);
					target.add(item);
				}
			});
			target.add(new Corpse(new Point(...target.top.position.get)));
			target.remove(target.top);
		}
		this.context.update();
		return this.duration;
	}
};
