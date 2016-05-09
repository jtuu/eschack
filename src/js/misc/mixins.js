/* @depends ../ui/lifebar.class.js */
const MoveBlocking = Base => class extends Base{
	get isMoveBlocking(){
		return true;
	}
};
const VisionBlocking = Base => class extends Base{
	get isVisionBlocking(){
		return true;
	}
};

const Hittable = Base => class extends Base{
	takeDamage(damage, logger) {
		this.stats.HP -= damage;
		if (this.lifebar) this.lifebar.set(this.stats.HP);
		if (this.stats.HP <= 0) {
			this.die(logger);
			return true;
		}
		return false;
	}

	heal(amount){
		let effectiveHeal = (this.stats.INT / 2) + 1 | 0;
		if(this.stats.HP + effectiveHeal <= this.stats.maxHP && this.isAlive){
			this.stats.HP += effectiveHeal;
			if (this.lifebar) this.lifebar.set(this.stats.HP);
		}
	}

	die(logger) {
		if(logger)logger.log(this.flavorName + " died", "death");
		if(this.lifebar && this.type !== "Player")this.lifebar.remove();
	}

	get isHittable(){
		return true;
	}
};
