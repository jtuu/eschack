/* @depends ../../abstract/action.class.js */
const ItemPickupAction = class ItemPickupAction extends Action {
	constructor(context, logger){
		super(context, logger);
	}

	try(actor, time){
		return time % 10 === 0 && actor.inventory.length < actor.stats.inventorySize && this.context.get(actor.position).contents.some(obj => obj instanceof Item) && actor.isAlive;
	}

	do(actor){
		let targetTile = this.context.get(actor.position),
			item = targetTile.contents.find(obj => obj instanceof Item);
		actor.inventory.push(item);
		targetTile.remove(item);
		if(this.logger){
			this.logger.log(actor.flavorName + " picked up " + item.toString(), "junk1");
		}
		return 10;
	}
};
