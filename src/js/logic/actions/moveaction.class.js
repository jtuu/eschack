/* @depends ../../abstract/action.class.js */
//the act of moving something somewhere
//menu logic not done yet but maybe this could be used for menus too
const MoveAction = class MoveAction extends Action {
	constructor(context, logger, movement) {
		super(context, logger);
		this.movement = movement;
	}

	try (actor, time) {
		this.duration = actor.stats.moveSpeed;
		if(time % this.duration !== 0){
			return false;
		}
		//check if the point we're trying to move to is empty
		let target = new Point(...actor.position.get);
		target.moveBy(this.movement);
		let tile = this.context.get(target);
		return actor.cheatMode || ((tile.isEmpty || (tile && tile.top && !tile.top.isMoveBlocking)) && actor.isAlive);
	}

	do(actor) {
		actor.position.moveBy(this.movement);
		this.context.update(); //this is kinda important, should this even be here
		return this.duration;
	}
};
