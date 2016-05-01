/* @depends ../../abstract/action.class.js */
const ItemDropAction = class ItemDropAction extends Action {
	constructor(context, logger, inventorySlot){
		super(context, logger);
		this.inventorySlot = inventorySlot;
	}
	
	try(actor, time){
		let hasItem = !!actor.inventory[Utils.alphabetMap.indexOf(this.inventorySlot)];
		if(!hasItem){
			this.logger.log("No such item");
		}
		return time % 10 === 0 && hasItem && actor.isAlive;
	}
	
	do(actor){
		let index = Utils.alphabetMap.indexOf(this.inventorySlot),
			item = actor.inventory[index];
		actor.inventory.splice(index, 1);
		item.position = new Point(...actor.position.get);
		this.context.insert(item);
		this.logger.log(actor.flavorName + " dropped " + item.toString());
		return 10;
	}
};