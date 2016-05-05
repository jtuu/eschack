/* @depends ../../abstract/action.class.js */
//doesnt do anything
const NullAction = class NullAction extends Action {
	constructor(context, logger) {
		super(context, logger);
	}

	try (actor, time) {
		return time % 10 === 0;
	}

	do(actor) {
		actor.heal(1);
		return 10;
	}
};
