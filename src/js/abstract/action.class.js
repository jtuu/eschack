//these contain the logic for actions but they will be used on the actor
//the context shouldnt be changed but the action can be reused
//even on different actors
//maybe these should be stored in a pool somewhere...?
const Action = class Action {
	constructor(context, logger) {
		if(this.constructor === Action){
			throw new TypeError("Action is abstract");
		}
		/*
		if (new.target === Action) {
			throw new TypeError("Action is abstract");
		}
		*/
		//the context or the state that the actor will act upon, eg. the board, a menu etc
		this.context = context;
		this.logger = logger;
	}

	//test if action can be done
	try (actor) {
		console.warn("Unimplemented method '" + arguments.callee + "' in " + this.constructor.name);
	}

	//execute action
	do(actor) {
		console.warn("Unimplemented method '" + arguments.callee + "' in " + this.constructor.name);
	}
};