(function(global){
 "use strict";
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
//Object.values polyfill
if (!Object.values) {
	Object.values = obj => Object.keys(obj).map(key => obj[key]);
}

//should these be scopewide?
const env = "prod",
	TICK = 1,
	saveName = "eschack_save",
	mainCanvas = document.getElementById("canvas-main"),
	secondCanvas = document.getElementById("canvas-second"),
	w = 1040,
	h = 520,
	TILE_COLOR = "hsla(244,3%,55%,1)",
	BASE_XP = 1.3,
	BASE_XP_GROWTH = 1.4;
mainCanvas.width = secondCanvas.width = w;
mainCanvas.height = secondCanvas.height = h;
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
	set(x,y) {
		if(x.constructor === Array){
			this.x = x[0];
			this.y = x[1];
		}else{
			this.x = x;
			this.y = y;
		}
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
const Lifebar = class Lifebar {
	constructor(id, name, container, stats) {
		this.id = id;
		this.name = name;
		this.stats = stats;

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
		this.bar.setAttribute("data-content", this.stats.HP + "/" + this.stats.maxHP);

		//approximate visual size, range [0...100]
		//do we need more precision? is this too much precision?
		let sizeClass = "bar-size-" + Math.max(Math.floor(this.stats.HP / this.stats.maxHP * 100), 0);
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

/* @depends ../ui/lifebar.class.js */
const MoveBlocking = Base => class extends Base {
	get isMoveBlocking() {
		return true;
	}
};
const VisionBlocking = Base => class extends Base {
	get isVisionBlocking() {
		return true;
	}
};

const Hittable = Base => class extends Base {
	takeDamage(damage, logger) {
		this.stats.HP -= damage;
		if (this.lifebar) this.lifebar.set(this.stats.HP);
		if (this.stats.HP <= 0) {
			this.die(logger);
			return true;
		}
		return false;
	}

	heal(amount) {
		if (this.stats.HP < this.stats.maxHP && this.isAlive) {
			let effectiveHeal = (this.stats.INT / 2) + 1 | 0;
			this.stats.HP += effectiveHeal;
			if (this.stats.HP > this.stats.maxHP) this.stats.HP = this.stats.maxHP;
			if (this.lifebar) this.lifebar.set(this.stats.HP);
		}
	}

	die(logger) {
		if (logger) logger.log(this.flavorName + " died", "death");
		if (this.lifebar && this.type !== "Player") this.lifebar.remove();
	}

	get isHittable() {
		return true;
	}
};

/* @depends gameobject.class.js */
const Item = class Item extends GameObject{
	constructor(position){
		super(position);
		this.canDrop = true;
	}
	
	update(){
		return true;
	}
};
/* @depends ../abstract/item.class.js */
const Weapon = class Weapon extends Item{
	//todo: basespeed (weight?), special properties (cleave, reach)
	//stuff
	constructor(name, damage, speed) {
		super(null);
		this.slot = "weapon";
		this.damage = damage || 1;
		this.speed = speed || 10;
		this.name = name;
		
		this.glyph = "(";
		this.color = "red";
		this.bgColor = TILE_COLOR;
		this.flavorName = this.name;
	}
	
	toString(){
		return `${this.name} (${this.damage}, ${this.speed})`;
	}
};
/* @depends ../abstract/item.class.js */
const Armor = class Armor extends Item{
	constructor(slot, name, defence){
		super(null);
		this.slot = slot;
		this.name = name;
		this.defence = defence;
		
		this.glyph = "[";
		this.color = "cyan";
		this.bgColor = TILE_COLOR;
		this.flavorName = this.name;
	}
	
	toString(){
		return `${this.name} (${this.defence})`;
	}
};
/*
@depends ../core/globals.js
@depends ../abstract/gameobject.class.js
@depends ../misc/mixins.js
@depends ../objs/weapon.class.js
@depends ../objs/armor.class.js
 */
//any living dead undead whatever creature
const Creature = class Creature extends Hittable(MoveBlocking(GameObject)) {
	constructor(position, stats, weapon) {
		super(position);
		//actions actually contains arrays of actions
		this.actions = [];

		let self = this;
		this.stats = stats || {
			"maxHP": 3,
			"HP": 3,
			"viewDistance": 5,
			"moveSpeed": 10,
			"inventorySize": 5,
			"STR": 1,
			"INT": 1,
			"DEX": 1,
			"XP": 0,
			"XL": 1,
			get AC() {
				//add up the defence values of all equipped armor
				return Object.keys(self.equipment)
					.filter(k => self.equipment[k] && self.equipment[k].constructor === Armor)
					.reduce((p, c) => self.equipment[c].defence + p, 0);
			}
		};

		this.inventory = [];
		this.equipment = {
			"weapon": weapon || Utils.defaults.weapon(),
			"head": null,
			"body": null,
			"hands": null,
			"legs": null,
			"feet": null
		};

		this.flavorName = "creature";
		this.flavor = "It is mundane."; //flavor text used in examine

		this.killcount = 0;
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
					if (action.try(this, time)) {
						chosen = action;
						return true;
					} else {
						return false;
					}
				});
				elapsedTime += chosen.do(this);
				updateCount++;
			} catch (err) {
				// console.warn("None of the proposed actions were suitable for " + this.constructor.name);
				// console.log(err);
			}
		});

		for (let i = 0; i < updateCount; i++) {
			this.actions.shift();
		}

		return elapsedTime;
	}

	gainXP(amount) {
		this.stats.XP += amount;

		if (this.stats.XP >= BASE_XP * Math.pow(this.stats.XL + 1, BASE_XP_GROWTH)) {
			return this.levelUp();
		}
		return false;
	}

	levelUp() {
		this.stats.XL++;
		let possibleStats = ["maxHP", "STR", "INT", "DEX"],
			chosenStat = possibleStats[Math.floor(Math.random() * possibleStats.length)];

		this.stats[chosenStat]++;
		if(chosenStat === "maxHP"){
			this.lifebar.set();
		}
		return chosenStat;
	}

	toString() {
		return `${this.type}<br>${this.stats.HP} HP<br>${this.flavor}<br>${this.equipment.weapon.damage} ATT`;
	}

	get items() {
		let items = this.inventory.concat(Object.values(this.equipment)).filter(v => v);
		return items;
	}
};

/* @depends gameobject.class.js */
const DungeonFeature = class DungeonFeature extends GameObject{
	constructor(position){
		super(position);
	}
};
/* @depends creature.class.js */
//maybe this should be abstract
const Enemy = class Enemy extends Creature {
	constructor(position, stats, weapon) {
		super(position, stats, weapon);
		this.actions = [];
		this.bgColor = "hsl(30, 30%, 45%)";
		this.glyph = "E";
		this.color = "white";

		this.stats.maxHP = 3;
		this.stats.HP = 3;
		this.stats.viewDistance = 7;
		this.stats.moveSpeed = 9;
		this.stats.XP = 1;

		this.stats = stats || this.stats;

		this.flavorName = "the enemy";
		this.flavor = "It has a fearsome visage.";
	}

	toString() {
		return this.type + "<br>Lvl. " + this.stats.XL + "<br>" + (this.noticed ? "It has noticed you." : "It has not noticed you.") + "<br>" + this.flavor;
	}

	createLifebar(){
		this.lifebar = new Lifebar(this.id, this.type, document.getElementById("info-container-other-life"), this.stats);
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
/* @depends ../core/vector.class.js */
//handle key related stuff and i guess also some action mapping lol
const KeyHandler = class KeyHandler {
	constructor() {
		this.use("default");
	}

	use(map = "default") {
		if (map === "default") {
			this.using = "default";

			this.keyCases = {
				//numpad
				104: "n",
				100: "w",
				98: "s",
				102: "e",
				105: "ne",
				99: "se",
				97: "sw",
				103: "nw",

				//vi keys
				75: "n", //k
				76: "e", //l
				74: "s", //j
				72: "w", //h
				89: "nw", //y
				85: "ne", //u
				66: "sw", //b
				78: "se", //n

				101: "c", //num5

				71: "pickup", //g

				68: {use: "inventorydialog", act: "drop"}, //d
				87: {use: "inventorydialog", act: "equip"}, //w
				84: {use: "inventorydialog", act: "unequip"}, //t

				60: "up", //<
				226: "up", //chrome...
				83: "up",//s

				0: "cheat",

				"Numpad1": "sw",
				"Numpad2": "s",
				"Numpad3": "se",
				"Numpad4": "w",
				"Numpad5": "c",
				"Numpad6": "e",
				"Numpad7": "nw",
				"Numpad8": "n",
				"Numpad9": "ne",

				"KeyH": "w",
				"KeyJ": "s",
				"KeyK": "n",
				"KeyL": "e",
				"KeyY": "nw",
				"KeyU": "ne",
				"KeyB": "sw",
				"KeyN": "se",

				"KeyG": "pickup",

				"KeyD": {
					use: "inventorydialog",
					act: "drop"
				},
				"KeyW": {
					use: "inventorydialog",
					act: "equip"
				},
				"KeyT": {
					use: "inventorydialog",
					act: "unequip"
				},

				"KeyS": "up",

				"Backquote": "cheat"

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
				"c": "rest",
				"pickup": "pickup",
				"up": "stair",
				"down": "stair",
				"cheat": "cheat"
			};

		} else if (map === "inventorydialog") {
			this.using = "inventorydialog";
			let keyCodeMap = "abcdefghijklmnopqrstuvwxyz".split("").reduce((p, c) => (p[c.toUpperCase().charCodeAt(0)] = c, p), {}),
				codeMap = "abcdefghijklmnopqrstuvwxyz".split("").reduce((p, c) => (p["Key" + c.toUpperCase()] = c, p), {});
			this.keyCases = Object.assign(keyCodeMap, codeMap);
		}
	}

	//input is a key or a keycode
	//returns action instruction
	get(key) {
		if (typeof this.keyCases[key] === "object") {
			this.act = this.keyCases[key].act;
			this.use(this.keyCases[key].use);
			return this.act;
		} else if (this.using === "inventorydialog") {
			let val = this.keyCases[key];
			//return default
			this.use();
			return this.act + ":" + val;
		}
		this.act = undefined;
		return this.actionMap[this.keyCases[key]];
	}
};

/*
@depends ../objs/weapon.class.js
*/
const Utils = class Utils {

	static get defaults() {
		return {
			weapon: () => {
				let weapon = new Weapon("Fists");
				weapon.canDrop = false;
				return weapon;
			}
		};
	}

	static get exports() {
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

	static get alphabetMap() {
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

	static saveGame(instance) {
		let save = {};
		//all we need is the objs
		//in Game.start they will get inserted
		save.objs = instance.objs;
		//remove fov because of circular reference
		save.objs.forEach(obj => delete obj.fov);

		localStorage.setItem(saveName, LZString.compress(JSON.stringify(save)));
		console.log("Game saved");
	}

	static loadGame() {
		let save = JSON.parse(LZString.decompress(localStorage.getItem(saveName)) || null);

		if (save) {
			let objMap = {
				"Wall": Wall,
				"Creature": Creature,
				"Enemy": Enemy,
				"Player": Player,
				"Item": Item,
				"Weapon": Weapon
			};

			let objs = [];
			save.objs.forEach(obj => {
				if (obj) {
					if (objMap[obj.type]) {
						objs[obj.id] = objMap[obj.type].from(obj);
					}
				}
			});
			console.log("Savedata loaded");
			return objs;
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
	static screenToGame(point, tileSize, spacing) {
		return new Point(Math.floor(point.x / (tileSize + spacing)), Math.floor(point.y / (tileSize + spacing)));
	}

	//convert game coordinates to screen coordinates
	static gameToScreen(point, tileSize, spacing) {
		return new Point(point.x * (tileSize + spacing), point.y * (tileSize + spacing));
	}

	//convert screen coordinates to conform to tiles
	static screenToTiles(point, tileSize, spacing) {
		return Utils.gameToScreen(Utils.screenToGame(point, tileSize, spacing), tileSize, spacing);
	}

	static exportObjs(exports) {
		for (let key in exports) {
			global[key] = exports[key];
		}
	}

	static randomWeapon(difficulty) {
		let materials = ["Bronze", "Iron", "Steel"],
			types = ["Dagger", "Sword", "Axe", "Pikestaff"];

		let name = materials[Math.floor(Math.random() * materials.length)] +
			" " + types[Math.floor(Math.random() * types.length)];

		return new Weapon(name, Math.floor(Math.random() * difficulty * 0.8) + Math.floor(Math.random() * 2) + 1, Math.floor(Math.random() * 6) + Math.max(10 - difficulty, 2));
	}

	static randomArmor(difficulty) {
		let materials = ["Bronze", "Iron", "Steel"],
			types = {
				"head": ["cap", "coif", "helmet"],
				"body": ["chainmail", "tunic", "platebody"],
				"hands": ["gauntlets", "gloves", "mittens"],
				"legs": ["greaves", "shin guards", "tassets"],
				"feet": ["boots", "shoes", "sandals"]
			};

		let slot = Object.keys(types)[Math.floor(Math.random() * Object.keys(types).length)],
			name = materials[Math.floor(Math.random() * materials.length)] +
			" " + types[slot][Math.floor(Math.random() * types[slot].length)];

		return new Armor(slot, name, Math.floor(Math.random() * difficulty * 0.5) + 1);
	}

	static get DamageCalculator() {
		return class {
			static get constants() {
				return {
					baseAC: 0.1,
					defenderStrEffectiveness: 10,
					attackerStrEffectiveness: 2,
					attackerDexEffectiveness: 1.7
				};
			}

			static get physical() {
				return {
					melee: (attacker, defender) => {
						let effectiveAC = (defender.stats.AC + this.constants.baseAC) * (1 + defender.stats.STR / this.constants.defenderStrEffectiveness),
							effectiveDmg = attacker.equipment.weapon.damage + (
								attacker.stats.STR / this.constants.attackerStrEffectiveness +
								attacker.stats.DEX / this.constants.attackerDexEffectiveness
							) / 2;
						return Math.max(Math.floor(effectiveDmg - effectiveAC), 0);
					}
				};
			}
		};
	}

	static initUIButtons(instance) {
		document.getElementById("button-save").addEventListener("click", e => {
			e.stopPropagation();
			this.saveGame(instance);
		});

		document.getElementById("button-delete").addEventListener("click", e => {
			e.stopPropagation();
			this.deleteSave();
		});
	}
};

/* @depends ../misc/utils.class.js */
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
const EquipmentManager = class EquipmentManager {
	constructor(equipmentBox, equipment) {
		this.wrapper = equipmentBox;
		this.equipment = equipment;
		let container = document.createElement("div");
		container.style.padding = "10px";
		this.container = container;
		this.wrapper.appendChild(this.container);
	}

	update() {
		if (!!this.container.children.length) {
			Array.from(this.container.children).forEach(item => item.remove());
		}
		Object.keys(this.equipment).filter(k => this.equipment[k]).forEach((k, i) => {
			let parent = document.createElement("div"),
				key = document.createElement("div"),
				slot = document.createElement("div"),
				value = document.createElement("div");

			parent.className = "equipment-row";
			key.className = "equipment-key";
			slot.className = "equipment-slot";
			value.className = "equipment-item";

			key.innerHTML = Utils.alphabetMap[i];
			slot.innerHTML = k;
			value.innerHTML = this.equipment[k];

			parent.appendChild(key);
			parent.appendChild(slot);
			parent.appendChild(value);
			this.container.appendChild(parent);
		});
	}
};

//manages the inventory UI component
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
const StatsManager = class StatsManager {
	constructor(playerWrap, gameCont, playerStats, gameStats) {
		this.playerWrap = playerWrap;
		this.gameCont = gameCont;
		this.playerStats = playerStats;
		this.gameStats = gameStats;

		//map stats keys to displayed strings
		this.usedPlayerStats = {
			"STR": "STR",
			"INT": "INT",
			"DEX": "DEX",
			"viewDistance": "Vision",
			"moveSpeed": "Speed",
      "AC": "AC",
			"XL": "XL",
			"XP": "XP"
		};

		this.usedGameStats = {
			"dungeonName": "",
			"time": "Time",
			"currentDungeonLevel": "Depth",
      "score": "Score"
		};

		this.create();
	}

	create() {
		let playerStatCont = document.createElement("div");
		playerStatCont.style.padding = "10px";
		this.playerStatCont = playerStatCont;

		this.playerStatElements = {};

		Object.keys(this.usedPlayerStats).forEach(key => {
			let parent = document.createElement("div"),
				stat = document.createElement("div"),
				value = document.createElement("div");

			parent.className = "player-stat-row";
			stat.className = "player-stat-name";
			value.className = "player-stat-value";

			stat.innerHTML = this.usedPlayerStats[key];
			value.innerHTML = this.playerStats[key];
			parent.appendChild(stat);
			parent.appendChild(value);
			if(key === "XL" || key === "XP"){
				this.playerWrap.appendChild(parent);
			}else{
				this.playerStatCont.appendChild(parent);
			}

			this.playerStatElements[key] = {
				stat,
				value
			};
		});
		this.playerWrap.appendChild(this.playerStatCont);

		this.gameStatElements = {};

		Object.keys(this.usedGameStats).forEach(key => {
			let parent = document.createElement("div"),
				stat = document.createElement("div"),
				value = document.createElement("div");

			parent.className = "game-stat-row";
			stat.className = "game-stat-name";
			value.className = "game-stat-value";

			parent.id = "game-stat-" + key;

			stat.innerHTML = this.usedGameStats[key];
			value.innerHTML = this.gameStats[key];
			parent.appendChild(stat);
			parent.appendChild(value);
			this.gameCont.appendChild(parent);

			this.gameStatElements[key] = {
				stat,
				value
			};
		});
	}

	update() {
		Object.keys(this.usedPlayerStats).forEach(key => {
			this.playerStatElements[key].value.innerHTML = this.playerStats[key];
		});
		Object.keys(this.usedGameStats).forEach(key => {
			this.gameStatElements[key].value.innerHTML = this.gameStats[key];
		});
	}
};

/* 
@depends point.class.js
@depends ../abstract/gameobject.class.js
 */
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
/* 
@depends globals.js
@depends point.class.js
@depends tile.class.js
 */
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

	//empty all tiles
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
/* @depends ../abstract/gameobject.class.js */
const Corpse = class Corpse extends GameObject {
	constructor(position){
		super(position);
		this.bgColor = "hsl(0,40%,40%)";
		this.glyph = "x"; //some block character
		this.color = "hsl(0,40%,10%)";
		this.flavorName = "corpse";
	}
	
	update(){
		return 0;
	}
};
/*
@depends ../../abstract/action.class.js
@depends ../objs/corpse.class.js
*/
const AttackAction = class AttackAction extends Action {
	constructor(context, logger, direction) {
		super(context, logger);
		this.direction = direction;
	}

	try (actor, time) {
		if (!actor.equipment.weapon) {
			actor.equipment.weapon = Utils.defaults.weapon();
		}
		this.duration = actor.equipment.weapon.speed;
		if (time % this.duration !== 0) {
			return false;
		}
		let target = new Point(...actor.position.get);
		target.moveBy(this.direction);

		let tile = this.context.get(target);
		return tile && tile.top && tile.top.isHittable && actor.isAlive;
	}

	do(actor) {
		let target = new Point(...actor.position.get);
		target.moveBy(this.direction);
		target = this.context.get(target);

		let damage = Utils.DamageCalculator.physical.melee(actor, target.top);

		if (this.logger) {
			this.logger.log(`${actor.flavorName} hit ${target.top.flavorName} for ${damage} damage with ${actor.equipment.weapon}`, (actor.constructor === Player ? "hit" : "damage"));
		}
		let died = target.top.takeDamage(damage, this.logger);
		if (died) {
			actor.killcount++;
			let leveledUpStat = actor.gainXP(target.top.stats.XP);
			if (leveledUpStat) {
				this.logger.log(actor.flavorName + " leveled up and gained a point in " + leveledUpStat, "hilight");
			}
			//drop all items and corpse
			target.top.items.forEach(item => {
				if (item.canDrop) {
					item.position = new Point(...target.top.position.get);
					target.add(item);
				}
			});
			target.add(new Corpse(new Point(...target.top.position.get)));
			target.remove(target.top);
		}
		this.context.update();
		return this.duration;
	}
};

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

/*
@depends ../../abstract/action.class.js
@depends ../logic/actions/itemunequipaction.class.js
*/
const ItemEquipAction = class ItemEquipAction extends Action {
	constructor(context, logger, inventorySlot) {
		super(context, logger);
		this.inventorySlot = inventorySlot;
	}

	try (actor, time) {
		let hasItem = !!actor.inventory[Utils.alphabetMap.indexOf(this.inventorySlot)];
		if (!hasItem) {
			this.logger.log("No such item");
			return false;
		}
		return time % 10 === 0 && hasItem && actor.isAlive;
	}

	do(actor) {
		let inventoryIndex = Utils.alphabetMap.indexOf(this.inventorySlot),
			item = actor.inventory[inventoryIndex],
			duration = 0;

		//if already has something equipped in that slot
		//remove it into inventory
		//actually this should be an unequipaction
		if (actor.equipment[item.slot]) {
			let equipmentKey = Utils.alphabetMap[Object.keys(actor.equipment).filter(key => actor.equipment[key]).indexOf(item.slot)];
			let action = new ItemUnequipAction(null, this.logger, equipmentKey);
			duration += action.do(actor);
		}
		//splice item from inventory and put it in equipment
		item = actor.inventory.splice(inventoryIndex, 1)[0];
		actor.equipment[item.slot] = item;

		this.logger.log(actor.flavorName + " equipped " + item.toString(), "junk1");
		return duration + 10;
	}
};

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

/* @depends ../../abstract/action.class.js */
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
		return actor.cheatMode || ((tile.isEmpty || (tile && tile.top && !tile.top.isMoveBlocking)) && actor.isAlive);
	}

	do(actor) {
		actor.position.moveBy(this.movement);
		this.context.update(); //this is kinda important, should this even be here
		return this.duration;
	}
};

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
		return 10;
	}
};

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
		this.logger.log(actor.flavorName + " went " + stair.direction + " the stairs", "junk2");
		return 10;
	}
};

/*
@depends ../core/vector.class.js
@depends ../core/tilegroup.class.js
@depends ../core/point.class.js
@depends ../logic/actions/attackaction.class.js
@depends itemdropaction.class.js
@depends itemequipaction.class.js
@depends itempickupaction.class.js
@depends moveaction.class.js
@depends nullaction.class.js
@depends stairaction.class.js
 */
//does gamelogic stuff
const ActionManager = class ActionManager {
	constructor(board, logger) {
		this.board = board;
		this.logger = logger;

		this.proposalMap = {};
		this.proposalMap[null] = [NullAction];
		this.proposalMap[Vector] = [MoveAction, AttackAction, NullAction];
		this.proposalMap["rest"] = [RestAction, NullAction];
		this.proposalMap["pickup"] = [ItemPickupAction, NullAction];
		this.proposalMap["drop"] = [ItemDropAction, NullAction];
		this.proposalMap["equip"] = [ItemEquipAction, NullAction];
		this.proposalMap["unequip"] = [ItemUnequipAction, NullAction];
		this.proposalMap["stair"] = [StairAction, NullAction];
	}

	//decide actor logic
	think(actor, player) {
		if (actor instanceof Enemy) {
			let fov = this.getFov(actor),
				instruction = null,
				shouldLog = this.getFov(player).has(actor.position);
			actor.target = fov.get(player.position);

			if (!actor.target || !player.isAlive) {
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
				if (!actor.noticed && shouldLog) this.logger.log(actor.flavorName + " noticed " + player.flavorName, "threat1");
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
		if (!actor) return;
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
			baseColor: TILE_COLOR,
			tileSize: 25,
			spacing: 1
		});
	}

	//what does this do again? give actions to actors? or just the player?
	delegateAction(actor, instruction) {
		if (!actor) {
			return;
		}
		if (!actor.isAlive) {
			let proposals = this.proposalMap[null];
			let methods = proposals.map(action => () => new action(this.board, this.logger, instruction));
			actor.actions.push(methods);
			return true;
		}
		if (instruction) {
			let key = instruction;
			if (typeof instruction === "function") {
				instruction = instruction();
				key = instruction.constructor;
			} else if (typeof instruction === "string") {
				[key, instruction] = instruction.split(":");
				if (!instruction) {
					switch (key) {
						case "drop":
							this.logger.log("Which item to drop? [a-z]");
							return false;
						case "equip":
							this.logger.log("Which item to equip? [a-z]");
							return false;
						case "unequip":
							this.logger.log("Which item to unequip? [a-z]");
							return false;
						case "cheat":
							actor.cheatMode = actor.cheatMode ? false : true;
							this.logger.log("Cheat mode " + (!actor.cheatMode ? "de" : "") + "activated", "hilight");
							return false;
						default:
							break;
					}
				}
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

	/*
		@depends globals.js
		@depends ../ui/equipmentmanager.class.js
		@depends ../ui/inventorymanager.class.js
		@depends ../ui/logboxmanager.class.js
		@depends ../ui/statsmanager.class.js
		@depends ../misc/utils.class.js
		@depends ../logic/actionmanager.class.js
		@depends ../control/keyhandler.class.js
		@depends ../controls/mousehandler.class.js
		 */
	//the game
	const Game = class Game {
		constructor(board, dungeon) {

			this.logger = new LogboxManager(document.getElementById("logbox"), 10);

			let self = this;
			this.stats = {
				time: 0,
				dungeonName: "Dungeon of Esc",
				currentDungeonLevel: 0,
				get score() {
					return Math.round(
						(
							(self.player.killcount + 1) * (self.stats.currentDungeonLevel + 1)
						) / (
							(self.stats.time) / 10000 + 1
						)
					);
				}
			};

			this.dungeonLevels = [];

			this.board = board;
			this.player = dungeon.objs[0];

			this.saveDungeonLevel(dungeon);

			this.logic = new ActionManager(this.board, this.logger);

			//keypress eventlistener
			this.keyHandler = new KeyHandler();
			document.addEventListener("keydown", e => {
				if (this.logic.delegateAction(this.player, this.keyHandler.get(e.code || e.keyCode))) {
					this.update();
				}
			});

			let miscOtherInfoContainer = document.getElementById("info-container-other-misc");

			this.examineContainer = document.createElement("div");
			this.examineContainer.className = "examine-container";

			miscOtherInfoContainer.appendChild(this.examineContainer);

			//cleaned this up a bit but it's still not very nice
			this.mouseHandler = new MouseHandler(this.board);
			document.addEventListener("mousemove", e => {
				let bounds = this.board.bounds;
				let screenPoint = new Point(e.pageX, e.pageY);

				//mouse is inside game screen
				if (screenPoint.in(bounds)) {
					let fov = this.player.fov,
						gamePoint = Utils.screenToGame(screenPoint, this.board.tileSize, this.board.spacing);

					//set cursor position
					this.mouseHandler.cursorFromScreen(screenPoint);

					//if hovering over a tile that is seen
					if (fov && fov.has(gamePoint)) {
						let targetTile = this.board.get(gamePoint);

						//if tile is not empty
						if (targetTile && targetTile.top) {
							//reset all lifebars styles
							this.dungeonLevels[this.stats.currentDungeonLevel].objs.forEach(obj => {
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
					this.dungeonLevels[this.stats.currentDungeonLevel].objs.forEach(obj => {
						if (obj.lifebar) obj.lifebar.setStyle("default");
					});

					//get lifebars owner
					let id = e.target.id.match(/[0-9]+$/);
					let target = this.dungeonLevels[this.stats.currentDungeonLevel].objs[Number(id)];

					//set cursor to lifebars owner
					if (target) {
						this.mouseHandler.cursorFromGame(target.position);
						this.examineContainer.innerHTML = target;
						target.lifebar.setStyle("hilight");
					}
				}
			});

			this.inventoryManager = new InventoryManager(
				document.getElementById("info-container-inventory"),
				this.player.inventory
			);
			this.equipmentManager = new EquipmentManager(
				document.getElementById("info-container-equipment"),
				this.player.equipment
			);
			this.statsManager = new StatsManager(
				document.getElementById("info-container-player"),
				document.getElementById("info-container-game"),
				this.player.stats,
				this.stats
			);
		}

		saveDungeonLevel(dungeon) {
			let {
				rooms,
				paths,
				objs,
				stairs
			} = dungeon,
			img = new Image();
			img.src = secondCanvas.toDataURL();
			this.dungeonLevels[this.stats.currentDungeonLevel] = {
				objs: [],
				rooms: rooms,
				paths: paths,
				stairs: stairs,
				map: img
			};
			objs.forEach(obj => this.dungeonLevels[this.stats.currentDungeonLevel].objs[obj.id] = obj);
		}

		changeDungeonLevel(level) {
			this.saveDungeonLevel(this.dungeonLevels[this.stats.currentDungeonLevel]);
			let dir = level > this.stats.currentDungeonLevel ? "down" : "up";
			this.dungeonLevels[this.stats.currentDungeonLevel].objs.forEach((obj, k) => {
				if (k === 0) {
					return;
				}
				if (obj.lifebar) {
					obj.lifebar.remove();
				}
			});

			this.stats.currentDungeonLevel = level;

			mainCtx.clearRect(0, 0, w, h);
			secondCtx.clearRect(0, 0, w, h);
			this.board.clear();

			let objs = [];
			objs[0] = this.player;
			//if level already exists load it else generate new
			if (this.dungeonLevels[level]) {
				objs = this.dungeonLevels[level].objs;
				secondCtx.drawImage(this.dungeonLevels[level].map, 0, 0);
				//put player on downstairs if we're going up
				if (dir === "up") {
					this.player.position.set(...this.dungeonLevels[level].stairs.down.get);
				} else {
					//or upstairs
					this.player.position.set(...this.dungeonLevels[level].stairs.up.get);
				}
			} else {
				let levelType = DungeonGenerator.types[Math.floor(Math.random() * DungeonGenerator.types.length)];
				let options = DungeonGenerator[levelType].defaultOptions;
				options.stairs.up = true;
				options.difficulty = this.stats.currentDungeonLevel;
				let dungeon = DungeonGenerator[levelType].makeLevel(this.player, options);
				objs = dungeon.objs;
				this.dungeonLevels[level] = {
					objs: [],
					rooms: dungeon.rooms,
					paths: dungeon.paths,
					stairs: dungeon.stairs
				};
			}

			//put objs in their id slots
			objs.forEach(obj => this.dungeonLevels[level].objs[obj.id] = obj);

			//insert objs into the board
			this.dungeonLevels[level].objs.forEach(obj => {
				if (obj) {
					this.board.insert(obj);
				}
			});

			this.dungeonLevels[level].objs.forEach(obj => {
				if (obj) {
					this.logic.think(obj, this.player);
				}
			});

		}

		update() {
			let duration = this.player.update(this.logger);
			let tickCount = duration / TICK;

			if (this.player.dungeonLevelChange) {
				let level = this.stats.currentDungeonLevel;
				if (this.player.dungeonLevelChange === "up") {
					level--;
				} else if (this.player.dungeonLevelChange === "down") {
					level++;
				}
				this.changeDungeonLevel(level);

				delete this.player.dungeonLevelChange;
			} else if (!this.player.isAlive) {
				this.board.remove(this.player);
			}

			//contains the total durations of each objs actions for this turn
			let objDurations = [];
			for (let i = 0; i < tickCount; i++) {
				this.stats.time += TICK;

				this.dungeonLevels[this.stats.currentDungeonLevel].objs.forEach((obj, index) => {
					//skip player
					if (obj.type === "Player") {
						return;
					}

					if (obj.isAlive) {
						let duration = obj.update(this.logger, this.stats.time + (objDurations[obj.id] || 0));
						if (duration > 0) {
							//if action was excecuted we generate new ones and
							//forward the time for this obj
							this.logic.think(obj, this.player);
							objDurations[obj.id] = objDurations[obj.id] ? objDurations[obj.id] + duration : duration;
						}

						//obj died during update
						if (!obj.isAlive) {
							this.board.remove(obj);
							delete this.dungeonLevels[this.stats.currentDungeonLevel].objs[obj.id];
						}
					} else {
						this.board.remove(obj);
						delete this.dungeonLevels[this.stats.currentDungeonLevel].objs[obj.id];
					}
				});
			}

			let fov = this.logic.getFov(this.player);
			this.player.fov = fov;

			if (fov) {
				this.dungeonLevels[this.stats.currentDungeonLevel].objs.forEach(obj => {
					if (obj instanceof Enemy) {
						if (fov.has(obj.position)) {
							obj.lifebar.show();
						} else {
							obj.lifebar.hide();
						}
					}
				});

				mainCtx.clearRect(0, 0, w, h);
				if (this.player.cheatMode) {
					this.board.draw();
				} else {
					fov.draw();
				}
				secondCtx.drawImage(mainCanvas, 0, 0);

			}

			this.inventoryManager.update();
			this.equipmentManager.update();
			this.statsManager.update();
		}

		start() {

			this.logger.log("Hello and welcome", "hilight");
			this.dungeonLevels[this.stats.currentDungeonLevel].objs.forEach(obj => {
				if (obj) {
					this.board.insert(obj);
				}
			});

			let fov = this.logic.getFov(this.player);
			this.player.fov = fov;

			this.dungeonLevels[this.stats.currentDungeonLevel].objs.forEach(obj => {
				this.logic.think(obj, this.player);
				if (obj instanceof Enemy) {
					if (fov.has(obj.position)) {
						obj.lifebar.show();
					} else {
						obj.lifebar.hide();
					}
				}
			});
			fov.draw();
			this.inventoryManager.update();
			this.equipmentManager.update();

			document.getElementById("loader").remove();
		}
	};

const Rect = class Rect {
	constructor(bounds) {
		Object.assign(this, bounds);
		if (!this.type) {
			this.type = Rect.type.DEFAULT;
		}
	}

	static get type() {
		return {
			DEFAULT: 0,
			ROOM: 1,
			PATH: 2,
			CHUNK: 3,
			DOOR: 4
		};
	}

	get mids() {
		return {
			top: new Rect({
				x: ~~(this.x + this.w / 2),
				y: this.y,
				w: 1,
				h: 1
			}),
			left: new Rect({
				x: this.x,
				y: ~~(this.y + this.h / 2),
				w: 1,
				h: 1
			}),
			right: new Rect({
				x: this.x + this.w,
				y: ~~(this.y + this.h / 2),
				w: 1,
				h: 1
			}),
			bottom: new Rect({
				x: ~~(this.x + this.w / 2),
				y: this.y + this.h,
				w: 1,
				h: 1
			})
		};
	}

	shrink(amount) {
		if (amount !== ~~amount) {
			this.x += Math.floor(amount);
			this.y += Math.floor(amount);
			this.w -= Math.ceil(amount);
			this.h -= Math.ceil(amount);
		} else {
			this.x += amount;
			this.y += amount;
			this.w -= amount * 2;
			this.h -= amount * 2;
		}
	}

	grow(amount) {
		if (amount !== ~~amount) {
			this.x -= Math.floor(amount);
			this.y -= Math.floor(amount);
			this.w += Math.ceil(amount);
			this.h += Math.ceil(amount);
		} else {
			this.x -= amount;
			this.y -= amount;
			this.w += amount * 2;
			this.h += amount * 2;
		}
	}

	clone() {
		return new Rect({
			x: this.x,
			y: this.y,
			w: this.w,
			h: this.h,
			type: this.type
		});
	}

	intersect(rect2) {
		let r1l = this.x,
			r1r = this.x + this.w,
			r1t = this.y,
			r1b = this.y + this.h;
		let r2l = rect2.x,
			r2r = rect2.x + rect2.w,
			r2t = rect2.y,
			r2b = rect2.y + rect2.h;
		let diffs = {
			left: Infinity,
			right: Infinity,
			bottom: Infinity,
			top: Infinity,
		};

		if (r1r >= r2l && r1l <= r2l) {
			diffs.left = r1r - r2l;
		}
		if (r1l <= r2r && r1r >= r2r) {
			diffs.right = r2r - r1l;
		}
		if (r1t <= r2b && r1b >= r2b) {
			diffs.top = r1t - r2b;
		}
		if (r1b >= r2t && r1t <= r2t) {
			diffs.bottom = r2t - r1b;
		}
		let min = Object.keys(diffs).map(k => diffs[k]).reduce((p, c) => c < p ? c : p);

		if (min === Infinity) {
			return false;
		}

		return Object.keys(diffs).find(k => diffs[k] === min);
	}

	get split() {
		return {
			h: pos => {
				pos = pos || ~~(Math.random() * this.h);
				return [
					new Rect({
						x: this.x,
						y: this.y,
						w: this.w,
						h: pos,
						splitDir: "h"
					}),
					new Rect({
						x: this.x,
						y: this.y + pos,
						w: this.w,
						h: this.h - pos,
						splitDir: "h"
					})
				];
			},
			w: pos => {
				pos = pos || ~~(Math.random() * this.w);
				return [
					new Rect({
						x: this.x,
						y: this.y,
						w: pos,
						h: this.h,
						splitDir: "w"
					}),
					new Rect({
						x: this.x + pos,
						y: this.y,
						w: this.w - pos,
						h: this.h,
						splitDir: "w"
					})
				];
			}
		};
	}

};

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

/* @depends ../abstract/dungeonfeature.class.js */
const Stair = class Stair extends GameObject{
	constructor(position, direction){
		super(position);
		this.direction = direction;
		this.bgColor = "hsl(0,0%,35%)";
		
		if(this.direction === "up"){
			this.glyph = "<";
		}else if(this.direction === "down"){
			this.glyph = ">";
		}
		this.color = "hsl(0,0%,75%)";
		this.flavorName = this.direction+"stair";
	}
	
	update(){
		return 0;
	}
	
	toString(){
		return "A staircase going "+this.direction;
	}
};
/* @depends ../abstract/dungeonfeature.class.js */
//todo: create base class Inanimate or something
const Wall = class Wall extends VisionBlocking(MoveBlocking(DungeonFeature)) {
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
/* @depends ../abstract/enemy.class.js */
const Honeybadger = class Honeybadger extends Enemy {
	constructor(position){
		super(position, null, new Weapon("Claws", 4, 11));
		this.bgColor = "hsl(25, 5%, 10%)";
		this.glyph = "B";
		this.color = "hsl(5, 5%, 90%)";
		
		this.equipment.weapon.canDrop = false;
		
		this.stats.maxHP = 10;
		this.stats.HP = 10;
		this.stats.viewDistance = 7;
		this.stats.moveSpeed = 10;
		this.flavorName = "the honeybadger";
		this.flavor = "Notorious for their ferocity.";
		this.createLifebar();
	}
};
/* @depends ../abstract/enemy.class.js */
const Jackalope = class Jackalope extends Enemy {
	constructor(position){
		super(position, null, new Weapon("Antlers", 2, 5));
		this.bgColor = "hsl(35, 25%, 65%)";
		this.glyph = "J";
		this.color = "hsl(35, 35%, 5%)";
		
		this.equipment.weapon.canDrop = false;
		
		this.stats.maxHP = 6;
		this.stats.HP = 6;
		this.stats.viewDistance = 7;
		this.stats.moveSpeed = 8;
		this.flavorName = "the jackalope";
		this.flavor = "A large agressive rabbit with antlers on its head.";
		this.createLifebar();
	}
};
/* @depends ../abstract/enemy.class.js */
const Redcap = class Redcap extends Enemy {
	constructor(position){
		super(position, null, null);
		this.bgColor = "hsl(66, 10%, 70%)";
		this.glyph = "^";
		this.color = "hsl(0, 80%, 60%)";
		
		this.stats.maxHP = 10;
		this.stats.HP = 10;
		this.stats.viewDistance = 7;
		this.stats.moveSpeed = 10;
		this.flavorName = "the redcap";
		this.flavor = "A malevolent murderous dwarf-like creature.";
		this.createLifebar();
		
		this.canWield = true;
		this.canWear = true;
	}
};
/*
@depends ../core/rect.class.js
@depends ../misc/utils.class.js
@depends ../objs/stair.class.js
@depends ../objs/wall.class.js
@depends monsters/honeybadger.class.js
@depends jackalope.class.js
@depends redcap.class.js
 */
const DungeonGenerator = class DungeonGenerator {

	static generateEquipment(enemy, options) {
		if (enemy.canWield) {
			if (options.difficulty / 5 > Math.random()) {
				enemy.equipment.weapon = Utils.randomWeapon(options.difficulty);
			}
		}
		if (enemy.canWear) {
			if (options.difficulty / 10 > Math.random()) {
				let armor = Utils.randomArmor(options.difficulty);
				enemy.equipment[armor.slot] = armor;
			}
		}
		return enemy;
	}

	//try to spawn some enemies within room
	static generateEnemies(room, options) {
		let enemyList = [Jackalope, Honeybadger, Redcap];
		let enemies = [];
		for (let x = room.x + room.w; x > room.x; x--) {
			for (let y = room.y + room.h; y > room.y; y--) {
				if (Math.random() < options.enemies.spawnChance) {
					let enemy = enemyList[Math.floor(Math.random() * enemyList.length)];
					enemy = new enemy(new Point(x, y));
					enemy = this.generateEquipment(enemy, options);

					for (let i = 1; i < options.difficulty; i++) {
						enemy.levelUp();
						enemy.stats.XP++;
					}

					enemies.push(enemy);
				}
			}
		}
		return enemies;
	}

	static generateLoot(room, options) {
		let generatorList = [Utils.randomWeapon, Utils.randomArmor];
		let items = [];
		for (let x = room.x + room.w; x > room.x; x--) {
			for (let y = room.y + room.h; y > room.y; y--) {
				if (Math.random() < options.items.spawnChance) {
					let gen = generatorList[Math.floor(Math.random() * generatorList.length)];
					let item = gen(options.difficulty + 1);
					item.position = new Point(x, y);

					items.push(item);
				}
			}
		}
		return items;
	}

	static get types() {
		return ["traditional", "city", "cave"];
	}

	static get traditional() {
		return class {
			static makeRoom(options) {
				let room = {};

				room.w = ~~(Math.random() * (options.rooms.size.max.w - options.rooms.size.min.w) + options.rooms.size.min.w);
				room.h = ~~(Math.random() * (options.rooms.size.max.h - options.rooms.size.min.h) + options.rooms.size.min.h);
				room.x = ~~(Math.random() * (options.size.w - room.w));
				room.y = ~~(Math.random() * (options.size.h - room.h));

				return room;
			}

			static makePoint(options) {
				return {
					x: ~~(Math.random() * options.size.w),
					y: ~~(Math.random() * options.size.h)
				};
			}

			static makePaths(rooms, midPoints, options) {
				let paths = [];

				//connect rooms to midpoints
				for (let i = 0; i < options.paths.count; i++) {
					let path = {},
						dest = midPoints[i % options.paths.count % options.midPoints.count];

					path.x1 = rooms[i].x + ~~(Math.random() * rooms[i].w);
					path.y1 = rooms[i].y + ~~(Math.random() * rooms[i].h);

					path.x2 = dest.x;
					path.y2 = rooms[i].y + ~~(Math.random() * rooms[i].h);

					path.x3 = dest.x;
					path.y3 = dest.y;

					paths.push(path);
				}

				//connect midpoints together
				for (let i = 1; i < options.midPoints.count; i++) {
					let path = {};

					path.x1 = midPoints[i - 1].x;
					path.y1 = midPoints[i - 1].y;

					path.x2 = midPoints[i].x;
					path.y2 = midPoints[i - 1].y;

					path.x3 = midPoints[i].x;
					path.y3 = midPoints[i].y;

					paths.push(path);
				}

				return paths;
			}

			//main method
			static makeLevel(player, options) {
				options = options || this.defaultOptions;
				let matrix = [],
					objs = [],
					rooms = Array(options.rooms.count).fill(),
					midPoints = Array(options.midPoints.count).fill();

				//get rooms
				for (let i in rooms) {
					rooms[i] = this.makeRoom(options);
				}

				//set player to first room
				player.position.set(rooms[0].x + 1, rooms[0].y + 1);
				objs.push(player);

				let stairs = {};

				if (options.stairs.up) {
					//put an upstairs on player
					let pos = new Point(rooms[0].x + 1, rooms[0].y + 1);
					objs.push(new Stair(pos, "up"));
					stairs.up = pos;
				}

				if (options.stairs.down) {
					//put a downstairs in "last" room
					let pos = new Point(rooms[options.rooms.count - 1].x + 1, rooms[options.rooms.count - 1].y + 1);
					objs.push(new Stair(pos, "down"));
					stairs.down = pos;
				}

				//get midpoints
				for (let i in midPoints) {
					midPoints[i] = this.makePoint(options);
				}

				//get paths
				let paths = this.makePaths(rooms, midPoints, options);

				//fill matrix with walls
				for (let y = 0; y < options.size.h; y++) {
					matrix[y] = [];
					for (let x = 0; x < options.size.w; x++) {
						let tile = new Tile(new Point(x, y));
						tile.add(new Wall(new Point(x, y)));
						matrix[y][x] = tile;
					}
				}

				//carve out rooms
				//and try put some enemies in them
				rooms.forEach(room => {
					for (let x = room.x + room.w; x > room.x; x--) {
						for (let y = room.y + room.h; y > room.y; y--) {
							matrix[y][x].empty();
						}
					}
					objs = objs.concat(DungeonGenerator.generateEnemies(room, options));
					objs = objs.concat(DungeonGenerator.generateLoot(room, options));
				});

				//carve out paths
				paths.forEach(path => {
					for (let i0 = Math.min(path.x1, path.x2), i1 = Math.max(path.x1, path.x2); i0 < i1 + 1; i0++) {
						matrix[path.y1][i0].empty();
					}
					for (let i0 = Math.min(path.y2, path.y3), i1 = Math.max(path.y2, path.y3); i0 < i1 + 1; i0++) {
						matrix[i0][path.x2].empty();
					}
				});

				//get objs
				for (let y = 0; y < options.size.h; y++) {
					for (let x = 0; x < options.size.w; x++) {
						if (!matrix[y][x].isEmpty) {
							objs.push(matrix[y][x].top);
						}
					}
				}

				return {
					rooms,
					paths,
					objs,
					stairs
				};
			}

			static get defaultOptions() {
				return {
					difficulty: 1,
					stairs: {
						up: false,
						down: true
					},
					size: {
						w: 40,
						h: 20
					},
					rooms: {
						count: 8,
						size: {
							max: {
								w: 8,
								h: 8
							},
							min: {
								w: 3,
								h: 3
							}
						}
					},
					midPoints: {
						count: 2
					},
					paths: {
						count: 8
					},
					enemies: {
						spawnChance: 0.02
					},
					items: {
						spawnChance: 0.001
					}
				};
			}
		};
	}

	static get city() {
		return class {

			static splitWithPath(rect, dir, options) {
				if (rect.w < options.chunks.size.min.w || rect.h < options.chunks.size.min.h) {
					return {
						path: null,
						chunks: []
					};
				}
				let pos = Math.floor(
						Math.random() *
						(rect[dir] - options.chunks.size.min[dir] - options.paths.size - options.chunks.margin * 2) +
						options.chunks.margin
					),
					first = rect.split[dir](),
					second = first[1].split[dir](options.paths.size);

				first[0].type = Rect.type.CHUNK;
				second[0].type = Rect.type.PATH;
				second[1].type = Rect.type.CHUNK;
				return {
					path: second[0],
					chunks: [first[0], second[1]]
				};
			}

			static findLargestRect(splits) {
				if (splits.length <= 1) {
					let a = splits[0].chunks.reduce((pp, cc) => pp.w * pp.h > cc.w * cc.h ? pp : cc);
					let b = splits[0].chunks.reduce((pp, cc) => pp.w * pp.h > cc.w * cc.h ? pp : cc);
					let rect = a.w * a.h > b.w * b.h ? a : b;
					return {
						rect: rect,
						splitIndex: 0,
						chunkIndex: splits[0].chunks.indexOf(rect)
					};
				}
				let split = splits.reduce((p, c, i, arr) => {
					if (c.chunks.length === 0 || p.chunks.length === 0) {
						return p;
					}
					let a = c.chunks.reduce((pp, cc) => pp.w * pp.h > cc.w * cc.h ? pp : cc);
					let b = p.chunks.reduce((pp, cc) => pp.w * pp.h > cc.w * cc.h ? pp : cc);
					return a.w * a.h > b.w * b.h ? c : p;
				}, splits[0]);
				if (split.chunks.length === 0) {
					return {
						rect: null,
						splitIndex: null,
						chunkIndex: null
					};
				}
				let rect = split.chunks.reduce((p, c) => p.w * p.h > c.w * c.h ? p : c),
					splitIndex = splits.indexOf(split),
					chunkIndex = splits[splitIndex].chunks.indexOf(rect);
				return {
					rect: rect,
					splitIndex: splitIndex,
					chunkIndex: chunkIndex
				};
			}

			static splitBase(base, options) {
				let splits = [];
				splits.push(this.splitWithPath(base, "w", options));
				for (let i = 0; i < options.main.splitCount; i++) {
					let largest = this.findLargestRect(splits);
					if (!largest.rect) {
						break;
					}
					let dir = largest.rect.splitDir === "h" ? "w" : "h",
						split = this.splitWithPath(largest.rect, dir, options);
					splits[largest.splitIndex].chunks.splice(largest.chunkIndex, 1);
					splits.push(split);
				}
				return splits;
			}

			static splitChunks(splits, options) {
				let chunks = [].concat.apply([], splits.map((s, i) => {
					s.chunks.forEach(c => c.splitIndex = i);
					return s.chunks;
				}));
				chunks.forEach((chunk, index) => {
					if (chunk.w < options.rooms.size.min.w || chunk.h < options.rooms.size.min.h) {
						return;
					}
					chunk.rooms = [];
					chunk.rooms.push({
						chunks: chunk.split.w()
					});
					for (let i = 0; i < options.chunks.splitCount; i++) {
						let largest = this.findLargestRect(chunk.rooms);
						if (!largest.rect || largest.rect.w < options.rooms.size.min.w || largest.rect.h < options.rooms.size.min.h) {
							break;
						}
						let dir = largest.rect.splitDir === "h" ? "w" : "h",
							split = {
								chunks: largest.rect.split[dir]()
							};
						split.chunks.forEach(s => s.type = Rect.type.ROOM);
						chunk.rooms[largest.splitIndex].chunks.splice(largest.chunkIndex, 1);
						chunk.rooms.push(split);
					}
				});

				return splits.map((s, i) => {
					s.chunks = chunks.filter(c => c.splitIndex === i);
					s.chunks.forEach(c => {
						if (!c.rooms) return;
						//c.rooms.forEach(c => c.chunks.forEach(r => r.shrink(0.5)));
					});
					return s;
				});
			}

			static carveDoors(splits, options) {
				splits.forEach(s => {
					s.doors = [];
					s.chunks.forEach(c => {
						if (!c.rooms) return;
						c.rooms.forEach(rc => {
							rc.chunks.forEach(r => {
								let pathColl = r.intersect(s.path);
								if (pathColl) {
									let door = r.mids[pathColl];
									door.type = Rect.type.DOOR;
									//door.grow(0.5);
									if (pathColl === "top" || pathColl === "bottom") {
										door.h += options.doors.stretch;
										door.y -= options.doors.stretch / 2 | 0;
									} else {
										door.w += options.doors.stretch;
										door.x -= options.doors.stretch / 2 | 0;
									}

									door.x--;
									s.doors.push(door);
								}
								let roomColl = r.intersect(rc.chunks[Math.floor(Math.random() * rc.chunks.length)]);
								if (roomColl) {
									let door = r.mids[roomColl];
									door.type = Rect.type.DOOR;
									//door1.grow(0.5);
									if (roomColl === "top" || roomColl === "bottom") {
										door.h += options.doors.stretch;
										door.y -= options.doors.stretch / 2 | 0;
									} else {
										door.w += options.doors.stretch;
										door.x -= options.doors.stretch / 2 | 0;
									}
									door.y--;
									door.x--;
									s.doors.push(door);
								}
							});
						});
					});
				});
				return splits;
			}

			static makeLevel(player, options) {
				options = options || this.defaultOptions;
				let base = new Rect({
					x: 0,
					y: 0,
					w: options.main.size.w,
					h: options.main.size.h,
					type: Rect.type.CHUNK
				});
				try {
					let bluePrint = this.carveDoors(this.splitChunks(this.splitBase(base, options), options), options),
						rooms = [],
						paths = [],
						matrix = [],
						objs = [];

					//make empty matrix
					for (let y = 0; y < options.main.size.h; y++) {
						matrix[y] = [];
						for (let x = 0; x < options.main.size.w; x++) {
							let tile = new Tile(new Point(x, y));
							matrix[y][x] = tile;
						}
					}

					//fill chunks with walls
					bluePrint.forEach(split => {
						if (!split.path) return;

						split.chunks.forEach(chunk => {
							for (let x = chunk.x + chunk.w; x > chunk.x; x--) {
								for (let y = chunk.y + chunk.h; y > chunk.y; y--) {
									matrix[y - 1][x - 1].add(new Wall(new Point(x, y)));
								}
							}
						});
					});

					bluePrint.forEach(split => {
						if (!split.path) return;

						paths.push(split.path);
						split.chunks.forEach(chunk => {
							if (!chunk.rooms) return;

							chunk.rooms.forEach(rsplit => {
								rsplit.chunks.forEach(room => {
									if (room.type === Rect.type.ROOM) {
										room.shrink(1);
										rooms.push(room);
										//carve out rooms
										for (let x = room.x + room.w; x > room.x; x--) {
											for (let y = room.y + room.h; y > room.y; y--) {
												matrix[y - 1][x - 1].empty();
											}
										}
									}
								});
							});
						});
						//carve out doors
						if (split.doors) {
							split.doors.forEach(door => {
								for (let x = door.x + door.w; x > door.x; x--) {
									for (let y = door.y + door.h; y > door.y; y--) {
										if (matrix[y] && matrix[y][x]) {
											matrix[y][x].empty();
										}
									}
								}
							});
						}
					});

					let stairs = {};

					//set player to first room
					player.position.set(rooms[0].x + 1, rooms[0].y + 2);
					objs.push(player);
					matrix[player.position.y][player.position.x].empty();

					if (options.stairs.up) {
						//put an upstairs on player
						let pos = new Point(...player.position.get);
						objs.push(new Stair(pos, "up"));
						stairs.up = pos;
					}

					if (options.stairs.down) {
						//put a downstairs in largest room
						let largest = rooms.reduce((p, c) => p.w * p.h > c.w * c.h ? p : c),
							pos = new Point(largest.x + largest.w - 1, largest.y + largest.h - 1);
						objs.push(new Stair(pos, "down"));
						stairs.down = pos;
					}

					//spawn enemies
					//and loot
					rooms.forEach(room => {
						objs = objs.concat(DungeonGenerator.generateEnemies(room, options));
						objs = objs.concat(DungeonGenerator.generateLoot(room, options));
					});

					//get objs
					for (let y = 0; y < options.main.size.h; y++) {
						for (let x = 0; x < options.main.size.w; x++) {
							if (!matrix[y][x].isEmpty) {
								objs.push(matrix[y][x].top);
							}
						}
					}
					return {
						rooms,
						paths,
						objs,
						stairs
					};
				} catch (err) {
					throw err;
				}
			}

			static get defaultOptions() {
				return {
					main: {
						size: {
							w: 40,
							h: 20
						},
						splitCount: 6
					},
					difficulty: 1,
					stairs: {
						up: false,
						down: true
					},
					paths: {
						size: 2
					},
					chunks: {
						size: {
							min: {
								w: 5,
								h: 5
							}
						},
						margin: 5,
						splitCount: 2
					},
					rooms: {
						size: {
							min: {
								w: 4,
								h: 4
							},
							max: {
								w: 10,
								h: 10
							}
						}
					},
					doors: {
						stretch: 3
					},
					enemies: {
						spawnChance: 0.02
					},
					items: {
						spawnChance: 0.009
					}
				};
			}
		};
	}

	static get cave() {
		return class {

			static border(matrix) {
				for (let x = 0; x < matrix[0].length; x++) {
					matrix[0][x].empty();
					matrix[0][x].add(new Wall(new Point(x, 0)));
					matrix[matrix.length - 1][x].empty();
					matrix[matrix.length - 1][x].add(new Wall(new Point(x, matrix.length - 1)));
				}
				for (let y = 0; y < matrix.length; y++) {
					matrix[y][0].empty();
					matrix[y][0].add(new Wall(new Point(0, y)));
					matrix[y][matrix[0].length - 1].empty();
					matrix[y][matrix[0].length - 1].add(new Wall(new Point(matrix[0].length - 1, y)));
				}

				return matrix;
			}

			static neighbors(matrix, x, y, radius) {
				let neighbors = [];

				for (let x0 = x - radius; x0 <= x + radius; x0++) {
					for (let y0 = y - radius; y0 <= y + radius; y0++) {
						if ((x0 === x && y0 === y) || !matrix[y0]) {
							continue;
						}
						neighbors.push(matrix[y0][x0]);
					}
				}

				return neighbors.filter(v => v);
			}

			static updateState(matrix, x, y, options) {
				let neighbors1 = this.neighbors(matrix, x, y, 1),
					type = matrix[y][x].top ? "wall" : "floor";

				if (neighbors1.filter(nT => nT.top && nT.top.constructor === Wall).length >= options.nearCap) {
					return {
						type: Wall,
						changed: type !== "wall",
						pos: new Point(x, y)
					};
				}

				let neighbors2 = this.neighbors(matrix, x, y, 2);
				if (neighbors2.filter(nT => nT.top && nT.top.constructor === Wall).length <= options.farCap) {
					return {
						type: Wall,
						changed: type !== "wall",
						pos: new Point(x, y)
					};
				}

				return {
					type: null,
					changed: type !== "floor",
					pos: new Point(x, y)
				};
			}

			static makeLevel(player, options) {
				options = options || this.defaultOptions;

				let matrix = [],
					objs = [];

				//make matrix and fill it randomly with walls
				for (let y = 0; y < options.size.h; y++) {
					matrix[y] = [];
					for (let x = 0; x < options.size.w; x++) {
						matrix[y][x] = new Tile(new Point(x, y));
						if (Math.random() < options.distribution) {

						} else {
							matrix[y][x].add(new Wall(new Point(x, y)));
						}
					}
				}

				//clear some rows in the middle to help with gaps in the map
				if (options.horizontalBlank) {
					let offset = ~~(options.size.h / 2),
						end = ~~(options.size.h / 2) - offset + options.horizontalBlank;
					for (let y = ~~(options.size.h / 2) - offset; y < end; y++) {
						matrix[y].forEach(tile => tile.empty());
					}
				}

				for (let i = 0; i < options.iterationCount; i++) {
					let newStates = [];

					//compute all states
					matrix.forEach((row, y) => row.forEach((tile, x) => {
						newStates.push(this.updateState(matrix, x, y, options));
					}));

					//then update matrix
					newStates.forEach(state => {
						if (state.changed) {
							if (state.type) {
								matrix[state.pos.y][state.pos.x].add(new state.type(state.pos));
							} else {
								matrix[state.pos.y][state.pos.x].empty();
							}
						}
					});

					if (options.border) {
						matrix = this.border(matrix);
					}

					if (i > options.smoothCap) {
						options.farCap = -1;
					}
				}

				let stairs = {};

				if (options.stairs.up) {
					let pos = new Point(Math.floor(Math.random() * options.size.w), Math.floor(Math.random() * options.size.h));

					while (true) {
						if (matrix[pos.y] && matrix[pos.y][pos.x] && matrix[pos.y][pos.x].isEmpty) {
							break;
						} else {
							pos.set(Math.floor(Math.random() * options.size.w), Math.floor(Math.random() * options.size.h));
						}
					}

					player.position.set(...pos.get);
					objs.push(player);

					objs.push(new Stair(pos, "up"));
					stairs.up = pos;
				}

				if (options.stairs.down) {
					let pos = new Point(Math.floor(Math.random() * options.size.w, Math.floor(Math.random() * options.size.h)));

					while (true) {
						if (matrix[pos.y] && matrix[pos.y][pos.x] && matrix[pos.y][pos.x].isEmpty) {
							break;
						} else {
							pos.set(Math.floor(Math.random() * options.size.w), Math.floor(Math.random() * options.size.h));
						}
					}

					objs.push(new Stair(pos, "down"));
					stairs.down = pos;
				}

				//spawn some enemies using the entire map as the room
				//filter out the ones spawned in walls
				let enemies = DungeonGenerator.generateEnemies({
					x: 0,
					y: 0,
					w: options.size.w - 1,
					h: options.size.h - 1
				}, options).filter(e => {
					if(matrix[e.position.y][e.position.x].isEmpty){
						return true;
					}else{
						e.lifebar.remove();
						return false;
					}
				});

				objs = objs.concat(enemies);

				let loot = DungeonGenerator.generateLoot({
					x: 0,
					y: 0,
					w: options.size.w - 1,
					h: options.size.h - 1
				}, options).filter(i => matrix[i.position.y][i.position.x].isEmpty);

				objs = objs.concat(loot);

				//get objs
				for (let y = 0; y < options.size.h; y++) {
					for (let x = 0; x < options.size.w; x++) {
						if (!matrix[y][x].isEmpty) {
							objs.push(matrix[y][x].top);
						}
					}
				}
				return {
					objs: objs,
					paths: [],
					rooms: [],
					stairs: stairs
				};
			}

			static get defaultOptions() {
				return {
					size: {
						w: 40,
						h: 20
					},
					stairs: {
						up: false,
						down: true
					},
					iterationCount: 7,
					distribution: 0.46,
					border: true,
					nearCap: 5,
					farCap: 1,
					smoothCap: 5,
					horizontalBlank: 1,
					enemies: {
						spawnChance: 0.015
					},
					items: {
						spawnChance: 0.05
					}
				};
			}
		};
	}
};

/* @depends ../abstract/creature.class.js */
const Player = class Player extends Creature {
	constructor(position, stats) {
		super(position, stats);
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

		this.equipment.head = new Armor("head", "Bronze helmet", 1);

		this.equipment.weapon = new Weapon("Blunt Dagger", 1, 5);

		this.lifebar = new Lifebar(this.id, "Hero", document.getElementById("info-container-player"), this.stats);
		this.flavorName = "you";
		this.flavor = "Hi mom!";
		//todo: store username here?
	}
};

/*
@depends ../core/game.class.js
@depends ../objs/player.class.js
*/

var game = new Game(
	new TileGroup(null, {
		origin: new Point(0, 0),
		baseColor: "slategrey",
		tileSize: 25,
		spacing: 1,
		w: 40,
		h: 20
	}), Utils.loadGame() || DungeonGenerator.traditional.makeLevel(new Player(new Point(10,10)))
);
//Utils.initUIButtons(game);

if (env === "dev") {
	Utils.exportObjs(Utils.exports);
} else if (env === "prod") {

} else {
	throw new TypeError("Invalid environment");
}

game.start();

(function() {
	var elems = Array.from(document.querySelectorAll(".moveable, .resizeable"));

	var dragging = false,
		selected,
		elemX = 0,
		elemY = 0;

	function move(e) {
		if (e.target.classList.contains("moveable-anchor")) {
			e.stopPropagation();
			//e.cancelBubble();
			e.preventDefault();
			let x = e.pageX;
			let y = e.pageY;
			if (x === undefined) {
				x = e.touches[0].pageX;
				y = e.touches[0].pageY;
			}
			elemX = x - elem.offsetLeft;
			elemY = y - elem.offsetTop;
			dragging = "body";
			selected = elem;
		}
	}

	function startr(e) {
		e.stopPropagation();
		//e.cancelBubble();
		e.preventDefault();
		dragging = "right";
		selected = elem;
	}

	function startb(e) {
		e.stopPropagation();
		//e.cancelBubble();
		e.preventDefault();
		dragging = "bottom";
		selected = elem;
	}

	elems.forEach(elem => {
		let right = document.createElement("div"),
			bottom = document.createElement("div");
		right.classList.add("edge");
		bottom.classList.add("edge");

		right.classList.add("edge-right");
		bottom.classList.add("edge-bottom");

		if (elem.classList.contains("moveable")) {
			elem.addEventListener("mousedown", move);
			elem.addEventListener("touchstart", move);
		}

		if (elem.classList.contains("resizeable")) {
			bottom.addEventListener("mousedown", startb);
			bottom.addEventListener("touchstart", startb);
			right.addEventListener("mousedown", startr);
			right.addEventListener("touchstart", startr);

			elem.appendChild(right);
			elem.appendChild(bottom);
		}
	});

	function gmove(e) {
		//e.preventDefault();
		if (dragging && selected) {
			let x = e.pageX;
			let y = e.pageY;
			if (x === undefined) {
				x = e.touches[0].pageX;
				y = e.touches[0].pageY;
			}
			if (dragging === "right") {
				selected.style.width = selected.offsetWidth + (x - selected.offsetWidth) - selected.offsetParent.offsetLeft - selected.offsetLeft + "px";
			} else if (dragging === "bottom") {
				selected.style.height = selected.offsetHeight + (y - selected.offsetHeight) - selected.offsetParent.offsetTop - selected.offsetTop + "px";
			} else if (dragging === "body") {
				selected.style.top = y - elemY + "px";
				selected.style.left = x - elemX + "px";
			}
		}
	}

	document.addEventListener("mousemove", gmove);
	document.addEventListener("touchmove", gmove);

	function end(e) {
		e.stopPropagation();
		//e.cancelBubble();
		//e.preventDefault();
		dragging = false;
		selected = undefined;
	}

	document.addEventListener("mouseup", end);
	document.addEventListener("touchend", end);
})();

}(window));