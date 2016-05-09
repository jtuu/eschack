/* @depends ../../abstract/action.class.js */
const RestAction = class RestAction extends Action {
	constructor(context, logger) {
		super(context, logger);
	}

	try (actor, time){
		return time % 10 === 0;
	}

	do(actor) {
		if (actor.isHittable) {
			actor.heal(1);
		};
		return 10;
	}
};
