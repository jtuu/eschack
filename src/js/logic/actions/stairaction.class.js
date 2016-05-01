/* @depends ../../abstract/action.class.js */
const StairAction = class StairAction extends Action {
	constructor(context, logger){
		super(context, logger);
	}
	
	try(actor, time){
		let tile = this.context.get(actor.position),
			isStair = tile && tile.contents.some(obj => obj.constructor === Stair);
		if(!isStair){
			this.logger.log("No stairs here");
		}
		return time % 10 === 0 && isStair && actor.isAlive;
	}
	
	do(actor){
		let stair = this.context.get(actor.position).contents.find(obj => obj.constructor === Stair);
		actor.dungeonLevelChange = stair.direction;
		this.logger.log(actor.flavorName + " went " + stair.direction + " the stairs");
		return 10;
	}
};