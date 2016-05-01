/* @depends ../../abstract/action.class.js */
const ItemEquipAction = class ItemEquipAction extends Action {
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
		let inventoryIndex = Utils.alphabetMap.indexOf(this.inventorySlot),
			item = actor.inventory[inventoryIndex];
			
		//if already has something equipped in that slot
		//remove it into inventory
		//actually this should be an unequipaction
		if(actor.equipment[item.slot]){
			actor.inventory.push(actor.equipment[item.slot]);
			actor.equipment[item.slot] = null;
		}
		//splice item from inventory and put it in equipment
		item = actor.inventory.splice(inventoryIndex, 1)[0];
		actor.equipment[item.slot] = item;
		
		this.logger.log(actor.flavorName + " equipped " + item.toString());
		return 10;
	}
};