/* @depends ../core/point.class.js */
//basically any gameobject that takes up a whole tile is a GameObject
//this is the base class so uhhh let's not allow instantiation
const GameObject = class GameObject {
	constructor(position) {
		if(this.constructor === GameObject){
			throw new TypeError("GameObject is abstract");
		}
		/*
		if (new.target === GameObject) {
			throw new TypeError("GameObject is abstract");
		}
		*/
		this.id = objectCounter;
		objectCounter += 1;
		
		this.position = position;
		this.bgColor = "magenta";
		this.glyph = "\u26a0"; //cool warning sign character (?)
		this.color = "black";
		this.flavorName = "OBJ"; //name mainly used in log messages
		this.type = this.constructor.name; //used in identifying objects when loading from json
	}

	update() {
		console.warn("Unimplemented method 'update' in " + this.constructor.name);
	}

	get isAlive() {
		return this.hasOwnProperty("stats") ? this.stats.HP > 0 : true;
	}

	//recreate class from plain obj
	static from(obj) {
		let point = null;
		if(obj.position){
			point = new Point(obj.position.x, obj.position.y);
		}
		let newObj = new this(point, obj.stats);

		let exempt = ["lifebar", "position", "inventory", "equipment"];

		for (let key in obj) {
			if (!exempt.includes(key)) {
				newObj[key] = obj[key];
			}
		}
		newObj.inventory = [];
		for(let key in obj.inventory){
			newObj.inventory[key] = (eval(obj.inventory[key].type)).from(obj.inventory[key]);
		}
		newObj.equipment = [];
		for(let key in obj.equipment){
			newObj.equipment[key] = (eval(obj.equipment[key].type)).from(obj.equipment[key]);
		}
		
		return newObj;
	}

	toString() {
		return this.type;
	}
};