/*
@depends ../../abstract/action.class.js
*/
const ItemUnequipAction = class ItemUnequipAction extends Action {
	constructor(context, logger, equipmentSlot) {
		super(context, logger);
		this.equipmentSlot = equipmentSlot;
	}

	try (actor, time) {
		let keyIndex = Utils.alphabetMap.indexOf(this.equipmentSlot),
			hasItem = Object.keys(actor.equipment).filter(k => actor.equipment[k] !== null).some((k, i) => i === keyIndex);
		if (!hasItem) {
			this.logger.log("No such item");
			return false;
		}
		return time % 10 === 0 && hasItem && actor.isAlive;
	}

	do(actor) {
		let keyIndex = Utils.alphabetMap.indexOf(this.equipmentSlot),
			itemSlot = Object.keys(actor.equipment).filter(k => actor.equipment[k] !== null).find((k, i) => i === keyIndex),
			item = actor.equipment[itemSlot];

		if (item.canDrop) {
			actor.inventory.push(item);
		}
		actor.equipment[itemSlot] = null;

		this.logger.log(actor.flavorName + " unequipped " + item.toString(), "junk1");
		return 10;
	}
};
