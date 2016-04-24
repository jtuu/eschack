//Object.values polyfill
if (!Object.values) {
	Object.values = obj => Object.keys(obj).map(key => obj[key]);
}

(function(global) {
	"use strict";

	//should these be scopewide?
	const env = "prod",
		TICK = 1,
		saveName = "eschack_save",
		mainCanvas = document.getElementById("canvas-main"),
		secondCanvas = document.getElementById("canvas-second"),
		w = 1040,
		h = 520;
	mainCanvas.width = w;
	mainCanvas.height = h;
	secondCanvas.width = w;
	secondCanvas.height = h;
	const mainCtx = mainCanvas.getContext("2d"),
		secondCtx = secondCanvas.getContext("2d");
	mainCtx.font = "20px Consolas";
	mainCtx.textAlign = "center";

	let objectCounter = 0;

	//just a xy point
	const Point = class Point {
		constructor(x, y) {
			this.x = x;
			this.y = y;
		}

		//set values from array input
		set(arr) {
			this.x = arr[0];
			this.y = arr[1];
		}

		//get get get get got got got got
		//return xy as array
		get get() {
			return [this.x, this.y];
		}

		//relative move
		moveBy(vector) {
			let [x, y] = vector.get;
			this.x += x;
			this.y += y;
		}

		//get manhattan distance vector between two points
		static distance(point1, point2) {
			return new Vector(
				point2.x - point1.x,
				point2.y - point1.y
			);
		}

		//compare two points
		static equal(point1, point2) {
			return point1.x === point2.x && point1.y === point2.y;
		}
		
		//check if point is inside given bounds
		in(bounds){
			return this.x >= bounds.x && this.x <= bounds.x + bounds.w && this.y >= bounds.y && this.y <= bounds.y + bounds.h;
		}
	};

	const Vector = class Vector {
		constructor(u, v) {
			//if no arguments, use random values in [-1, 0, 1]
			this.u = isNaN(u) ? Math.sign(Math.random() * 10 - 5) : u;
			this.v = isNaN(v) ? Math.sign(Math.random() * 10 - 5) : v;
		}

		set(arr) {
			this.u = arr[0];
			this.v = arr[1];
		}

		get get() {
			return [this.u, this.v];
		}

		//basically this just sets the larger
		//absolute value to 1 and the smaller to 0
		reduce() {
			let vals = this.get;
			let absmax = Math.max.apply(null, vals.map(Math.abs));
			this.set(vals.map(v => Math.round(v / absmax)));
		}
	};

	//tiles have constant positions and they contain gameobjects
	//they live in TileGroups
	//perhaps this should extend GameObject?
	const Tile = class Tile {
		constructor(point, ...contents) {
			this.position = point;
			this.contents = [];
		}

		//check if tile has anything in it
		get isEmpty() {
			return this.contents.length === 0;
		}

		//add object to tiles container
		add(obj) {
			if (!obj instanceof GameObject) throw new TypeError("Added object must be of type GameObject.");
			if(obj.isMoveBlocking){
				this.contents.unshift(obj);
			}else{
				this.contents.push(obj);
			}
		}

		//remove from tiles container
		remove(obj) {
			let index = this.contents.indexOf(obj);
			if(index > -1){
				this.contents.splice(index, 1);
				return true;
			}
			return false;
		}

		//get the first object in container
		get top() {
			return this.contents[0];
		}

		//remove everything from container
		empty() {
			this.contents = [];
		}

		//get all contents
		get get() {
			return this.contents;
		}

		toString() {
			return "Floor";
		}
	};

	//board, level, grid, matrix... w/e
	//we're calling it a TileGroup now!
	//it's the thing where tiles exist
	//empty cells are null while invalid cells are ofc undefined
	//todo: use some kind of EmptyTile object instead of null?
	const TileGroup = class TileGroup {
		constructor(matrix, options) {

			//set all options to props
			//kinda unsafe lol
			for (let key in options) {
				this[key] = options[key];
			}

			//check if matrix was given or do we need to generate one
			if (matrix) {
				this.matrix = matrix;
				this.w = this.matrix[0].length;
				this.h = this.matrix.length;
			} else {
				this.matrix = [];
				for (let y = 0; y < this.h; y++) {
					this.matrix[y] = [];
					for (let x = 0; x < this.w; x++) {
						this.matrix[y][x] = new Tile(new Point(x, y));
					}
				}
			}

			//padding and shifting
			//basically this just translates the matrix to "global" coords
			//padding adds empty entries to the arrays
			//shifting shifts them
			if (this.origin.x >= 0) {
				//pad x
				this.matrix.forEach((row, y) => this.matrix[y] = Array(this.origin.x).concat(this.matrix[y]));
			} else {
				//shift x
				this.matrix.forEach((row, y) => {
					for (let i = 0; i < -this.origin.x; i++) {
						this.matrix[y].shift();
					}
				});
			}
			if (this.origin.y >= 0) {
				//pad y
				this.matrix = Array(this.origin.y).concat(this.matrix);
			} else {
				//shift y
				for (let i = 0; i < -this.origin.y; i++) {
					this.matrix.shift();
				}
			}

			//some props require defaults
			this.baseColor = this.baseColor || "slategrey";
			this.tileSize = this.tileSize || 25;
			this.spacing = this.spacing || 1;
		}

		//look up each cell and update gameobject positions in tiles
		update() {
			this.matrix.forEach((row, y) => row.forEach((tile, x) => {
				if (tile && !tile.isEmpty) {
					let temp = tile.top;
					tile.contents.shift();
					this.insert(temp);
				}
			}));
		}

		//insert gameobject
		insert(obj) {
			let [x, y] = obj.position.get;
			if (this.has(obj.position)) {
				this.matrix[y][x].add(obj);
			}
		}

		//returns the real coordinates and size of the matrix
		get bounds() {
			return {
				x: this.origin.x * (this.tileSize + this.spacing),
				y: this.origin.y * (this.tileSize + this.spacing),
				w: this.w * (this.tileSize + this.spacing) - this.spacing,
				h: this.h * (this.tileSize + this.spacing) - this.spacing
			};
		}

		//remove gameobject
		remove(obj) {
			let [x, y] = obj.position.get;
			if (this.has(obj.position)) {
				this.matrix[y][x].remove(obj);
			}
		}

		//turn everything into null
		//is this needed?
		//does this even work?
		clear() {
			this.matrix.forEach(row => row.forEach(tile => tile.empty()));
		}

		//check if point exists in matrix
		has(point) {
			let [x, y] = point.get;
			return (!!this.matrix[y] && !!this.matrix[y][x]);
		}

		//get tile at point
		get(point) {
			let [x, y] = point.get;
			return this.has(point) ? this.matrix[y][x] : undefined;
		}

		//go through matrix and draw each cell
		draw() {
			this.matrix.forEach((row, y) => row.forEach((tile, x) => {
				if (tile) {
					let [tx, ty] = tile.position.get;
					if (tile.isEmpty) {
						//default
						mainCtx.fillStyle = this.baseColor;
						mainCtx.fillRect(
							tx * (this.tileSize + this.spacing),
							ty * (this.tileSize + this.spacing),
							this.tileSize,
							this.tileSize
						);
					} else {
						//draw gameobject
						mainCtx.fillStyle = tile.top.bgColor;
						mainCtx.fillRect(
							tx * (this.tileSize + this.spacing),
							ty * (this.tileSize + this.spacing),
							this.tileSize,
							this.tileSize
						);
						mainCtx.fillStyle = tile.top.color;
						mainCtx.fillText(
							tile.top.glyph,
							tx * (this.tileSize + this.spacing) + this.tileSize / 2,
							ty * (this.tileSize + this.spacing) + this.tileSize / 1.5
						);
					}
				}
			}));
		}
	};

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
			let newObj = new this(new Point(obj.position.x, obj.position.y), obj.stats);

			let exempt = ["lifebar", "position"];

			for (let key in obj) {
				if (!exempt.includes(key)) {
					newObj[key] = obj[key];
				}
			}
			return newObj;
		}

		toString() {
			return this.type;
		}
	};
	
	const MoveBlocking = Base => class extends Base{
		get isMoveBlocking(){
			return true;
		}
	};
	const VisionBlocking = Base => class extends Base{
		get isVisionBlocking(){
			return true;
		}
	};
	
	const Hittable = Base => class extends Base{
		takeDamage(damage, logger) {
			this.stats.HP -= damage;
			if (this.lifebar) this.lifebar.set(this.stats.HP);
			if (this.stats.HP <= 0) {
				this.die(logger);
				return true;
			}
			return false;
		}
		
		die(logger) {
			if(logger)logger.log(this.flavorName + " died", "death");
			if(this.lifebar)this.lifebar.remove();
		}
		
		get isHittable(){
			return true;
		}
	};

	//todo: create base class Inanimate or something
	const Wall = class Wall extends VisionBlocking(MoveBlocking(GameObject)) {
		constructor(position) {
			super(position);
			this.bgColor = "hsl(0,0%,15%)";
			this.glyph = "\u2589"; //some block character
			this.color = "hsl(0,0%,25%)";
			this.flavorName = "wall";
		}

		update() {
			return 0;
		}
	};


	//any living dead undead whatever creature
	const Creature = class Creature extends Hittable(MoveBlocking(GameObject)) {
		constructor(position, stats, weapon) {
			super(position);
			//actions actually contains arrays of actions
			this.actions = [];

			this.stats = stats || {
				"maxHP": 3,
				"HP": 3,
				"viewDistance": 5,
				"moveSpeed": 10,
				"inventorySize": 5
			};
			this.weapon = weapon || new Weapon("Claws");
			this.inventory = [this.weapon];

			this.flavorName = "creature";
			this.flavor = "It is mundane."; //flavor text used in examine
		}

		//oh boy
		update(logger, time = 0) {

			let updateCount = 0,
				elapsedTime = 0;
		
			//go through all the possible actions given by actionmanager and
			//test their logic in the gameobjects context
			//they should already be in prioritized order so
			//we just use the first one that succeeds
			this.actions.forEach(proposals => {
				//actually they contain functions that create the action instances so yeah
				try {
					let chosen;
					
					proposals.some(p => {
						let action = p();
						if(action.try(this, time)){
							chosen = action;
							return true;
						}else{
							return false;
						}
					});
					elapsedTime += chosen.do(this);
					updateCount++;
				} catch (err) {
					//console.warn("None of the proposed actions were suitable for " + this.constructor.name);
					//console.log(err);
				}
			});
			
			for(let i = 0; i < updateCount; i++){
				this.actions.shift();
			}

			return elapsedTime;
		}

		toString() {
			return this.type + "<br>" + this.stats.HP + " HP<br>" + this.flavor + "<br>" + this.weapon.damage + " ATT";
		}
	};

	const Player = class Player extends Creature {
		constructor(position, stats) {
			super(position, stats, new Weapon("Dagger", 1, 5));
			this.actions = [];
			this.bgColor = "white";
			this.glyph = "@";
			this.color = "black";

			this.stats.maxHP = 50;
			this.stats.HP = 50;
			this.stats.viewDistance = 8;
			this.stats.moveSpeed = 10;
			//this.stats.inventorySize = 15;
			
			this.stats = stats || this.stats;

			this.lifebar = new Lifebar(this.id, "Hero", document.getElementById("info-container-player"), this.stats.maxHP, this.stats.HP);
			this.flavorName = "you";
			this.flavor = "Hi mom!";
			//todo: store username here?
		}
	};

	//maybe this should be abstract
	const Enemy = class Enemy extends Creature {
		constructor(position, stats) {
			super(position, stats, new Weapon("Claws", 2, 10));
			this.actions = [];
			this.bgColor = "hsl(30, 30%, 45%)";
			this.glyph = "E";
			this.color = "white";

			this.stats.maxHP = 3;
			this.stats.HP = 3;
			this.stats.viewDistance = 7;
			this.stats.moveSpeed = 9;
			
			this.stats = stats || this.stats;

			this.lifebar = new Lifebar(this.id, "Enemy", document.getElementById("info-container-other-life"), this.stats.maxHP, this.stats.HP);
			this.flavorName = "the enemy";
			this.flavor = "It has a fearsome visage.";
		}

		toString() {
			return this.type + "<br>" + this.stats.HP + " HP<br>" + this.flavor + "<br>" + this.weapon.damage + " ATT<br>" + (this.noticed ? "It has noticed you." : "It has not noticed you.");
		}
	};
	
	const Item = class Item extends GameObject{
		constructor(position){
			super(position);
		}
		
		update(){
			return true;
		}
	};
	
	const Weapon = class Weapon extends Item{
		//todo: basespeed (weight?), special properties (cleave, reach)
		//stuff
		constructor(name, damage, speed) {
			super(null);
			this.damage = damage || 1;
			this.speed = speed || 10;
			this.name = name;
		}
		
		toString(){
			return `${this.name} (${this.damage}, ${this.speed})`;
		}
	};

	//these contain the logic for actions but they will be used on the actor
	//the context shouldnt be changed but the action can be reused
	//even on different actors
	//maybe these should be stored in a pool somewhere...?
	const Action = class Action {
		constructor(context, logger) {
			if(this.constructor === GameObject){
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

	//doesnt do anything
	const NullAction = class NullAction extends Action {
		constructor(context, logger) {
			super(context, logger);
		}

		try (actor, time) {
			return time % 10 === 0;
		}

		do(actor) {
			return 10;
		}
	};

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
			return tile.isEmpty || (tile && tile.top && !tile.top.isMoveBlocking);
		}

		do(actor) {
			actor.position.moveBy(this.movement);
			this.context.update(); //this is kinda important, should this even be here
			return this.duration;
		}
	};

	const AttackAction = class AttackAction extends Action {
		constructor(context, logger, direction) {
			super(context, logger);
			this.direction = direction;
		}

		try (actor, time) {
			this.duration = actor.weapon.speed;
			if(time % this.duration !== 0){
				return false;
			}
			let target = new Point(...actor.position.get);
			target.moveBy(this.direction);
			
			let tile = this.context.get(target);
			return tile && tile.top && tile.top.isHittable;
		}

		do(actor) {
			let target = new Point(...actor.position.get);
			target.moveBy(this.direction);
			target = this.context.get(target);

			if(this.logger){
				this.logger.log(actor.flavorName + " hit " + target.top.flavorName + " for " + actor.weapon.damage + " damage with " + actor.weapon, (actor.constructor === Player ? "hit" : "damage"));
			}
			let died = target.top.takeDamage(actor.weapon.damage, this.logger);
			if (died) {
				this.context.remove(target.top);
			}
			this.context.update();
			return this.duration;
		}
	};
	
	const ItemPickupAction = class ItemPickupAction extends Action {
		constructor(context, logger){
			super(context, logger);
		}
		
		try(actor, time){
			return time % 10 === 0 && actor.inventory.length < actor.stats.inventorySize && this.context.get(actor.position).contents.some(obj => obj instanceof Item);
		}
		
		do(actor){
			let targetTile = this.context.get(actor.position),
				item = targetTile.contents.find(obj => obj instanceof Item);
			actor.inventory.push(item);
			targetTile.remove(item);
			if(this.logger){
				this.logger.log(actor.flavorName + " picked up " + item.flavorName);
			}
			return 10;
		}
	};

	const Lifebar = class Lifebar {
		constructor(id, name, container, max, value) {
			this.id = id;
			this.name = name;
			this.max = max;
			this.value = value || max;

			this.container = container;

			let label = document.createElement("label");
			label.setAttribute("for", "bar-lifebar-" + this.name + "-" + this.id);
			label.innerHTML = this.name;
			this.label = label;

			let bar = document.createElement("div");
			bar.className = "bar bar-lifebar";
			bar.id = "bar-lifebar-" + this.name + "-" + this.id;
			this.bar = bar;

			this.set();

			this.container.appendChild(label);
			this.label.appendChild(bar);
		}

		set(value) {
			if (!isNaN(value)) {
				this.value = value;
			}
			this.bar.setAttribute("data-content", this.value + "/" + this.max);

			//approximate visual size, range [0...100]
			//do we need more precision? is this too much precision?
			let sizeClass = "bar-size-" + Math.max(Math.floor(this.value / this.max * 100), 0);
			if (this.bar.className.match(/size/)) {
				this.bar.className = this.bar.className.replace(/bar-size-[0-9]{1,3}/, sizeClass);
			} else {
				this.bar.classList.add(sizeClass);
			}
		}

		setStyle(style) {
			let styles = {
				"hilight": "hilighted",
				"default": "default"
			};
			style = styles[style];
			if (style) {
				//remove other styles
				Object.values(styles).filter(v => v !== style).forEach(f => {
					this.bar.classList.remove(f);
					this.label.classList.remove(f);
				});

				this.bar.classList.add(style);
				this.label.classList.add(style);
			}
		}

		//remove from dom
		remove() {
			this.bar.remove();
			this.label.remove();
		}

		hide() {
			this.bar.style.display = "none";
			this.label.style.display = "none";
		}

		show() {
			this.bar.style.display = "";
			this.label.style.display = "";
		}
	};


	//handle key related stuff and i guess also some action mapping lol
	const KeyHandler = class KeyHandler {
		constructor() {
			this.keyCases = {
				87: "n",
				104: "n",

				65: "w",
				100: "w",

				83: "s",
				98: "s",

				68: "e",
				102: "e",

				105: "ne",
				99: "se",
				97: "sw",
				103: "nw",

				101: "c",
				
				"g": "pickup",
				71: "pickup"
			};

			this.actionMap = {
				"n": () => new Vector(0, -1),
				"w": () => new Vector(-1, 0),
				"s": () => new Vector(0, 1),
				"e": () => new Vector(1, 0),
				"ne": () => new Vector(1, -1),
				"se": () => new Vector(1, 1),
				"sw": () => new Vector(-1, 1),
				"nw": () => new Vector(-1, -1),
				"c": null,
				"pickup": "pickup"
			};
		}

		//input is a key or a keycode
		//returns action instruction
		get(key) {
			return this.actionMap[this.keyCases[key]];
		}
	};

	//does gamelogic stuff
	const ActionManager = class ActionManager {
		constructor(board, logger) {
			this.board = board;
			this.logger = logger;

			this.proposalMap = {};
			this.proposalMap[Vector] = [MoveAction, AttackAction, NullAction];
			this.proposalMap["pickup"] = [ItemPickupAction, NullAction];
		}

		//decide actor logic
		think(actor, player) {
			if (actor instanceof Enemy) {
				let fov = this.getFov(actor),
					instruction = null,
					shouldLog = this.getFov(player).has(actor.position);
				actor.target = fov.get(player.position);

				if (!actor.target) {
					//cant find target, move randomly
					instruction = new Vector();
					actor.noticed = false;
				} else if (Point.equal(actor.position, actor.target.position)) {
					//reached target, stopping
					actor.target = undefined;
					return;
				} else {
					//moving towards target
					let vector = Point.distance(actor.position, actor.target.position);
					vector.reduce();
					instruction = vector;
					if (!actor.noticed && shouldLog) this.logger.log(actor.flavorName + " noticed " + player.flavorName);
					actor.noticed = true;
				}

				let proposals = this.proposalMap[instruction.constructor];
				if (proposals) {
					let methods = proposals.map(action => () => new action(this.board, (shouldLog ? this.logger : null), instruction));
					actor.actions.push(methods);
				}
			}
		}

		getFov(actor) {
			if(!actor)return;
			let [ax, ay] = actor.position.get,
				range = actor.stats.viewDistance,
				quarters = {
					"ne": [],
					"se": [],
					"sw": [],
					"nw": []
				};

			for (let y = 0; y < range; y++) {
				for (let x = 0; x < range; x++) {
					if (!quarters.ne[y]) {
						quarters.ne[y] = [];
						quarters.se[y] = [];
						quarters.sw[y] = [];
						quarters.nw[y] = [];
					}
					quarters.ne[y][x] = this.board.get(new Point(ax + x, ay - range + y + 1));
					quarters.se[y][x] = this.board.get(new Point(ax + x, ay + y));
					quarters.sw[y][x] = this.board.get(new Point(ax - range + x + 1, ay + y));
					quarters.nw[y][x] = this.board.get(new Point(ax - range + x + 1, ay - range + y + 1));
				}
			}

			quarters.ne = Utils.rotate(Utils.beamcast(Utils.rotate(quarters.ne, 90)), -90);
			quarters.se = Utils.beamcast(quarters.se);
			quarters.sw = Utils.rotate(Utils.beamcast(Utils.rotate(quarters.sw, -90)), 90);
			quarters.nw = Utils.rotate(Utils.beamcast(Utils.rotate(quarters.nw, 180)), -180);

			return new TileGroup(Utils.mergeQuarters(quarters), {
				origin: new Point(ax - range + 1, ay - range + 1),
				baseColor: "hsla(244,3%,55%,1)",
				tileSize: 25,
				spacing: 1
			});
		}

		//what does this do again? give actions to actors? or just the player?
		delegateAction(actor, instruction) {
			if(!actor){
				return;
			}
			if (instruction) {
				let key = instruction;
				if(typeof instruction === "function"){
					instruction = instruction();
					key = instruction.constructor;
				}
				let proposals = this.proposalMap[key];
				if (proposals) {
					let methods = proposals.map(action => () => new action(this.board, this.logger, instruction));
					actor.actions.push(methods);
					return true;
				} else {
					console.warn("Could not delegate action: ", instruction, JSON.stringify(instruction));
				}
			} else if (instruction === null) {
				actor.actions.push([() => new NullAction(null, this.logger)]);
				return true;
			}
			return false;
		}
	};

	const Utils = class Utils {
		
		static get exports(){
			return {
				"instance": game,
				"Creature": Creature,
				"Player": Player,
				"GameObject": GameObject,
				"Point": Point,
				"Vector": Vector,
				"ActionManager": ActionManager,
				"TileGroup": TileGroup,
				"Utils": Utils,
				"Tile": Tile,
				"Wall": Wall
			};
		}
		
		static get alphabetMap(){
			return ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
		}

		static rotate(arr, angle) {
			if (angle === 90) {
				return Utils.transpose(arr.reverse());
			} else if (angle === -90) {
				return Utils.transpose(arr).reverse();
			} else if (angle === 180 || angle === -180) {
				return Utils.transpose(Utils.transpose(arr).reverse()).reverse();
			} else {
				console.warn("Invalid angle");
				return arr;
			}
		}

		//http://stackoverflow.com/a/4492703
		static transpose(arr) {
			var w = arr.length ? arr.length : 0,
				h = arr[0] instanceof Array ? arr[0].length : 0;

			if (h === 0 || w === 0) {
				return [];
			}

			var i, j, t = [];
			for (i = 0; i < h; i++) {
				t[i] = [];
				for (j = 0; j < w; j++) {
					t[i][j] = arr[j][i];
				}
			}
			return t;
		}

		//algorithm taken from here
		//http://www.roguebasin.com/index.php?title=Isaac_s_fast_beamcasting_LOS
		//and modified
		static beamcast(matrix) {
			let visible = [];
			for (let i = 0; i < matrix.length; i++) {
				visible[i] = Array.from(Array(matrix.length));
			}

			//0,0 will always be visible
			visible[0][0] = matrix[0][0];

			//check orthogonals
			let ox = 0;
			while (matrix[ox] && matrix[ox][0]) {
				visible[ox][0] = matrix[ox][0];
				if (matrix[ox][0].top && matrix[ox][0].top.isVisionBlocking) {
					break;
				}
				ox++;
			}
			let oy = 0;
			while (matrix[0] && matrix[0][oy]) {
				visible[0][oy] = matrix[0][oy];
				if (matrix[0][oy].top && matrix[0][oy].top.isVisionBlocking) {
					break;
				}
				oy++;
			}

			//beams
			for (let slope = 1, slopeCount = 31; slope <= slopeCount; slope++) {
				let v = slope,
					min = 0,
					max = slopeCount;
				for (let u = 0; min <= max; u++) {
					let y = v >> 5,
						x = u - y,
						cor = slopeCount + 1 - (v & slopeCount),
						needBreak = false;

					if (min < cor) {
						if (matrix[x] && matrix[x][y]) {
							visible[x][y] = matrix[x][y];
							if (matrix[x][y].top && matrix[x][y].top.isVisionBlocking) {
								min = cor;
								needBreak = true;
							}
						} else {
							min = cor;
							needBreak = true;
						}
					}
					if (max < cor) {
						if (matrix[x] && matrix[x][y]) {
							visible[x][y] = matrix[x][y];
							if (matrix[x][y].top && matrix[x][y].top.isVisionBlocking) {
								max = cor;
								needBreak = true;
							}
						} else {
							max = cor;
							needBreak = true;
						}
					}
					v += slope;
					if (needBreak) {
						break;
					}
				}
			}
			return visible;
		}

		static mergeQuarters(quarters) {
			//quarters.nw + quarters.ne
			//            +
			//quarters.sw + quarters.se

			let upper = quarters.nw.map((row, k) => {
				//pop last column of left because it is identical to the first column of right
				row.pop();

				//merge rows of left and right
				return row.concat(quarters.ne[k]);
			});

			let lower = quarters.sw.map((row, k) => {
				row.pop();
				return row.concat(quarters.se[k]);
			});

			//pop last row of upper because it is identical to the first row of lower
			upper.pop();

			//merge upper and lower
			return upper.concat(lower);
		}
		
		static saveGame(instance){
			let save = {};
			save.board = instance.board;
			save.player = instance.player;
			save.objs = instance.objs;

			save = LZString.compress(JSON.stringify(save));
			localStorage.setItem(saveName, save);
			console.log("Game saved");
		}
		
		static loadGame() {
			let save = JSON.parse(LZString.decompress(localStorage.getItem(saveName)) || null);

			if (save) {
				let objMap = {
					"Wall": Wall,
					"Creature": Creature,
					"Enemy": Enemy,
					"Player": Player
				};
				let data = [];
				data.push(new TileGroup(null, {
					origin: new Point(save.board.origin.x, save.board.origin.y),
					baseColor: save.board.baseColor,
					tileSize: save.board.tileSize,
					spacing: save.board.spacing,
					w: save.board.w,
					h: save.board.h
				}));

				let objs = [];
				save.objs.forEach(obj => {
					if (obj) {
						if (objMap[obj.type]) {
							objs[obj.id] = objMap[obj.type].from(obj);
						}
					}
				});
				data.push(objs);

				console.log("Savedata loaded");
				return new Game(...data);
			} else {
				console.log("No existing savedata found");
				return null;
			}
		}
		
		static deleteSave() {
			localStorage.removeItem(saveName);
			console.log("Savedata deleted");
		};
		
		//convert screen coordinates to game coordinates
		static screenToGame(point, tileSize, spacing){
			return new Point(Math.floor(point.x / (tileSize + spacing)), Math.floor(point.y / (tileSize + spacing)));
		}
		
		//convert game coordinates to screen coordinates
		static gameToScreen(point, tileSize, spacing){
			return new Point(point.x * (tileSize + spacing), point.y * (tileSize + spacing));
		}
		
		//convert screen coordinates to conform to tiles
		static screenToTiles(point, tileSize, spacing){
			return Utils.gameToScreen(Utils.screenToGame(point, tileSize, spacing), tileSize, spacing);
		}

		static exportObjs(exports) {
			for (let key in exports) {
				global[key] = exports[key];
			}
		}
		
	};

	//manages logging
	const LogboxManager = class LogboxManager {
		constructor(logbox, rowCount) {
			this.logbox = logbox;

			this.rowCount = rowCount;
			this.rows = [];
			this.messages = [];

			for (let i = 0; i < this.rowCount; i++) {
				let row = document.createElement("div");
				row.className = "logbox-row";
				row.id = "logbox-row-" + (i + 1);
				this.logbox.appendChild(row);
				this.rows.push(row);
			}
		}

		//this handles inserting new messages and moving old etc
		//type is the css class used
		log(text, type = "default") {
			text = text.charAt(0).toUpperCase() + text.slice(1);

			let msg = document.createElement("span");
			msg.className = "logmsg logmsg-" + type;
			msg.innerHTML = text;

			this.messages.push(msg);

			let target = this.rows.find(row => row.children.length === 0);

			if (target) {
				target.appendChild(msg);
			} else {
				this.rows[0].children[0].remove();
				this.rows.forEach((row, index) => {
					row.appendChild(this.messages[this.messages.length - (this.rowCount - index)]);
				});
			}
		}
	};
	
	const InventoryManager = class InventoryManager{
		constructor(inventoryBox, inventory){
			this.wrapper = inventoryBox;
			this.inventory = inventory;
			let container = document.createElement("div");
			container.style.padding = "10px";
			this.container = container;
			this.wrapper.appendChild(this.container);
		}
		
		update() {
			if (!!this.container.children.length) {
				Array.from(this.container.children).forEach(item => item.remove());
			}
			this.inventory.forEach((item, key) => {
				let ele = document.createElement("div");
				ele.innerHTML = Utils.alphabetMap[key] + " - " + item;
				this.container.appendChild(ele);
			});
		}
	};

	//handle mouse stuff and examine cursor
	const MouseHandler = class MouseHandler {
		constructor(board) {
			this.board = board;
			let cursor = document.createElement("div");
			cursor.id = "cursor";
			cursor.style.width = this.board.tileSize + "px";
			cursor.style.height = this.board.tileSize + "px";

			this.cursor = cursor;
			document.body.appendChild(this.cursor);
		}

		//set cursor position
		//input screen coordinates
		cursorFromScreen(point) {
			let [x, y] = Utils.screenToTiles(point, this.board.tileSize, this.board.spacing).get;
			this.cursor.style.top = y + "px";
			this.cursor.style.left = x + "px";
		}

		//input game coordinates
		cursorFromGame(point) {
			let [x, y] = Utils.gameToScreen(point, this.board.tileSize, this.board.spacing).get;
			this.cursor.style.top = y + "px";
			this.cursor.style.left = x  + "px";
		}
	};

	//the game
	const Game = class Game {
		constructor(board, objs) {
			
			this.logger = new LogboxManager(document.getElementById("logbox"), 10);

			this.time = 0;
			
			this.board = board;
			this.player = objs[0];
			this.objs = [];
			objs.forEach(obj => this.objs[obj.id] = obj);

			this.logic = new ActionManager(this.board, this.logger);

			this.keyHandler = new KeyHandler();
			document.addEventListener("keydown", e => {
				if (this.logic.delegateAction(this.player, this.keyHandler.get(e.keyCode))) {
					this.update();
				}
			});

			let miscOtherInfoContainer = document.getElementById("info-container-other-misc");
			
			this.examineContainer = document.createElement("div");
			this.examineContainer.style.padding = "10px";
			
			miscOtherInfoContainer.appendChild(this.examineContainer);

			//cleaned this up a bit but it's still not very nice
			this.mouseHandler = new MouseHandler(this.board);
			document.addEventListener("mousemove", e => {
				let bounds = this.board.bounds;
				let screenPoint = new Point(e.pageX, e.pageY);
				
				//mouse is inside game screen
				if (screenPoint.in(bounds)) {
					let fov = this.logic.getFov(this.player),
						gamePoint = Utils.screenToGame(screenPoint, this.board.tileSize, this.board.spacing);
						
					//set cursor position
					this.mouseHandler.cursorFromScreen(screenPoint);
						
					//if hovering over a tile that is seen
					if(fov && fov.has(gamePoint)){
						let targetTile = this.board.get(gamePoint);
						
						//if tile is not empty
						if (targetTile && targetTile.top) {
							//reset all lifebars styles
							this.objs.forEach(obj => {
								if (obj.lifebar) obj.lifebar.setStyle("default");
							});
							
							//set examine text
							this.examineContainer.innerHTML = targetTile.top;
							//highlight lifebar
							if (targetTile.top instanceof Creature) {
								targetTile.top.lifebar.setStyle("hilight");
							}
						} else {
							this.examineContainer.innerHTML = targetTile;
						}
					} else {
						//tile is not in fov
						this.examineContainer.innerHTML = "You can't see that";
					}
					//hovering over a lifebar
				} else if (e.target.classList.contains("bar-lifebar")) {
					//reset all lifebars styles
					this.objs.forEach(obj => {
						if (obj.lifebar) obj.lifebar.setStyle("default");
					});
					
					//get lifebars owner
					let id = e.target.id.match(/[0-9]+$/);
					let target = this.objs[Number(id)];

					//set cursor to lifebars owner
					if (target) {
						this.mouseHandler.cursorFromGame(target.position);
						this.examineContainer.innerHTML = target;
						target.lifebar.setStyle("hilight");
					}
				}
			});
			
			this.inventoryManager = new InventoryManager(document.getElementById("info-container-inventory"), this.player.inventory);
		}

		update() {
			let duration = this.player.update(this.logger);
			let tickCount = duration / TICK;
			
			//contains the total durations of each objs actions for this turn
			let objDurations = [];
			for(let i = 0; i < tickCount; i++){
				this.time += TICK;
				
				this.objs.forEach((obj, index) => {
					if(index === 0){
						return;
					}
					if(obj.isAlive){
						let duration = obj.update(this.logger, this.time + (objDurations[obj.id] || 0));
						if(duration > 0){
							//if action was excecuted we generate new ones and
							//forward the time for this obj
							this.logic.think(obj, this.player);
							objDurations[obj.id] = objDurations[obj.id] ? objDurations[obj.id] + duration : duration;
						}
						
						if(!obj.isAlive){
							this.board.remove(obj);
							delete this.objs[obj.id];
						}
					}else{
						this.board.remove(obj);
						delete this.objs[obj.id];
					}
				});
			}
			
			if(!this.player.isAlive){
				this.board.remove(this.player);
				delete this.player;
			}

			let fov = this.logic.getFov(this.player);
			
			if(fov){
				this.objs.forEach(obj => {
					if(obj.type === "Enemy"){
						if(fov.has(obj.position)){
							obj.lifebar.show();
						}else{
							obj.lifebar.hide();
						}
					}
				});
				mainCtx.clearRect(0, 0, w, h);
				fov.draw();
				secondCtx.drawImage(mainCanvas, 0, 0);
			}

			this.inventoryManager.update();
		}

		start() {
			document.getElementById("button-save").addEventListener("click", e => {
				e.stopPropagation();
				Utils.saveGame(this);
			});
			
			document.getElementById("button-delete").addEventListener("click", e => {
				e.stopPropagation();
				Utils.deleteSave();
			});
			
			this.logger.log("Hello and welcome", "hilight");
			this.objs.forEach(obj => {
				if (obj) {
					this.board.insert(obj);
				}
			});
			
			let fov = this.logic.getFov(this.player);
			
			this.objs.forEach(obj => {
				this.logic.think(obj, this.player);
				if(obj.type === "Enemy"){
					if(fov.has(obj.position)){
						obj.lifebar.show();
					}else{
						obj.lifebar.hide();
					}
				}
			});
			fov.draw();
			this.inventoryManager.update();
			
			document.getElementById("loader").remove();
		}
	};

	var game = Utils.loadGame() || new Game(
		new TileGroup(null, {
			origin: new Point(0, 0),
			baseColor: "slategrey",
			tileSize: 25,
			spacing: 1,
			w: 40,
			h: 20
		}), [
			new Player(new Point(18, 9)),
			new Item(new Point(18, 10)),
			new Wall(new Point(3,0)),
			new Wall(new Point(7,0)),
			new Wall(new Point(8,0)),
			new Wall(new Point(9,0)),
			new Wall(new Point(10,0)),
			new Wall(new Point(11,0)),
			new Wall(new Point(12,0)),
			new Wall(new Point(13,0)),
			new Wall(new Point(14,0)),
			new Wall(new Point(15,0)),
			new Wall(new Point(16,0)),
			new Wall(new Point(17,0)),
			new Enemy(new Point(18,0)),
			new Wall(new Point(22,0)),
			new Wall(new Point(23,0)),
			new Wall(new Point(27,0)),
			new Wall(new Point(28,0)),
			new Wall(new Point(29,0)),
			new Wall(new Point(30,0)),
			new Wall(new Point(31,0)),
			new Wall(new Point(32,0)),
			new Wall(new Point(33,0)),
			new Wall(new Point(34,0)),
			new Wall(new Point(35,0)),
			new Enemy(new Point(39,0)),
			new Wall(new Point(1,1)),
			new Wall(new Point(5,1)),
			new Wall(new Point(7,1)),
			new Wall(new Point(9,1)),
			new Wall(new Point(14,1)),
			new Wall(new Point(15,1)),
			new Wall(new Point(16,1)),
			new Wall(new Point(17,1)),
			new Wall(new Point(19,1)),
			new Wall(new Point(20,1)),
			new Wall(new Point(22,1)),
			new Wall(new Point(23,1)),
			new Wall(new Point(25,1)),
			new Wall(new Point(32,1)),
			new Wall(new Point(33,1)),
			new Enemy(new Point(1,2)),
			new Wall(new Point(3,2)),
			new Enemy(new Point(5,2)),
			new Wall(new Point(7,2)),
			new Wall(new Point(11,2)),
			new Wall(new Point(12,2)),
			new Enemy(new Point(24,2)),
			new Wall(new Point(25,2)),
			new Wall(new Point(27,2)),
			new Wall(new Point(28,2)),
			new Wall(new Point(30,2)),
			new Wall(new Point(35,2)),
			new Enemy(new Point(39,2)),
			new Wall(new Point(1,3)),
			new Wall(new Point(5,3)),
			new Wall(new Point(7,3)),
			new Wall(new Point(9,3)),
			new Wall(new Point(12,3)),
			new Wall(new Point(13,3)),
			new Wall(new Point(14,3)),
			new Wall(new Point(15,3)),
			new Wall(new Point(16,3)),
			new Wall(new Point(17,3)),
			new Wall(new Point(18,3)),
			new Wall(new Point(19,3)),
			new Wall(new Point(20,3)),
			new Wall(new Point(21,3)),
			new Wall(new Point(22,3)),
			new Wall(new Point(23,3)),
			new Wall(new Point(24,3)),
			new Wall(new Point(25,3)),
			new Wall(new Point(28,3)),
			new Wall(new Point(30,3)),
			new Wall(new Point(31,3)),
			new Wall(new Point(32,3)),
			new Wall(new Point(33,3)),
			new Wall(new Point(34,3)),
			new Wall(new Point(35,3)),
			new Wall(new Point(36,3)),
			new Wall(new Point(37,3)),
			new Wall(new Point(38,3)),
			new Wall(new Point(39,3)),
			new Wall(new Point(3,4)),
			new Wall(new Point(7,4)),
			new Wall(new Point(9,4)),
			new Wall(new Point(10,4)),
			new Wall(new Point(12,4)),
			new Wall(new Point(13,4)),
			new Wall(new Point(17,4)),
			new Enemy(new Point(22,4)),
			new Wall(new Point(24,4)),
			new Wall(new Point(25,4)),
			new Wall(new Point(26,4)),
			new Wall(new Point(28,4)),
			new Wall(new Point(33,4)),
			new Wall(new Point(1,5)),
			new Wall(new Point(5,5)),
			new Wall(new Point(13,5)),
			new Wall(new Point(15,5)),
			new Wall(new Point(17,5)),
			new Wall(new Point(19,5)),
			new Wall(new Point(21,5)),
			new Wall(new Point(22,5)),
			new Wall(new Point(24,5)),
			new Wall(new Point(25,5)),
			new Wall(new Point(30,5)),
			new Wall(new Point(31,5)),
			new Wall(new Point(33,5)),
			new Wall(new Point(35,5)),
			new Wall(new Point(37,5)),
			new Wall(new Point(38,5)),
			new Wall(new Point(7,6)),
			new Wall(new Point(8,6)),
			new Wall(new Point(9,6)),
			new Wall(new Point(10,6)),
			new Wall(new Point(11,6)),
			new Wall(new Point(13,6)),
			new Wall(new Point(15,6)),
			new Wall(new Point(17,6)),
			new Wall(new Point(19,6)),
			new Wall(new Point(21,6)),
			new Wall(new Point(22,6)),
			new Wall(new Point(24,6)),
			new Wall(new Point(27,6)),
			new Wall(new Point(28,6)),
			new Wall(new Point(33,6)),
			new Wall(new Point(38,6)),
			new Wall(new Point(0,7)),
			new Wall(new Point(1,7)),
			new Wall(new Point(2,7)),
			new Wall(new Point(3,7)),
			new Wall(new Point(4,7)),
			new Enemy(new Point(14,7)),
			new Wall(new Point(15,7)),
			new Wall(new Point(21,7)),
			new Wall(new Point(22,7)),
			new Wall(new Point(26,7)),
			new Wall(new Point(27,7)),
			new Wall(new Point(28,7)),
			new Wall(new Point(29,7)),
			new Wall(new Point(30,7)),
			new Wall(new Point(31,7)),
			new Wall(new Point(33,7)),
			new Wall(new Point(34,7)),
			new Wall(new Point(35,7)),
			new Wall(new Point(36,7)),
			new Wall(new Point(38,7)),
			new Wall(new Point(4,8)),
			new Wall(new Point(5,8)),
			new Wall(new Point(7,8)),
			new Wall(new Point(8,8)),
			new Wall(new Point(9,8)),
			new Wall(new Point(11,8)),
			new Wall(new Point(12,8)),
			new Wall(new Point(13,8)),
			new Wall(new Point(14,8)),
			new Wall(new Point(15,8)),
			new Wall(new Point(21,8)),
			new Wall(new Point(22,8)),
			new Wall(new Point(24,8)),
			new Wall(new Point(25,8)),
			new Wall(new Point(26,8)),
			new Wall(new Point(27,8)),
			new Wall(new Point(28,8)),
			new Wall(new Point(29,8)),
			new Wall(new Point(30,8)),
			new Wall(new Point(31,8)),
			new Enemy(new Point(33,8)),
			new Wall(new Point(36,8)),
			new Wall(new Point(38,8)),
			new Enemy(new Point(2,9)),
			new Wall(new Point(5,9)),
			new Wall(new Point(31,9)),
			new Wall(new Point(33,9)),
			new Wall(new Point(34,9)),
			new Wall(new Point(36,9)),
			new Wall(new Point(38,9)),
			new Wall(new Point(4,10)),
			new Wall(new Point(5,10)),
			new Wall(new Point(7,10)),
			new Wall(new Point(8,10)),
			new Wall(new Point(9,10)),
			new Wall(new Point(10,10)),
			new Wall(new Point(11,10)),
			new Wall(new Point(12,10)),
			new Wall(new Point(13,10)),
			new Wall(new Point(15,10)),
			new Wall(new Point(21,10)),
			new Wall(new Point(22,10)),
			new Wall(new Point(24,10)),
			new Wall(new Point(26,10)),
			new Wall(new Point(27,10)),
			new Wall(new Point(29,10)),
			new Wall(new Point(33,10)),
			new Wall(new Point(34,10)),
			new Wall(new Point(36,10)),
			new Wall(new Point(38,10)),
			new Wall(new Point(1,11)),
			new Wall(new Point(2,11)),
			new Wall(new Point(3,11)),
			new Wall(new Point(4,11)),
			new Wall(new Point(7,11)),
			new Enemy(new Point(10,11)),
			new Wall(new Point(11,11)),
			new Wall(new Point(12,11)),
			new Wall(new Point(15,11)),
			new Wall(new Point(21,11)),
			new Wall(new Point(24,11)),
			new Wall(new Point(26,11)),
			new Wall(new Point(27,11)),
			new Wall(new Point(29,11)),
			new Wall(new Point(31,11)),
			new Wall(new Point(32,11)),
			new Wall(new Point(33,11)),
			new Wall(new Point(34,11)),
			new Wall(new Point(38,11)),
			new Wall(new Point(1,12)),
			new Wall(new Point(6,12)),
			new Wall(new Point(7,12)),
			new Wall(new Point(8,12)),
			new Wall(new Point(10,12)),
			new Wall(new Point(11,12)),
			new Wall(new Point(14,12)),
			new Wall(new Point(15,12)),
			new Wall(new Point(16,12)),
			new Wall(new Point(17,12)),
			new Wall(new Point(19,12)),
			new Wall(new Point(20,12)),
			new Wall(new Point(21,12)),
			new Wall(new Point(23,12)),
			new Wall(new Point(24,12)),
			new Wall(new Point(26,12)),
			new Wall(new Point(29,12)),
			new Wall(new Point(36,12)),
			new Wall(new Point(37,12)),
			new Wall(new Point(38,12)),
			new Wall(new Point(1,13)),
			new Wall(new Point(2,13)),
			new Wall(new Point(3,13)),
			new Wall(new Point(4,13)),
			new Wall(new Point(5,13)),
			new Wall(new Point(6,13)),
			new Wall(new Point(13,13)),
			new Wall(new Point(14,13)),
			new Wall(new Point(15,13)),
			new Wall(new Point(16,13)),
			new Wall(new Point(17,13)),
			new Wall(new Point(19,13)),
			new Wall(new Point(23,13)),
			new Wall(new Point(24,13)),
			new Enemy(new Point(25,13)),
			new Wall(new Point(28,13)),
			new Wall(new Point(29,13)),
			new Wall(new Point(31,13)),
			new Wall(new Point(32,13)),
			new Wall(new Point(33,13)),
			new Wall(new Point(34,13)),
			new Wall(new Point(36,13)),
			new Wall(new Point(2,14)),
			new Wall(new Point(3,14)),
			new Wall(new Point(5,14)),
			new Wall(new Point(6,14)),
			new Wall(new Point(8,14)),
			new Wall(new Point(10,14)),
			new Wall(new Point(11,14)),
			new Wall(new Point(13,14)),
			new Wall(new Point(14,14)),
			new Wall(new Point(15,14)),
			new Wall(new Point(16,14)),
			new Wall(new Point(19,14)),
			new Wall(new Point(21,14)),
			new Wall(new Point(22,14)),
			new Wall(new Point(23,14)),
			new Wall(new Point(24,14)),
			new Wall(new Point(25,14)),
			new Wall(new Point(27,14)),
			new Wall(new Point(28,14)),
			new Wall(new Point(29,14)),
			new Wall(new Point(31,14)),
			new Wall(new Point(32,14)),
			new Wall(new Point(33,14)),
			new Wall(new Point(34,14)),
			new Wall(new Point(38,14)),
			new Wall(new Point(0,15)),
			new Wall(new Point(3,15)),
			new Wall(new Point(10,15)),
			new Wall(new Point(11,15)),
			new Wall(new Point(13,15)),
			new Wall(new Point(14,15)),
			new Wall(new Point(15,15)),
			new Wall(new Point(18,15)),
			new Wall(new Point(19,15)),
			new Wall(new Point(27,15)),
			new Wall(new Point(34,15)),
			new Wall(new Point(36,15)),
			new Wall(new Point(37,15)),
			new Wall(new Point(38,15)),
			new Wall(new Point(0,16)),
			new Wall(new Point(1,16)),
			new Wall(new Point(3,16)),
			new Wall(new Point(5,16)),
			new Wall(new Point(6,16)),
			new Wall(new Point(8,16)),
			new Wall(new Point(10,16)),
			new Wall(new Point(11,16)),
			new Wall(new Point(17,16)),
			new Wall(new Point(18,16)),
			new Wall(new Point(19,16)),
			new Wall(new Point(21,16)),
			new Wall(new Point(22,16)),
			new Wall(new Point(23,16)),
			new Wall(new Point(24,16)),
			new Wall(new Point(25,16)),
			new Wall(new Point(29,16)),
			new Wall(new Point(30,16)),
			new Wall(new Point(31,16)),
			new Wall(new Point(32,16)),
			new Wall(new Point(34,16)),
			new Wall(new Point(36,16)),
			new Wall(new Point(37,16)),
			new Wall(new Point(38,16)),
			new Wall(new Point(3,17)),
			new Enemy(new Point(4,17)),
			new Wall(new Point(8,17)),
			new Wall(new Point(10,17)),
			new Wall(new Point(11,17)),
			new Wall(new Point(13,17)),
			new Wall(new Point(14,17)),
			new Wall(new Point(15,17)),
			new Wall(new Point(16,17)),
			new Wall(new Point(17,17)),
			new Wall(new Point(18,17)),
			new Wall(new Point(19,17)),
			new Wall(new Point(21,17)),
			new Wall(new Point(25,17)),
			new Wall(new Point(27,17)),
			new Wall(new Point(28,17)),
			new Wall(new Point(29,17)),
			new Wall(new Point(32,17)),
			new Wall(new Point(34,17)),
			new Enemy(new Point(39,17)),
			new Wall(new Point(1,18)),
			new Wall(new Point(2,18)),
			new Wall(new Point(3,18)),
			new Wall(new Point(5,18)),
			new Wall(new Point(6,18)),
			new Wall(new Point(8,18)),
			new Enemy(new Point(9,18)),
			new Wall(new Point(10,18)),
			new Wall(new Point(11,18)),
			new Wall(new Point(18,18)),
			new Wall(new Point(19,18)),
			new Wall(new Point(21,18)),
			new Wall(new Point(23,18)),
			new Wall(new Point(27,18)),
			new Wall(new Point(29,18)),
			new Wall(new Point(31,18)),
			new Wall(new Point(32,18)),
			new Wall(new Point(34,18)),
			new Wall(new Point(5,19)),
			new Wall(new Point(6,19)),
			new Wall(new Point(8,19)),
			new Wall(new Point(13,19)),
			new Wall(new Point(14,19)),
			new Wall(new Point(15,19)),
			new Wall(new Point(16,19)),
			new Enemy(new Point(19,19)),
			new Wall(new Point(23,19)),
			new Wall(new Point(24,19)),
			new Wall(new Point(25,19)),
			new Wall(new Point(26,19)),
			new Wall(new Point(27,19)),
			new Enemy(new Point(29,19)),
			new Wall(new Point(34,19)),
			new Enemy(new Point(36,19))
		]
	);
	
	if (env === "dev") {
		Utils.exportObjs(Utils.exports);
	} else if (env === "prod") {

	} else {
		throw new TypeError("Invalid environment");
	}

	//force save on unload
	/*
	global.onbeforeunload = () => {
		setTimeout(saveGame(instance), 0);
		return "Really save & quit the game?";
	};
	*/

	/*********************************/

	game.start();

})(window);