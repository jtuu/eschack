"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (global) {
	"use strict";
	//these contain the logic for actions but they will be used on the actor
	//the context shouldnt be changed but the action can be reused
	//even on different actors
	//maybe these should be stored in a pool somewhere...?

	var Action = function () {
		function Action(context, logger) {
			_classCallCheck(this, Action);

			if (this.constructor === Action) {
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


		Action.prototype.try = function _try(actor) {
			console.warn("Unimplemented method '" + arguments.callee + "' in " + this.constructor.name);
		};

		//execute action


		Action.prototype.do = function _do(actor) {
			console.warn("Unimplemented method '" + arguments.callee + "' in " + this.constructor.name);
		};

		return Action;
	}();
	//Object.values polyfill
	if (!Object.values) {
		Object.values = function (obj) {
			return Object.keys(obj).map(function (key) {
				return obj[key];
			});
		};
	}

	//should these be scopewide?
	var env = "prod",
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
	var mainCtx = mainCanvas.getContext("2d"),
	    secondCtx = secondCanvas.getContext("2d");
	mainCtx.font = "20px Consolas";
	mainCtx.textAlign = "center";

	var objectCounter = 0;

	//just a xy point
	var Point = function () {
		function Point(x, y) {
			_classCallCheck(this, Point);

			this.x = x;
			this.y = y;
		}

		//set values from array input


		Point.prototype.set = function set(x, y) {
			if (x.constructor === Array) {
				this.x = x[0];
				this.y = x[1];
			} else {
				this.x = x;
				this.y = y;
			}
		};

		//get get get get got got got got
		//return xy as array


		//relative move

		Point.prototype.moveBy = function moveBy(vector) {
			var _vector$get = vector.get;
			var x = _vector$get[0];
			var y = _vector$get[1];

			this.x += x;
			this.y += y;
		};

		//get manhattan distance vector between two points


		Point.distance = function distance(point1, point2) {
			return new Vector(point2.x - point1.x, point2.y - point1.y);
		};

		//compare two points


		Point.equal = function equal(point1, point2) {
			return point1.x === point2.x && point1.y === point2.y;
		};

		//check if point is inside given bounds


		Point.prototype.in = function _in(bounds) {
			return this.x >= bounds.x && this.x <= bounds.x + bounds.w && this.y >= bounds.y && this.y <= bounds.y + bounds.h;
		};

		_createClass(Point, [{
			key: "get",
			get: function get() {
				return [this.x, this.y];
			}
		}]);

		return Point;
	}();
	/* @depends ../core/point.class.js */
	//basically any gameobject that takes up a whole tile is a GameObject
	//this is the base class so uhhh let's not allow instantiation
	var GameObject = function () {
		function GameObject(position) {
			_classCallCheck(this, GameObject);

			if (this.constructor === GameObject) {
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
			this.glyph = "⚠"; //cool warning sign character (?)
			this.color = "black";
			this.flavorName = "OBJ"; //name mainly used in log messages
			this.type = this.constructor.name; //used in identifying objects when loading from json
		}

		GameObject.prototype.update = function update() {
			console.warn("Unimplemented method 'update' in " + this.constructor.name);
		};

		//recreate class from plain obj

		GameObject.from = function from(obj) {
			var point = null;
			if (obj.position) {
				point = new Point(obj.position.x, obj.position.y);
			}
			var newObj = new this(point, obj.stats);

			var exempt = ["lifebar", "position", "inventory", "equipment"];

			for (var key in obj) {
				if (!exempt.includes(key)) {
					newObj[key] = obj[key];
				}
			}
			newObj.inventory = [];
			for (var _key in obj.inventory) {
				newObj.inventory[_key] = eval(obj.inventory[_key].type).from(obj.inventory[_key]);
			}
			newObj.equipment = [];
			for (var _key2 in obj.equipment) {
				newObj.equipment[_key2] = eval(obj.equipment[_key2].type).from(obj.equipment[_key2]);
			}

			return newObj;
		};

		GameObject.prototype.toString = function toString() {
			return this.type;
		};

		_createClass(GameObject, [{
			key: "isAlive",
			get: function get() {
				return this.hasOwnProperty("stats") ? this.stats.HP > 0 : true;
			}
		}]);

		return GameObject;
	}();
	var Lifebar = function () {
		function Lifebar(id, name, container, stats) {
			_classCallCheck(this, Lifebar);

			this.id = id;
			this.name = name;
			this.stats = stats;

			this.container = container;

			var label = document.createElement("label");
			label.setAttribute("for", "bar-lifebar-" + this.name + "-" + this.id);
			label.innerHTML = this.name;
			this.label = label;

			var bar = document.createElement("div");
			bar.className = "bar bar-lifebar";
			bar.id = "bar-lifebar-" + this.name + "-" + this.id;
			this.bar = bar;

			this.set();

			this.container.appendChild(label);
			this.label.appendChild(bar);
		}

		Lifebar.prototype.set = function set(value) {
			if (!isNaN(value)) {
				this.value = value;
			}
			this.bar.setAttribute("data-content", this.stats.HP + "/" + this.stats.maxHP);

			//approximate visual size, range [0...100]
			//do we need more precision? is this too much precision?
			var sizeClass = "bar-size-" + Math.max(Math.floor(this.stats.HP / this.stats.maxHP * 100), 0);
			if (this.bar.className.match(/size/)) {
				this.bar.className = this.bar.className.replace(/bar-size-[0-9]{1,3}/, sizeClass);
			} else {
				this.bar.classList.add(sizeClass);
			}
		};

		Lifebar.prototype.setStyle = function setStyle(style) {
			var _this = this;

			var styles = {
				"hilight": "hilighted",
				"default": "default"
			};
			style = styles[style];
			if (style) {
				//remove other styles
				Object.values(styles).filter(function (v) {
					return v !== style;
				}).forEach(function (f) {
					_this.bar.classList.remove(f);
					_this.label.classList.remove(f);
				});

				this.bar.classList.add(style);
				this.label.classList.add(style);
			}
		};

		//remove from dom


		Lifebar.prototype.remove = function remove() {
			this.bar.remove();
			this.label.remove();
		};

		Lifebar.prototype.hide = function hide() {
			this.bar.style.display = "none";
			this.label.style.display = "none";
		};

		Lifebar.prototype.show = function show() {
			this.bar.style.display = "";
			this.label.style.display = "";
		};

		return Lifebar;
	}();

	/* @depends ../ui/lifebar.class.js */
	var MoveBlocking = function MoveBlocking(Base) {
		return function (_Base) {
			_inherits(_class, _Base);

			function _class() {
				_classCallCheck(this, _class);

				return _possibleConstructorReturn(this, _Base.apply(this, arguments));
			}

			_createClass(_class, [{
				key: "isMoveBlocking",
				get: function get() {
					return true;
				}
			}]);

			return _class;
		}(Base);
	};
	var VisionBlocking = function VisionBlocking(Base) {
		return function (_Base2) {
			_inherits(_class2, _Base2);

			function _class2() {
				_classCallCheck(this, _class2);

				return _possibleConstructorReturn(this, _Base2.apply(this, arguments));
			}

			_createClass(_class2, [{
				key: "isVisionBlocking",
				get: function get() {
					return true;
				}
			}]);

			return _class2;
		}(Base);
	};

	var Hittable = function Hittable(Base) {
		return function (_Base3) {
			_inherits(_class3, _Base3);

			function _class3() {
				_classCallCheck(this, _class3);

				return _possibleConstructorReturn(this, _Base3.apply(this, arguments));
			}

			_class3.prototype.takeDamage = function takeDamage(damage, logger) {
				this.stats.HP -= damage;
				if (this.lifebar) this.lifebar.set(this.stats.HP);
				if (this.stats.HP <= 0) {
					this.die(logger);
					return true;
				}
				return false;
			};

			_class3.prototype.die = function die(logger) {
				if (logger) logger.log(this.flavorName + " died", "death");
				if (this.lifebar && this.type !== "Player") this.lifebar.remove();
			};

			_createClass(_class3, [{
				key: "isHittable",
				get: function get() {
					return true;
				}
			}]);

			return _class3;
		}(Base);
	};
	/* @depends gameobject.class.js */
	var Item = function (_GameObject) {
		_inherits(Item, _GameObject);

		function Item(position) {
			_classCallCheck(this, Item);

			var _this5 = _possibleConstructorReturn(this, _GameObject.call(this, position));

			_this5.canDrop = true;
			return _this5;
		}

		Item.prototype.update = function update() {
			return true;
		};

		return Item;
	}(GameObject);
	/* @depends ../abstract/item.class.js */
	var Weapon = function (_Item) {
		_inherits(Weapon, _Item);

		//todo: basespeed (weight?), special properties (cleave, reach)
		//stuff

		function Weapon(name, damage, speed) {
			_classCallCheck(this, Weapon);

			var _this6 = _possibleConstructorReturn(this, _Item.call(this, null));

			_this6.slot = "weapon";
			_this6.damage = damage || 1;
			_this6.speed = speed || 10;
			_this6.name = name;

			_this6.glyph = "(";
			_this6.color = "red";
			_this6.bgColor = TILE_COLOR;
			_this6.flavorName = _this6.name;
			return _this6;
		}

		Weapon.prototype.toString = function toString() {
			return this.name + " (" + this.damage + ", " + this.speed + ")";
		};

		return Weapon;
	}(Item);
	/* @depends ../abstract/item.class.js */
	var Armor = function (_Item2) {
		_inherits(Armor, _Item2);

		function Armor(slot, name, defence) {
			_classCallCheck(this, Armor);

			var _this7 = _possibleConstructorReturn(this, _Item2.call(this, null));

			_this7.slot = slot;
			_this7.name = name;
			_this7.defence = defence;

			_this7.glyph = "[";
			_this7.color = "cyan";
			_this7.bgColor = TILE_COLOR;
			_this7.flavorName = _this7.name;
			return _this7;
		}

		Armor.prototype.toString = function toString() {
			return this.name + " (" + this.defence + ")";
		};

		return Armor;
	}(Item);
	/*
 @depends ../core/globals.js
 @depends ../abstract/gameobject.class.js
 @depends ../misc/mixins.js
 @depends ../objs/weapon.class.js
 @depends ../objs/armor.class.js
  */
	//any living dead undead whatever creature
	var Creature = function (_Hittable) {
		_inherits(Creature, _Hittable);

		function Creature(position, stats, weapon) {
			_classCallCheck(this, Creature);

			//actions actually contains arrays of actions

			var _this8 = _possibleConstructorReturn(this, _Hittable.call(this, position));

			_this8.actions = [];

			var self = _this8;
			_this8.stats = stats || {
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
					return Object.keys(self.equipment).filter(function (k) {
						return self.equipment[k] && self.equipment[k].constructor === Armor;
					}).reduce(function (p, c) {
						return self.equipment[c].defence + p;
					}, 0);
				}
			};

			_this8.inventory = [];
			_this8.equipment = {
				"weapon": weapon || new Weapon("Fists"),
				"head": null,
				"body": null,
				"hands": null,
				"legs": null,
				"feet": null
			};

			_this8.flavorName = "creature";
			_this8.flavor = "It is mundane."; //flavor text used in examine

			_this8.killcount = 0;
			return _this8;
		}

		//oh boy


		Creature.prototype.update = function update(logger) {
			var _this9 = this;

			var time = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];


			var updateCount = 0,
			    elapsedTime = 0;

			//go through all the possible actions given by actionmanager and
			//test their logic in the gameobjects context
			//they should already be in prioritized order so
			//we just use the first one that succeeds
			this.actions.forEach(function (proposals) {
				//actually they contain functions that create the action instances so yeah
				try {
					var chosen = void 0;

					proposals.some(function (p) {
						var action = p();
						if (action.try(_this9, time)) {
							chosen = action;
							return true;
						} else {
							return false;
						}
					});
					elapsedTime += chosen.do(_this9);
					updateCount++;
				} catch (err) {
					// console.warn("None of the proposed actions were suitable for " + this.constructor.name);
					// console.log(err);
				}
			});

			for (var i = 0; i < updateCount; i++) {
				this.actions.shift();
			}

			return elapsedTime;
		};

		Creature.prototype.gainXP = function gainXP(amount) {
			this.stats.XP += amount;

			if (this.stats.XP >= BASE_XP * Math.pow(this.stats.XL + 1, BASE_XP_GROWTH)) {
				return this.levelUp();
			}
			return false;
		};

		Creature.prototype.levelUp = function levelUp() {
			this.stats.XL++;
			var possibleStats = ["maxHP", "STR", "INT", "DEX"],
			    chosenStat = possibleStats[Math.floor(Math.random() * possibleStats.length)];

			this.stats[chosenStat]++;
			if (chosenStat === "maxHP") {
				this.lifebar.set();
			}
			return chosenStat;
		};

		Creature.prototype.toString = function toString() {
			return this.type + "<br>" + this.stats.HP + " HP<br>" + this.flavor + "<br>" + this.equipment.weapon.damage + " ATT";
		};

		_createClass(Creature, [{
			key: "items",
			get: function get() {
				var items = this.inventory.concat(Object.values(this.equipment)).filter(function (v) {
					return v;
				});
				return items;
			}
		}]);

		return Creature;
	}(Hittable(MoveBlocking(GameObject)));

	/* @depends gameobject.class.js */
	var DungeonFeature = function (_GameObject2) {
		_inherits(DungeonFeature, _GameObject2);

		function DungeonFeature(position) {
			_classCallCheck(this, DungeonFeature);

			return _possibleConstructorReturn(this, _GameObject2.call(this, position));
		}

		return DungeonFeature;
	}(GameObject);
	/* @depends creature.class.js */
	//maybe this should be abstract
	var Enemy = function (_Creature) {
		_inherits(Enemy, _Creature);

		function Enemy(position, stats, weapon) {
			_classCallCheck(this, Enemy);

			var _this11 = _possibleConstructorReturn(this, _Creature.call(this, position, stats, weapon));

			_this11.actions = [];
			_this11.bgColor = "hsl(30, 30%, 45%)";
			_this11.glyph = "E";
			_this11.color = "white";

			_this11.stats.maxHP = 3;
			_this11.stats.HP = 3;
			_this11.stats.viewDistance = 7;
			_this11.stats.moveSpeed = 9;
			_this11.stats.XP = 1;

			_this11.stats = stats || _this11.stats;

			_this11.flavorName = "the enemy";
			_this11.flavor = "It has a fearsome visage.";
			return _this11;
		}

		Enemy.prototype.toString = function toString() {
			return this.type + "<br>Lvl. " + this.stats.XL + "<br>" + (this.noticed ? "It has noticed you." : "It has not noticed you.") + "<br>" + this.flavor;
		};

		Enemy.prototype.createLifebar = function createLifebar() {
			this.lifebar = new Lifebar(this.id, this.type, document.getElementById("info-container-other-life"), this.stats);
		};

		return Enemy;
	}(Creature);

	var Vector = function () {
		function Vector(u, v) {
			_classCallCheck(this, Vector);

			//if no arguments, use random values in [-1, 0, 1]
			this.u = isNaN(u) ? Math.sign(Math.random() * 10 - 5) : u;
			this.v = isNaN(v) ? Math.sign(Math.random() * 10 - 5) : v;
		}

		Vector.prototype.set = function set(arr) {
			this.u = arr[0];
			this.v = arr[1];
		};

		//basically this just sets the larger
		//absolute value to 1 and the smaller to 0

		Vector.prototype.reduce = function reduce() {
			var vals = this.get;
			var absmax = Math.max.apply(null, vals.map(Math.abs));
			this.set(vals.map(function (v) {
				return Math.round(v / absmax);
			}));
		};

		_createClass(Vector, [{
			key: "get",
			get: function get() {
				return [this.u, this.v];
			}
		}]);

		return Vector;
	}();
	/* @depends ../core/vector.class.js */
	//handle key related stuff and i guess also some action mapping lol
	var KeyHandler = function () {
		function KeyHandler() {
			_classCallCheck(this, KeyHandler);

			this.use("default");
		}

		KeyHandler.prototype.use = function use() {
			var map = arguments.length <= 0 || arguments[0] === undefined ? "default" : arguments[0];

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

					68: { use: "inventorydialog", act: "drop" }, //d
					87: { use: "inventorydialog", act: "equip" }, //w
					84: { use: "inventorydialog", act: "unequip" }, //t

					60: "up", //<
					226: "up", //chrome...

					0: "cheat"

				};

				this.actionMap = {
					"n": function n() {
						return new Vector(0, -1);
					},
					"w": function w() {
						return new Vector(-1, 0);
					},
					"s": function s() {
						return new Vector(0, 1);
					},
					"e": function e() {
						return new Vector(1, 0);
					},
					"ne": function ne() {
						return new Vector(1, -1);
					},
					"se": function se() {
						return new Vector(1, 1);
					},
					"sw": function sw() {
						return new Vector(-1, 1);
					},
					"nw": function nw() {
						return new Vector(-1, -1);
					},
					"c": null,
					"pickup": "pickup",
					"up": "stair",
					"down": "stair",
					"cheat": "cheat"
				};
			} else if (map === "inventorydialog") {
				this.using = "inventorydialog";
				this.keyCases = "abcdefghijklmnopqrstuvwxyz".split("").reduce(function (p, c) {
					return p[c.toUpperCase().charCodeAt(0)] = c, p;
				}, {});
			}
		};

		//input is a key or a keycode
		//returns action instruction


		KeyHandler.prototype.get = function get(key) {
			if (_typeof(this.keyCases[key]) === "object") {
				this.act = this.keyCases[key].act;
				this.use(this.keyCases[key].use);
				return this.act;
			} else if (this.using === "inventorydialog") {
				var val = this.keyCases[key];
				//return default
				this.use();
				return this.act + ":" + val;
			}
			this.act = undefined;
			return this.actionMap[this.keyCases[key]];
		};

		return KeyHandler;
	}();

	/* @depends ../abstract/dungeonfeature.class.js */
	var Stair = function (_GameObject3) {
		_inherits(Stair, _GameObject3);

		function Stair(position, direction) {
			_classCallCheck(this, Stair);

			var _this12 = _possibleConstructorReturn(this, _GameObject3.call(this, position));

			_this12.direction = direction;
			_this12.bgColor = "hsl(0,0%,35%)";

			if (_this12.direction === "up") {
				_this12.glyph = "<";
			} else if (_this12.direction === "down") {
				_this12.glyph = ">";
			}
			_this12.color = "hsl(0,0%,75%)";
			_this12.flavorName = _this12.direction + "stair";
			return _this12;
		}

		Stair.prototype.update = function update() {
			return 0;
		};

		Stair.prototype.toString = function toString() {
			return "A staircase going " + this.direction;
		};

		return Stair;
	}(GameObject);
	/* @depends ../abstract/dungeonfeature.class.js */
	//todo: create base class Inanimate or something
	var Wall = function (_VisionBlocking) {
		_inherits(Wall, _VisionBlocking);

		function Wall(position) {
			_classCallCheck(this, Wall);

			var _this13 = _possibleConstructorReturn(this, _VisionBlocking.call(this, position));

			_this13.bgColor = "hsl(0,0%,15%)";
			_this13.glyph = "▉"; //some block character
			_this13.color = "hsl(0,0%,25%)";
			_this13.flavorName = "wall";
			return _this13;
		}

		Wall.prototype.update = function update() {
			return 0;
		};

		return Wall;
	}(VisionBlocking(MoveBlocking(DungeonFeature)));
	/* @depends ../abstract/enemy.class.js */
	var Honeybadger = function (_Enemy) {
		_inherits(Honeybadger, _Enemy);

		function Honeybadger(position) {
			_classCallCheck(this, Honeybadger);

			var _this14 = _possibleConstructorReturn(this, _Enemy.call(this, position, null, new Weapon("Claws", 4, 11)));

			_this14.bgColor = "hsl(25, 5%, 10%)";
			_this14.glyph = "B";
			_this14.color = "hsl(5, 5%, 90%)";

			_this14.equipment.weapon.canDrop = false;

			_this14.stats.maxHP = 10;
			_this14.stats.HP = 10;
			_this14.stats.viewDistance = 7;
			_this14.stats.moveSpeed = 10;
			_this14.flavorName = "the honeybadger";
			_this14.flavor = "Notorious for their ferocity.";
			_this14.createLifebar();
			return _this14;
		}

		return Honeybadger;
	}(Enemy);
	/* @depends ../abstract/enemy.class.js */
	var Jackalope = function (_Enemy2) {
		_inherits(Jackalope, _Enemy2);

		function Jackalope(position) {
			_classCallCheck(this, Jackalope);

			var _this15 = _possibleConstructorReturn(this, _Enemy2.call(this, position, null, new Weapon("Antlers", 2, 5)));

			_this15.bgColor = "hsl(35, 25%, 65%)";
			_this15.glyph = "J";
			_this15.color = "hsl(35, 35%, 5%)";

			_this15.equipment.weapon.canDrop = false;

			_this15.stats.maxHP = 6;
			_this15.stats.HP = 6;
			_this15.stats.viewDistance = 7;
			_this15.stats.moveSpeed = 8;
			_this15.flavorName = "the jackalope";
			_this15.flavor = "A large agressive rabbit with antlers on its head.";
			_this15.createLifebar();
			return _this15;
		}

		return Jackalope;
	}(Enemy);
	/* @depends ../abstract/enemy.class.js */
	var Redcap = function (_Enemy3) {
		_inherits(Redcap, _Enemy3);

		function Redcap(position) {
			_classCallCheck(this, Redcap);

			var _this16 = _possibleConstructorReturn(this, _Enemy3.call(this, position, null, null));

			_this16.bgColor = "hsl(66, 10%, 70%)";
			_this16.glyph = "^";
			_this16.color = "hsl(0, 80%, 60%)";

			_this16.stats.maxHP = 10;
			_this16.stats.HP = 10;
			_this16.stats.viewDistance = 7;
			_this16.stats.moveSpeed = 10;
			_this16.flavorName = "the redcap";
			_this16.flavor = "A malevolent murderous dwarf-like creature.";
			_this16.createLifebar();

			_this16.canWield = true;
			_this16.canWear = true;
			return _this16;
		}

		return Redcap;
	}(Enemy);
	/*
 @depends ../objs/stair.class.js
 @depends ../objs/wall.class.js
 @depends monsters/honeybadger.class.js
 @depends jackalope.class.js
 @depends redcap.class.js
  */
	var Utils = function () {
		function Utils() {
			_classCallCheck(this, Utils);
		}

		Utils.rotate = function rotate(arr, angle) {
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
		};

		//http://stackoverflow.com/a/4492703


		Utils.transpose = function transpose(arr) {
			var w = arr.length ? arr.length : 0,
			    h = arr[0] instanceof Array ? arr[0].length : 0;

			if (h === 0 || w === 0) {
				return [];
			}

			var i,
			    j,
			    t = [];
			for (i = 0; i < h; i++) {
				t[i] = [];
				for (j = 0; j < w; j++) {
					t[i][j] = arr[j][i];
				}
			}
			return t;
		};

		//algorithm taken from here
		//http://www.roguebasin.com/index.php?title=Isaac_s_fast_beamcasting_LOS
		//and modified


		Utils.beamcast = function beamcast(matrix) {
			var visible = [];
			for (var i = 0; i < matrix.length; i++) {
				visible[i] = Array.from(Array(matrix.length));
			}

			//0,0 will always be visible
			visible[0][0] = matrix[0][0];

			//check orthogonals
			var ox = 0;
			while (matrix[ox] && matrix[ox][0]) {
				visible[ox][0] = matrix[ox][0];
				if (matrix[ox][0].top && matrix[ox][0].top.isVisionBlocking) {
					break;
				}
				ox++;
			}
			var oy = 0;
			while (matrix[0] && matrix[0][oy]) {
				visible[0][oy] = matrix[0][oy];
				if (matrix[0][oy].top && matrix[0][oy].top.isVisionBlocking) {
					break;
				}
				oy++;
			}

			//beams
			for (var slope = 1, slopeCount = 31; slope <= slopeCount; slope++) {
				var v = slope,
				    min = 0,
				    max = slopeCount;
				for (var u = 0; min <= max; u++) {
					var y = v >> 5,
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
		};

		Utils.mergeQuarters = function mergeQuarters(quarters) {
			//quarters.nw + quarters.ne
			//            +
			//quarters.sw + quarters.se

			var upper = quarters.nw.map(function (row, k) {
				//pop last column of left because it is identical to the first column of right
				row.pop();

				//merge rows of left and right
				return row.concat(quarters.ne[k]);
			});

			var lower = quarters.sw.map(function (row, k) {
				row.pop();
				return row.concat(quarters.se[k]);
			});

			//pop last row of upper because it is identical to the first row of lower
			upper.pop();

			//merge upper and lower
			return upper.concat(lower);
		};

		Utils.saveGame = function saveGame(instance) {
			var save = {};
			//all we need is the objs
			//in Game.start they will get inserted
			save.objs = instance.objs;
			//remove fov because of circular reference
			save.objs.forEach(function (obj) {
				return delete obj.fov;
			});

			localStorage.setItem(saveName, LZString.compress(JSON.stringify(save)));
			console.log("Game saved");
		};

		Utils.loadGame = function loadGame() {
			var save = JSON.parse(LZString.decompress(localStorage.getItem(saveName)) || null);

			if (save) {
				var _ret = function () {
					var objMap = {
						"Wall": Wall,
						"Creature": Creature,
						"Enemy": Enemy,
						"Player": Player,
						"Item": Item,
						"Weapon": Weapon
					};

					var objs = [];
					save.objs.forEach(function (obj) {
						if (obj) {
							if (objMap[obj.type]) {
								objs[obj.id] = objMap[obj.type].from(obj);
							}
						}
					});
					console.log("Savedata loaded");
					return {
						v: objs
					};
				}();

				if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
			} else {
				console.log("No existing savedata found");
				return null;
			}
		};

		Utils.deleteSave = function deleteSave() {
			localStorage.removeItem(saveName);
			console.log("Savedata deleted");
		};

		//convert screen coordinates to game coordinates

		Utils.screenToGame = function screenToGame(point, tileSize, spacing) {
			return new Point(Math.floor(point.x / (tileSize + spacing)), Math.floor(point.y / (tileSize + spacing)));
		};

		//convert game coordinates to screen coordinates


		Utils.gameToScreen = function gameToScreen(point, tileSize, spacing) {
			return new Point(point.x * (tileSize + spacing), point.y * (tileSize + spacing));
		};

		//convert screen coordinates to conform to tiles


		Utils.screenToTiles = function screenToTiles(point, tileSize, spacing) {
			return Utils.gameToScreen(Utils.screenToGame(point, tileSize, spacing), tileSize, spacing);
		};

		Utils.exportObjs = function exportObjs(exports) {
			for (var key in exports) {
				global[key] = exports[key];
			}
		};

		Utils.generateRandomWeapon = function generateRandomWeapon() {
			var materials = ["Bronze", "Iron", "Steel"],
			    types = ["Dagger", "Sword", "Axe", "Pikestaff"];

			var name = materials[Math.round(Math.random() * (materials.length - 1))] + " " + types[Math.round(Math.random() * (types.length - 1))];

			return new Weapon(name, Math.round(Math.random() * 5 + 1), Math.round(Math.random() * 6 + 4));
		};

		Utils.initUIButtons = function initUIButtons(instance) {
			var _this17 = this;

			document.getElementById("button-save").addEventListener("click", function (e) {
				e.stopPropagation();
				_this17.saveGame(instance);
			});

			document.getElementById("button-delete").addEventListener("click", function (e) {
				e.stopPropagation();
				_this17.deleteSave();
			});
		};

		_createClass(Utils, null, [{
			key: "defaults",
			get: function get() {
				return {
					weapon: function weapon() {
						var weapon = new Weapon("Fists");
						weapon.canDrop = false;
						return weapon;
					}
				};
			}
		}, {
			key: "exports",
			get: function get() {
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
		}, {
			key: "alphabetMap",
			get: function get() {
				return ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
			}
		}, {
			key: "DamageCalculator",
			get: function get() {
				return function () {
					function _class4() {
						_classCallCheck(this, _class4);
					}

					_createClass(_class4, null, [{
						key: "constants",
						get: function get() {
							return {
								baseAC: 0.1,
								defenderStrEffectiveness: 10,
								attackerStatEffectiveness: 2
							};
						}
					}, {
						key: "physical",
						get: function get() {
							var _this18 = this;

							return {
								melee: function melee(attacker, defender) {
									var effectiveAC = (defender.stats.AC + _this18.constants.baseAC) * (1 + defender.stats.STR / _this18.constants.defenderStrEffectiveness),
									    effectiveDmg = attacker.equipment.weapon.damage + (attacker.stats.STR + attacker.stats.DEX) / 2 / _this18.constants.attackerStatEffectiveness;
									return Math.max(Math.floor(effectiveDmg - effectiveAC), 0);
								}
							};
						}
					}]);

					return _class4;
				}();
			}

			//use this to generate maps
			//(actually it generates array of objs which then get inserted by Game)

		}, {
			key: "DungeonGenerator",
			get: function get() {
				return function () {
					function _class5() {
						_classCallCheck(this, _class5);
					}

					_class5.makeRoom = function makeRoom(options) {
						var room = {};

						room.w = ~ ~(Math.random() * (options.rooms.size.max.w - options.rooms.size.min.w) + options.rooms.size.min.w);
						room.h = ~ ~(Math.random() * (options.rooms.size.max.h - options.rooms.size.min.h) + options.rooms.size.min.h);
						room.x = ~ ~(Math.random() * (options.size.w - room.w));
						room.y = ~ ~(Math.random() * (options.size.h - room.h));

						return room;
					};

					_class5.makePoint = function makePoint(options) {
						return {
							x: ~ ~(Math.random() * options.size.w),
							y: ~ ~(Math.random() * options.size.h)
						};
					};

					_class5.makePaths = function makePaths(rooms, midPoints, options) {
						var paths = [];

						//connect rooms to midpoints
						for (var i = 0; i < options.paths.count; i++) {
							var path = {},
							    dest = midPoints[i % options.paths.count % options.midPoints.count];

							path.x1 = rooms[i].x + ~ ~(Math.random() * rooms[i].w);
							path.y1 = rooms[i].y + ~ ~(Math.random() * rooms[i].h);

							path.x2 = dest.x;
							path.y2 = rooms[i].y + ~ ~(Math.random() * rooms[i].h);

							path.x3 = dest.x;
							path.y3 = dest.y;

							paths.push(path);
						}

						//connect midpoints together
						for (var _i = 1; _i < options.midPoints.count; _i++) {
							var _path = {};

							_path.x1 = midPoints[_i - 1].x;
							_path.y1 = midPoints[_i - 1].y;

							_path.x2 = midPoints[_i].x;
							_path.y2 = midPoints[_i - 1].y;

							_path.x3 = midPoints[_i].x;
							_path.y3 = midPoints[_i].y;

							paths.push(_path);
						}

						return paths;
					};

					//try to spawn some enemies within room


					_class5.insertEnemies = function insertEnemies(room, options) {
						var enemyList = [Jackalope, Honeybadger, Redcap];
						var enemies = [];
						for (var x = room.x + room.w; x > room.x; x--) {
							for (var y = room.y + room.h; y > room.y; y--) {
								if (Math.random() < options.enemies.spawnChance) {
									var enemy = enemyList[Math.floor(Math.random() * enemyList.length)];
									enemy = new enemy(new Point(x, y));
									enemy = this.generateEquipment(enemy);

									for (var i = 1; i < options.difficulty; i++) {
										enemy.levelUp();
										enemy.stats.XP++;
									}

									enemies.push(enemy);
								}
							}
						}
						return enemies;
					};

					_class5.generateEquipment = function generateEquipment(enemy) {
						if (enemy.canWield) {
							enemy.equipment.weapon = Utils.generateRandomWeapon();
						}
						if (enemy.canWear) {}
						return enemy;
					};

					//main method


					_class5.makeLevel = function makeLevel(player, options) {
						var _this19 = this;

						options = options || this.defaultOptions;
						var matrix = [],
						    objs = [],
						    rooms = Array(options.rooms.count).fill(),
						    midPoints = Array(options.midPoints.count).fill();

						//get rooms
						for (var i in rooms) {
							rooms[i] = this.makeRoom(options);
						}

						//set player to first room
						player.position.set(rooms[0].x + 1, rooms[0].y + 1);
						objs.push(player);

						if (options.stairs.up) {
							//put an upstairs on player
							objs.push(new Stair(new Point(rooms[0].x + 1, rooms[0].y + 1), "up"));
						}

						if (options.stairs.down) {
							//put a downstairs in "last" room
							objs.push(new Stair(new Point(rooms[options.rooms.count - 1].x + 1, rooms[options.rooms.count - 1].y + 1), "down"));
						}

						//get midpoints
						for (var _i2 in midPoints) {
							midPoints[_i2] = this.makePoint(options);
						}

						//get paths
						var paths = this.makePaths(rooms, midPoints, options);

						//fill matrix with walls
						for (var y = 0; y < options.size.h; y++) {
							matrix[y] = [];
							for (var x = 0; x < options.size.w; x++) {
								var tile = new Tile(new Point(x, y));
								tile.add(new Wall(new Point(x, y)));
								matrix[y][x] = tile;
							}
						}

						//carve out rooms
						//and try put some enemies in them
						rooms.forEach(function (room) {
							for (var _x3 = room.x + room.w; _x3 > room.x; _x3--) {
								for (var _y = room.y + room.h; _y > room.y; _y--) {
									matrix[_y][_x3].empty();
								}
							}
							objs = objs.concat(_this19.insertEnemies(room, options));
						});

						//carve out paths
						paths.forEach(function (path) {
							for (var i0 = Math.min(path.x1, path.x2), i1 = Math.max(path.x1, path.x2); i0 < i1 + 1; i0++) {
								matrix[path.y1][i0].empty();
							}
							for (var _i3 = Math.min(path.y2, path.y3), _i4 = Math.max(path.y2, path.y3); _i3 < _i4 + 1; _i3++) {
								matrix[_i3][path.x2].empty();
							}
						});

						//get objs
						for (var _y2 = 0; _y2 < options.size.h; _y2++) {
							for (var _x4 = 0; _x4 < options.size.w; _x4++) {
								if (!matrix[_y2][_x4].isEmpty) {
									objs.push(matrix[_y2][_x4].top);
								}
							}
						}

						return {
							rooms: rooms,
							paths: paths,
							objs: objs
						};
					};

					_createClass(_class5, null, [{
						key: "defaultOptions",
						get: function get() {
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
								}
							};
						}
					}]);

					return _class5;
				}();
			}
		}]);

		return Utils;
	}();

	/* @depends ../misc/utils.class.js */
	//handle mouse stuff and examine cursor
	var MouseHandler = function () {
		function MouseHandler(board) {
			_classCallCheck(this, MouseHandler);

			this.board = board;
			var cursor = document.createElement("div");
			cursor.id = "cursor";
			cursor.style.width = this.board.tileSize + "px";
			cursor.style.height = this.board.tileSize + "px";

			this.cursor = cursor;
			document.body.appendChild(this.cursor);
		}

		//set cursor position
		//input screen coordinates


		MouseHandler.prototype.cursorFromScreen = function cursorFromScreen(point) {
			var _Utils$screenToTiles$ = Utils.screenToTiles(point, this.board.tileSize, this.board.spacing).get;
			var x = _Utils$screenToTiles$[0];
			var y = _Utils$screenToTiles$[1];

			this.cursor.style.top = y + "px";
			this.cursor.style.left = x + "px";
		};

		//input game coordinates


		MouseHandler.prototype.cursorFromGame = function cursorFromGame(point) {
			var _Utils$gameToScreen$g = Utils.gameToScreen(point, this.board.tileSize, this.board.spacing).get;
			var x = _Utils$gameToScreen$g[0];
			var y = _Utils$gameToScreen$g[1];

			this.cursor.style.top = y + "px";
			this.cursor.style.left = x + "px";
		};

		return MouseHandler;
	}();
	var EquipmentManager = function () {
		function EquipmentManager(equipmentBox, equipment) {
			_classCallCheck(this, EquipmentManager);

			this.wrapper = equipmentBox;
			this.equipment = equipment;
			var container = document.createElement("div");
			container.style.padding = "10px";
			this.container = container;
			this.wrapper.appendChild(this.container);
		}

		EquipmentManager.prototype.update = function update() {
			var _this20 = this;

			if (!!this.container.children.length) {
				Array.from(this.container.children).forEach(function (item) {
					return item.remove();
				});
			}
			Object.keys(this.equipment).filter(function (k) {
				return _this20.equipment[k];
			}).forEach(function (k, i) {
				var parent = document.createElement("div"),
				    key = document.createElement("div"),
				    slot = document.createElement("div"),
				    value = document.createElement("div");

				parent.className = "equipment-row";
				key.className = "equipment-key";
				slot.className = "equipment-slot";
				value.className = "equipment-item";

				key.innerHTML = Utils.alphabetMap[i];
				slot.innerHTML = k;
				value.innerHTML = _this20.equipment[k];

				parent.appendChild(key);
				parent.appendChild(slot);
				parent.appendChild(value);
				_this20.container.appendChild(parent);
			});
		};

		return EquipmentManager;
	}();

	//manages the inventory UI component
	var InventoryManager = function () {
		function InventoryManager(inventoryBox, inventory) {
			_classCallCheck(this, InventoryManager);

			this.wrapper = inventoryBox;
			this.inventory = inventory;
			var container = document.createElement("div");
			container.style.padding = "10px";
			this.container = container;
			this.wrapper.appendChild(this.container);
		}

		InventoryManager.prototype.update = function update() {
			var _this21 = this;

			if (!!this.container.children.length) {
				Array.from(this.container.children).forEach(function (item) {
					return item.remove();
				});
			}
			this.inventory.forEach(function (item, key) {
				var ele = document.createElement("div");
				ele.innerHTML = Utils.alphabetMap[key] + " - " + item;
				_this21.container.appendChild(ele);
			});
		};

		return InventoryManager;
	}();
	//manages logging
	var LogboxManager = function () {
		function LogboxManager(logbox, rowCount) {
			_classCallCheck(this, LogboxManager);

			this.logbox = logbox;

			this.rowCount = rowCount;
			this.rows = [];
			this.messages = [];

			for (var i = 0; i < this.rowCount; i++) {
				var row = document.createElement("div");
				row.className = "logbox-row";
				row.id = "logbox-row-" + (i + 1);
				this.logbox.appendChild(row);
				this.rows.push(row);
			}
		}

		//this handles inserting new messages and moving old etc
		//type is the css class used


		LogboxManager.prototype.log = function log(text) {
			var _this22 = this;

			var type = arguments.length <= 1 || arguments[1] === undefined ? "default" : arguments[1];

			text = text.charAt(0).toUpperCase() + text.slice(1);

			var msg = document.createElement("span");
			msg.className = "logmsg logmsg-" + type;
			msg.innerHTML = text;

			this.messages.push(msg);

			var target = this.rows.find(function (row) {
				return row.children.length === 0;
			});

			if (target) {
				target.appendChild(msg);
			} else {
				this.rows[0].children[0].remove();
				this.rows.forEach(function (row, index) {
					row.appendChild(_this22.messages[_this22.messages.length - (_this22.rowCount - index)]);
				});
			}
		};

		return LogboxManager;
	}();
	var StatsManager = function () {
		function StatsManager(playerWrap, gameCont, playerStats, gameStats) {
			_classCallCheck(this, StatsManager);

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

		StatsManager.prototype.create = function create() {
			var _this23 = this;

			var playerStatCont = document.createElement("div");
			playerStatCont.style.padding = "10px";
			this.playerStatCont = playerStatCont;
			this.playerWrap.appendChild(this.playerStatCont);

			this.playerStatElements = {};

			Object.keys(this.usedPlayerStats).forEach(function (key) {
				var parent = document.createElement("div"),
				    stat = document.createElement("div"),
				    value = document.createElement("div");

				parent.className = "player-stat-row";
				stat.className = "player-stat-name";
				value.className = "player-stat-value";

				stat.innerHTML = _this23.usedPlayerStats[key];
				value.innerHTML = _this23.playerStats[key];
				parent.appendChild(stat);
				parent.appendChild(value);
				_this23.playerStatCont.appendChild(parent);

				_this23.playerStatElements[key] = {
					stat: stat,
					value: value
				};
			});

			this.gameStatElements = {};

			Object.keys(this.usedGameStats).forEach(function (key) {
				var parent = document.createElement("div"),
				    stat = document.createElement("div"),
				    value = document.createElement("div");

				parent.className = "game-stat-row";
				stat.className = "game-stat-name";
				value.className = "game-stat-value";

				parent.id = "game-stat-" + key;

				stat.innerHTML = _this23.usedGameStats[key];
				value.innerHTML = _this23.gameStats[key];
				parent.appendChild(stat);
				parent.appendChild(value);
				_this23.gameCont.appendChild(parent);

				_this23.gameStatElements[key] = {
					stat: stat,
					value: value
				};
			});
		};

		StatsManager.prototype.update = function update() {
			var _this24 = this;

			Object.keys(this.usedPlayerStats).forEach(function (key) {
				_this24.playerStatElements[key].value.innerHTML = _this24.playerStats[key];
			});
			Object.keys(this.usedGameStats).forEach(function (key) {
				_this24.gameStatElements[key].value.innerHTML = _this24.gameStats[key];
			});
		};

		return StatsManager;
	}();

	/* 
 @depends point.class.js
 @depends ../abstract/gameobject.class.js
  */
	//tiles have constant positions and they contain gameobjects
	//they live in TileGroups
	//perhaps this should extend GameObject?
	var Tile = function () {
		function Tile(point) {
			_classCallCheck(this, Tile);

			this.position = point;
			this.contents = [];
		}

		//check if tile has anything in it


		//add object to tiles container

		Tile.prototype.add = function add(obj) {
			if (!obj instanceof GameObject) throw new TypeError("Added object must be of type GameObject.");
			if (obj.isMoveBlocking) {
				this.contents.unshift(obj);
			} else {
				this.contents.push(obj);
			}
		};

		//remove from tiles container


		Tile.prototype.remove = function remove(obj) {
			var index = this.contents.indexOf(obj);
			if (index > -1) {
				this.contents.splice(index, 1);
				return true;
			}
			return false;
		};

		//get the first object in container


		//remove everything from container

		Tile.prototype.empty = function empty() {
			this.contents = [];
		};

		//get all contents


		Tile.prototype.toString = function toString() {
			return "Floor";
		};

		_createClass(Tile, [{
			key: "isEmpty",
			get: function get() {
				return this.contents.length === 0;
			}
		}, {
			key: "top",
			get: function get() {
				return this.contents[0];
			}
		}, {
			key: "get",
			get: function get() {
				return this.contents;
			}
		}]);

		return Tile;
	}();
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
	var TileGroup = function () {
		function TileGroup(matrix, options) {
			var _this25 = this;

			_classCallCheck(this, TileGroup);

			//set all options to props
			//kinda unsafe lol
			for (var key in options) {
				this[key] = options[key];
			}

			//check if matrix was given or do we need to generate one
			if (matrix) {
				this.matrix = matrix;
				this.w = this.matrix[0].length;
				this.h = this.matrix.length;
			} else {
				this.matrix = [];
				for (var y = 0; y < this.h; y++) {
					this.matrix[y] = [];
					for (var x = 0; x < this.w; x++) {
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
				this.matrix.forEach(function (row, y) {
					return _this25.matrix[y] = Array(_this25.origin.x).concat(_this25.matrix[y]);
				});
			} else {
				//shift x
				this.matrix.forEach(function (row, y) {
					for (var i = 0; i < -_this25.origin.x; i++) {
						_this25.matrix[y].shift();
					}
				});
			}
			if (this.origin.y >= 0) {
				//pad y
				this.matrix = Array(this.origin.y).concat(this.matrix);
			} else {
				//shift y
				for (var i = 0; i < -this.origin.y; i++) {
					this.matrix.shift();
				}
			}

			//some props require defaults
			this.baseColor = this.baseColor || "slategrey";
			this.tileSize = this.tileSize || 25;
			this.spacing = this.spacing || 1;
		}

		//look up each cell and update gameobject positions in tiles


		TileGroup.prototype.update = function update() {
			var _this26 = this;

			this.matrix.forEach(function (row, y) {
				return row.forEach(function (tile, x) {
					if (tile && !tile.isEmpty) {
						var temp = tile.top;
						tile.contents.shift();
						_this26.insert(temp);
					}
				});
			});
		};

		//insert gameobject


		TileGroup.prototype.insert = function insert(obj) {
			var _obj$position$get = obj.position.get;
			var x = _obj$position$get[0];
			var y = _obj$position$get[1];

			if (this.has(obj.position)) {
				this.matrix[y][x].add(obj);
			}
		};

		//returns the real coordinates and size of the matrix


		//remove gameobject

		TileGroup.prototype.remove = function remove(obj) {
			var _obj$position$get2 = obj.position.get;
			var x = _obj$position$get2[0];
			var y = _obj$position$get2[1];

			if (this.has(obj.position)) {
				this.matrix[y][x].remove(obj);
			}
		};

		//empty all tiles


		TileGroup.prototype.clear = function clear() {
			this.matrix.forEach(function (row) {
				return row.forEach(function (tile) {
					return tile.empty();
				});
			});
		};

		//check if point exists in matrix


		TileGroup.prototype.has = function has(point) {
			var _point$get = point.get;
			var x = _point$get[0];
			var y = _point$get[1];

			return !!this.matrix[y] && !!this.matrix[y][x];
		};

		//get tile at point


		TileGroup.prototype.get = function get(point) {
			var _point$get2 = point.get;
			var x = _point$get2[0];
			var y = _point$get2[1];

			return this.has(point) ? this.matrix[y][x] : undefined;
		};

		//go through matrix and draw each cell


		TileGroup.prototype.draw = function draw() {
			var _this27 = this;

			this.matrix.forEach(function (row, y) {
				return row.forEach(function (tile, x) {
					if (tile) {
						var _tile$position$get = tile.position.get;
						var tx = _tile$position$get[0];
						var ty = _tile$position$get[1];

						if (tile.isEmpty) {
							//default
							mainCtx.fillStyle = _this27.baseColor;
							mainCtx.fillRect(tx * (_this27.tileSize + _this27.spacing), ty * (_this27.tileSize + _this27.spacing), _this27.tileSize, _this27.tileSize);
						} else {
							//draw gameobject
							mainCtx.fillStyle = tile.top.bgColor;
							mainCtx.fillRect(tx * (_this27.tileSize + _this27.spacing), ty * (_this27.tileSize + _this27.spacing), _this27.tileSize, _this27.tileSize);
							mainCtx.fillStyle = tile.top.color;
							mainCtx.fillText(tile.top.glyph, tx * (_this27.tileSize + _this27.spacing) + _this27.tileSize / 2, ty * (_this27.tileSize + _this27.spacing) + _this27.tileSize / 1.5);
						}
					}
				});
			});
		};

		_createClass(TileGroup, [{
			key: "bounds",
			get: function get() {
				return {
					x: this.origin.x * (this.tileSize + this.spacing),
					y: this.origin.y * (this.tileSize + this.spacing),
					w: this.w * (this.tileSize + this.spacing) - this.spacing,
					h: this.h * (this.tileSize + this.spacing) - this.spacing
				};
			}
		}]);

		return TileGroup;
	}();
	/* @depends ../abstract/gameobject.class.js */
	var Corpse = function (_GameObject4) {
		_inherits(Corpse, _GameObject4);

		function Corpse(position) {
			_classCallCheck(this, Corpse);

			var _this28 = _possibleConstructorReturn(this, _GameObject4.call(this, position));

			_this28.bgColor = "hsl(0,40%,40%)";
			_this28.glyph = "x"; //some block character
			_this28.color = "hsl(0,40%,10%)";
			_this28.flavorName = "corpse";
			return _this28;
		}

		Corpse.prototype.update = function update() {
			return 0;
		};

		return Corpse;
	}(GameObject);
	/*
 @depends ../../abstract/action.class.js
 @depends ../objs/corpse.class.js
 */
	var AttackAction = function (_Action) {
		_inherits(AttackAction, _Action);

		function AttackAction(context, logger, direction) {
			_classCallCheck(this, AttackAction);

			var _this29 = _possibleConstructorReturn(this, _Action.call(this, context, logger));

			_this29.direction = direction;
			return _this29;
		}

		AttackAction.prototype.try = function _try(actor, time) {
			if (!actor.equipment.weapon) {
				actor.equipment.weapon = Utils.defaults.weapon();
			}
			this.duration = actor.equipment.weapon.speed;
			if (time % this.duration !== 0) {
				return false;
			}
			var target = new (Function.prototype.bind.apply(Point, [null].concat(actor.position.get)))();
			target.moveBy(this.direction);

			var tile = this.context.get(target);
			return tile && tile.top && tile.top.isHittable && actor.isAlive;
		};

		AttackAction.prototype.do = function _do(actor) {
			var target = new (Function.prototype.bind.apply(Point, [null].concat(actor.position.get)))();
			target.moveBy(this.direction);
			target = this.context.get(target);

			var damage = Utils.DamageCalculator.physical.melee(actor, target.top);

			if (this.logger) {
				this.logger.log(actor.flavorName + " hit " + target.top.flavorName + " for " + damage + " damage with " + actor.equipment.weapon, actor.constructor === Player ? "hit" : "damage");
			}
			var died = target.top.takeDamage(damage, this.logger);
			if (died) {
				actor.killcount++;
				var leveledUpStat = actor.gainXP(target.top.stats.XP);
				if (leveledUpStat) {
					this.logger.log(actor.flavorName + " leveled up and gained a point in " + leveledUpStat, "hilight");
				}
				//drop all items and corpse
				target.top.items.forEach(function (item) {
					if (item.canDrop) {
						item.position = new (Function.prototype.bind.apply(Point, [null].concat(target.top.position.get)))();
						target.add(item);
					}
				});
				target.add(new Corpse(new (Function.prototype.bind.apply(Point, [null].concat(target.top.position.get)))()));
				target.remove(target.top);
			}
			this.context.update();
			return this.duration;
		};

		return AttackAction;
	}(Action);

	/* @depends ../../abstract/action.class.js */
	var ItemDropAction = function (_Action2) {
		_inherits(ItemDropAction, _Action2);

		function ItemDropAction(context, logger, inventorySlot) {
			_classCallCheck(this, ItemDropAction);

			var _this30 = _possibleConstructorReturn(this, _Action2.call(this, context, logger));

			_this30.inventorySlot = inventorySlot;
			return _this30;
		}

		ItemDropAction.prototype.try = function _try(actor, time) {
			var hasItem = !!actor.inventory[Utils.alphabetMap.indexOf(this.inventorySlot)];
			if (!hasItem) {
				this.logger.log("No such item");
			}
			return time % 10 === 0 && hasItem && actor.isAlive;
		};

		ItemDropAction.prototype.do = function _do(actor) {
			var index = Utils.alphabetMap.indexOf(this.inventorySlot),
			    item = actor.inventory[index];
			actor.inventory.splice(index, 1);
			item.position = new (Function.prototype.bind.apply(Point, [null].concat(actor.position.get)))();
			this.context.insert(item);
			this.logger.log(actor.flavorName + " dropped " + item.toString());
			return 10;
		};

		return ItemDropAction;
	}(Action);
	/*
 @depends ../../abstract/action.class.js
 */
	var ItemUnequipAction = function (_Action3) {
		_inherits(ItemUnequipAction, _Action3);

		function ItemUnequipAction(context, logger, equipmentSlot) {
			_classCallCheck(this, ItemUnequipAction);

			var _this31 = _possibleConstructorReturn(this, _Action3.call(this, context, logger));

			_this31.equipmentSlot = equipmentSlot;
			return _this31;
		}

		ItemUnequipAction.prototype.try = function _try(actor, time) {
			var keyIndex = Utils.alphabetMap.indexOf(this.equipmentSlot),
			    hasItem = Object.keys(actor.equipment).filter(function (k) {
				return actor.equipment[k] !== null;
			}).some(function (k, i) {
				return i === keyIndex;
			});
			if (!hasItem) {
				this.logger.log("No such item");
				return false;
			}
			return time % 10 === 0 && hasItem && actor.isAlive;
		};

		ItemUnequipAction.prototype.do = function _do(actor) {
			var keyIndex = Utils.alphabetMap.indexOf(this.equipmentSlot),
			    itemSlot = Object.keys(actor.equipment).filter(function (k) {
				return actor.equipment[k] !== null;
			}).find(function (k, i) {
				return i === keyIndex;
			}),
			    item = actor.equipment[itemSlot];

			if (item.canDrop) {
				actor.inventory.push(item);
			}
			actor.equipment[itemSlot] = null;

			this.logger.log(actor.flavorName + " unequipped " + item.toString(), "junk1");
			return 10;
		};

		return ItemUnequipAction;
	}(Action);

	/*
 @depends ../../abstract/action.class.js
 @depends ../logic/actions/itemunequipaction.class.js
 */
	var ItemEquipAction = function (_Action4) {
		_inherits(ItemEquipAction, _Action4);

		function ItemEquipAction(context, logger, inventorySlot) {
			_classCallCheck(this, ItemEquipAction);

			var _this32 = _possibleConstructorReturn(this, _Action4.call(this, context, logger));

			_this32.inventorySlot = inventorySlot;
			return _this32;
		}

		ItemEquipAction.prototype.try = function _try(actor, time) {
			var hasItem = !!actor.inventory[Utils.alphabetMap.indexOf(this.inventorySlot)];
			if (!hasItem) {
				this.logger.log("No such item");
				return false;
			}
			return time % 10 === 0 && hasItem && actor.isAlive;
		};

		ItemEquipAction.prototype.do = function _do(actor) {
			var inventoryIndex = Utils.alphabetMap.indexOf(this.inventorySlot),
			    item = actor.inventory[inventoryIndex],
			    duration = 0;

			//if already has something equipped in that slot
			//remove it into inventory
			//actually this should be an unequipaction
			if (actor.equipment[item.slot]) {
				var action = new ItemUnequipAction(null, this.logger, this.inventorySlot);
				duration += action.do(actor);
			}
			//splice item from inventory and put it in equipment
			item = actor.inventory.splice(inventoryIndex, 1)[0];
			actor.equipment[item.slot] = item;

			this.logger.log(actor.flavorName + " equipped " + item.toString(), "junk1");
			return duration + 10;
		};

		return ItemEquipAction;
	}(Action);

	/* @depends ../../abstract/action.class.js */
	var ItemPickupAction = function (_Action5) {
		_inherits(ItemPickupAction, _Action5);

		function ItemPickupAction(context, logger) {
			_classCallCheck(this, ItemPickupAction);

			return _possibleConstructorReturn(this, _Action5.call(this, context, logger));
		}

		ItemPickupAction.prototype.try = function _try(actor, time) {
			return time % 10 === 0 && actor.inventory.length < actor.stats.inventorySize && this.context.get(actor.position).contents.some(function (obj) {
				return obj instanceof Item;
			}) && actor.isAlive;
		};

		ItemPickupAction.prototype.do = function _do(actor) {
			var targetTile = this.context.get(actor.position),
			    item = targetTile.contents.find(function (obj) {
				return obj instanceof Item;
			});
			actor.inventory.push(item);
			targetTile.remove(item);
			if (this.logger) {
				this.logger.log(actor.flavorName + " picked up " + item.toString(), "junk1");
			}
			return 10;
		};

		return ItemPickupAction;
	}(Action);

	/* @depends ../../abstract/action.class.js */
	//the act of moving something somewhere
	//menu logic not done yet but maybe this could be used for menus too
	var MoveAction = function (_Action6) {
		_inherits(MoveAction, _Action6);

		function MoveAction(context, logger, movement) {
			_classCallCheck(this, MoveAction);

			var _this34 = _possibleConstructorReturn(this, _Action6.call(this, context, logger));

			_this34.movement = movement;
			return _this34;
		}

		MoveAction.prototype.try = function _try(actor, time) {
			this.duration = actor.stats.moveSpeed;
			if (time % this.duration !== 0) {
				return false;
			}
			//check if the point we're trying to move to is empty
			var target = new (Function.prototype.bind.apply(Point, [null].concat(actor.position.get)))();
			target.moveBy(this.movement);
			var tile = this.context.get(target);
			return actor.cheatMode || (tile.isEmpty || tile && tile.top && !tile.top.isMoveBlocking) && actor.isAlive;
		};

		MoveAction.prototype.do = function _do(actor) {
			actor.position.moveBy(this.movement);
			this.context.update(); //this is kinda important, should this even be here
			return this.duration;
		};

		return MoveAction;
	}(Action);

	/* @depends ../../abstract/action.class.js */
	//doesnt do anything
	var NullAction = function (_Action7) {
		_inherits(NullAction, _Action7);

		function NullAction(context, logger) {
			_classCallCheck(this, NullAction);

			return _possibleConstructorReturn(this, _Action7.call(this, context, logger));
		}

		NullAction.prototype.try = function _try(actor, time) {
			return time % 10 === 0;
		};

		NullAction.prototype.do = function _do(actor) {
			return 10;
		};

		return NullAction;
	}(Action);
	/* @depends ../../abstract/action.class.js */
	var StairAction = function (_Action8) {
		_inherits(StairAction, _Action8);

		function StairAction(context, logger) {
			_classCallCheck(this, StairAction);

			return _possibleConstructorReturn(this, _Action8.call(this, context, logger));
		}

		StairAction.prototype.try = function _try(actor, time) {
			var tile = this.context.get(actor.position),
			    isStair = tile && tile.contents.some(function (obj) {
				return obj.constructor === Stair;
			});
			if (!isStair) {
				this.logger.log("No stairs here");
			}
			return time % 10 === 0 && isStair && actor.isAlive;
		};

		StairAction.prototype.do = function _do(actor) {
			var stair = this.context.get(actor.position).contents.find(function (obj) {
				return obj.constructor === Stair;
			});
			actor.dungeonLevelChange = stair.direction;
			this.logger.log(actor.flavorName + " went " + stair.direction + " the stairs", "junk2");
			return 10;
		};

		return StairAction;
	}(Action);

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
	var ActionManager = function () {
		function ActionManager(board, logger) {
			_classCallCheck(this, ActionManager);

			this.board = board;
			this.logger = logger;

			this.proposalMap = {};
			this.proposalMap[null] = [NullAction];
			this.proposalMap[Vector] = [MoveAction, AttackAction, NullAction];
			this.proposalMap["pickup"] = [ItemPickupAction, NullAction];
			this.proposalMap["drop"] = [ItemDropAction, NullAction];
			this.proposalMap["equip"] = [ItemEquipAction, NullAction];
			this.proposalMap["unequip"] = [ItemUnequipAction, NullAction];
			this.proposalMap["stair"] = [StairAction, NullAction];
		}

		//decide actor logic


		ActionManager.prototype.think = function think(actor, player) {
			var _this37 = this;

			if (actor instanceof Enemy) {
				var _ret2 = function () {
					var fov = _this37.getFov(actor),
					    instruction = null,
					    shouldLog = _this37.getFov(player).has(actor.position);
					actor.target = fov.get(player.position);

					if (!actor.target || !player.isAlive) {
						//cant find target, move randomly
						instruction = new Vector();
						actor.noticed = false;
					} else if (Point.equal(actor.position, actor.target.position)) {
						//reached target, stopping
						actor.target = undefined;
						return {
							v: void 0
						};
					} else {
						//moving towards target
						var vector = Point.distance(actor.position, actor.target.position);
						vector.reduce();
						instruction = vector;
						if (!actor.noticed && shouldLog) _this37.logger.log(actor.flavorName + " noticed " + player.flavorName, "threat1");
						actor.noticed = true;
					}

					var proposals = _this37.proposalMap[instruction.constructor];
					if (proposals) {
						var methods = proposals.map(function (action) {
							return function () {
								return new action(_this37.board, shouldLog ? _this37.logger : null, instruction);
							};
						});
						actor.actions.push(methods);
					}
				}();

				if ((typeof _ret2 === "undefined" ? "undefined" : _typeof(_ret2)) === "object") return _ret2.v;
			}
		};

		ActionManager.prototype.getFov = function getFov(actor) {
			if (!actor) return;
			var _actor$position$get = actor.position.get;
			var ax = _actor$position$get[0];
			var ay = _actor$position$get[1];
			var range = actor.stats.viewDistance;
			var quarters = {
				"ne": [],
				"se": [],
				"sw": [],
				"nw": []
			};

			for (var y = 0; y < range; y++) {
				for (var x = 0; x < range; x++) {
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
		};

		//what does this do again? give actions to actors? or just the player?


		ActionManager.prototype.delegateAction = function delegateAction(actor, instruction) {
			var _this38 = this;

			if (!actor) {
				return;
			}
			if (!actor.isAlive) {
				var proposals = this.proposalMap[null];
				var methods = proposals.map(function (action) {
					return function () {
						return new action(_this38.board, _this38.logger, instruction);
					};
				});
				actor.actions.push(methods);
				return true;
			}
			if (instruction) {
				var key = instruction;
				if (typeof instruction === "function") {
					instruction = instruction();
					key = instruction.constructor;
				} else if (typeof instruction === "string") {
					var _instruction$split = instruction.split(":");

					key = _instruction$split[0];
					instruction = _instruction$split[1];

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
								actor.cheatMode = true;
								this.logger.log("Cheat mode activated", "hilight");
								return false;
							default:
								break;
						}
					}
				}
				var _proposals = this.proposalMap[key];
				if (_proposals) {
					var _methods = _proposals.map(function (action) {
						return function () {
							return new action(_this38.board, _this38.logger, instruction);
						};
					});
					actor.actions.push(_methods);
					return true;
				} else {
					console.warn("Could not delegate action: ", instruction, JSON.stringify(instruction));
				}
			} else if (instruction === null) {
				actor.actions.push([function () {
					return new NullAction(null, _this38.logger);
				}]);
				return true;
			}
			return false;
		};

		return ActionManager;
	}();

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
	var Game = function () {
		function Game(board, dungeon) {
			var _this39 = this;

			_classCallCheck(this, Game);

			this.logger = new LogboxManager(document.getElementById("logbox"), 10);

			var self = this;
			this.stats = {
				time: 0,
				dungeonName: "Dungeon of Esc",
				currentDungeonLevel: 0,
				get score() {
					return Math.round((self.player.killcount + 1) * (self.stats.currentDungeonLevel + 1) / (self.stats.time / 10000 + 1));
				}
			};

			this.dungeonLevels = [];

			this.board = board;
			this.player = dungeon.objs[0];

			this.saveDungeonLevel(dungeon);

			this.logic = new ActionManager(this.board, this.logger);

			//keypress eventlistener
			this.keyHandler = new KeyHandler();
			document.addEventListener("keydown", function (e) {
				if (_this39.logic.delegateAction(_this39.player, _this39.keyHandler.get(e.keyCode))) {
					_this39.update();
				}
			});

			var miscOtherInfoContainer = document.getElementById("info-container-other-misc");

			this.examineContainer = document.createElement("div");
			this.examineContainer.className = "examine-container";

			miscOtherInfoContainer.appendChild(this.examineContainer);

			//cleaned this up a bit but it's still not very nice
			this.mouseHandler = new MouseHandler(this.board);
			document.addEventListener("mousemove", function (e) {
				var bounds = _this39.board.bounds;
				var screenPoint = new Point(e.pageX, e.pageY);

				//mouse is inside game screen
				if (screenPoint.in(bounds)) {
					var fov = _this39.player.fov,
					    gamePoint = Utils.screenToGame(screenPoint, _this39.board.tileSize, _this39.board.spacing);

					//set cursor position
					_this39.mouseHandler.cursorFromScreen(screenPoint);

					//if hovering over a tile that is seen
					if (fov && fov.has(gamePoint)) {
						var targetTile = _this39.board.get(gamePoint);

						//if tile is not empty
						if (targetTile && targetTile.top) {
							//reset all lifebars styles
							_this39.dungeonLevels[_this39.stats.currentDungeonLevel].objs.forEach(function (obj) {
								if (obj.lifebar) obj.lifebar.setStyle("default");
							});

							//set examine text
							_this39.examineContainer.innerHTML = targetTile.top;
							//highlight lifebar
							if (targetTile.top instanceof Creature) {
								targetTile.top.lifebar.setStyle("hilight");
							}
						} else {
							_this39.examineContainer.innerHTML = targetTile;
						}
					} else {
						//tile is not in fov
						_this39.examineContainer.innerHTML = "You can't see that";
					}
					//hovering over a lifebar
				} else if (e.target.classList.contains("bar-lifebar")) {
						//reset all lifebars styles
						_this39.dungeonLevels[_this39.stats.currentDungeonLevel].objs.forEach(function (obj) {
							if (obj.lifebar) obj.lifebar.setStyle("default");
						});

						//get lifebars owner
						var id = e.target.id.match(/[0-9]+$/);
						var target = _this39.dungeonLevels[_this39.stats.currentDungeonLevel].objs[Number(id)];

						//set cursor to lifebars owner
						if (target) {
							_this39.mouseHandler.cursorFromGame(target.position);
							_this39.examineContainer.innerHTML = target;
							target.lifebar.setStyle("hilight");
						}
					}
			});

			this.inventoryManager = new InventoryManager(document.getElementById("info-container-inventory"), this.player.inventory);
			this.equipmentManager = new EquipmentManager(document.getElementById("info-container-equipment"), this.player.equipment);
			this.statsManager = new StatsManager(document.getElementById("info-container-player"), document.getElementById("info-container-game"), this.player.stats, this.stats);
		}

		Game.prototype.saveDungeonLevel = function saveDungeonLevel(dungeon) {
			var _this40 = this;

			var rooms = dungeon.rooms;
			var paths = dungeon.paths;
			var objs = dungeon.objs;
			var img = new Image();
			img.src = secondCanvas.toDataURL();
			this.dungeonLevels[this.stats.currentDungeonLevel] = {
				objs: [],
				rooms: rooms,
				paths: paths,
				map: img
			};
			objs.forEach(function (obj) {
				return _this40.dungeonLevels[_this40.stats.currentDungeonLevel].objs[obj.id] = obj;
			});
		};

		Game.prototype.changeDungeonLevel = function changeDungeonLevel(level) {
			var _this41 = this;

			this.saveDungeonLevel(this.dungeonLevels[this.stats.currentDungeonLevel]);
			var dir = level > this.stats.currentDungeonLevel ? "down" : "up";

			this.dungeonLevels[this.stats.currentDungeonLevel].objs.forEach(function (obj, k) {
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

			var objs = [];
			objs[0] = this.player;
			//if level already exists load it else generate new
			if (this.dungeonLevels[level]) {
				objs = this.dungeonLevels[level].objs;
				secondCtx.drawImage(this.dungeonLevels[level].map, 0, 0);
				//put player in the last room if we're going up
				if (dir === "up") {
					this.player.position.set(this.dungeonLevels[level].rooms[this.dungeonLevels[level].rooms.length - 1].x + 1, this.dungeonLevels[level].rooms[this.dungeonLevels[level].rooms.length - 1].y + 1);
				} else {
					//or in the first room
					this.player.position.set(this.dungeonLevels[level].rooms[0].x + 1, this.dungeonLevels[level].rooms[0].y + 1);
				}
			} else {
				var options = Utils.DungeonGenerator.defaultOptions;
				options.stairs.up = true;
				options.difficulty = this.stats.currentDungeonLevel;
				var dungeon = Utils.DungeonGenerator.makeLevel(this.player, options);
				objs = dungeon.objs;
				this.dungeonLevels[level] = {
					objs: [],
					rooms: dungeon.rooms,
					paths: dungeon.paths
				};
			}

			//put objs in their id slots
			objs.forEach(function (obj) {
				return _this41.dungeonLevels[level].objs[obj.id] = obj;
			});

			//insert objs into the board
			this.dungeonLevels[level].objs.forEach(function (obj) {
				if (obj) {
					_this41.board.insert(obj);
				}
			});

			this.dungeonLevels[level].objs.forEach(function (obj) {
				if (obj) {
					_this41.logic.think(obj, _this41.player);
				}
			});
		};

		Game.prototype.update = function update() {
			var _this42 = this;

			var duration = this.player.update(this.logger);
			var tickCount = duration / TICK;

			if (this.player.dungeonLevelChange) {
				var level = this.stats.currentDungeonLevel;
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
			var objDurations = [];
			for (var i = 0; i < tickCount; i++) {
				this.stats.time += TICK;

				this.dungeonLevels[this.stats.currentDungeonLevel].objs.forEach(function (obj, index) {
					//skip player
					if (obj.type === "Player") {
						return;
					}

					if (obj.isAlive) {
						var _duration = obj.update(_this42.logger, _this42.stats.time + (objDurations[obj.id] || 0));
						if (_duration > 0) {
							//if action was excecuted we generate new ones and
							//forward the time for this obj
							_this42.logic.think(obj, _this42.player);
							objDurations[obj.id] = objDurations[obj.id] ? objDurations[obj.id] + _duration : _duration;
						}

						//obj died during update
						if (!obj.isAlive) {
							_this42.board.remove(obj);
							delete _this42.dungeonLevels[_this42.stats.currentDungeonLevel].objs[obj.id];
						}
					} else {
						_this42.board.remove(obj);
						delete _this42.dungeonLevels[_this42.stats.currentDungeonLevel].objs[obj.id];
					}
				});
			}

			var fov = this.logic.getFov(this.player);
			this.player.fov = fov;

			if (fov) {
				this.dungeonLevels[this.stats.currentDungeonLevel].objs.forEach(function (obj) {
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
		};

		Game.prototype.start = function start() {
			var _this43 = this;

			this.logger.log("Hello and welcome", "hilight");
			this.dungeonLevels[this.stats.currentDungeonLevel].objs.forEach(function (obj) {
				if (obj) {
					_this43.board.insert(obj);
				}
			});

			var fov = this.logic.getFov(this.player);
			this.player.fov = fov;

			this.dungeonLevels[this.stats.currentDungeonLevel].objs.forEach(function (obj) {
				_this43.logic.think(obj, _this43.player);
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
		};

		return Game;
	}();

	/* @depends ../abstract/creature.class.js */
	var Player = function (_Creature2) {
		_inherits(Player, _Creature2);

		function Player(position, stats) {
			_classCallCheck(this, Player);

			var _this44 = _possibleConstructorReturn(this, _Creature2.call(this, position, stats));

			_this44.actions = [];
			_this44.bgColor = "white";
			_this44.glyph = "@";
			_this44.color = "black";

			_this44.stats.maxHP = 50;
			_this44.stats.HP = 50;
			_this44.stats.viewDistance = 8;
			_this44.stats.moveSpeed = 10;
			//this.stats.inventorySize = 15;

			_this44.stats = stats || _this44.stats;

			_this44.equipment.head = new Armor("head", "Bronze helmet", 1);

			_this44.equipment.weapon = new Weapon("Blunt Dagger", 1, 5);

			_this44.lifebar = new Lifebar(_this44.id, "Hero", document.getElementById("info-container-player"), _this44.stats);
			_this44.flavorName = "you";
			_this44.flavor = "Hi mom!";
			//todo: store username here?
			return _this44;
		}

		return Player;
	}(Creature);

	/*
 @depends ../core/game.class.js
 @depends ../objs/player.class.js
 */

	var game = new Game(new TileGroup(null, {
		origin: new Point(0, 0),
		baseColor: "slategrey",
		tileSize: 25,
		spacing: 1,
		w: 40,
		h: 20
	}), Utils.loadGame() || Utils.DungeonGenerator.makeLevel(new Player(new Point(10, 10))));
	//Utils.initUIButtons(game);

	if (env === "dev") {
		Utils.exportObjs(Utils.exports);
	} else if (env === "prod") {} else {
		throw new TypeError("Invalid environment");
	}

	game.start();

	(function () {
		var elems = Array.from(document.querySelectorAll(".moveable, .resizeable"));

		var dragging = false,
		    selected,
		    elemX = 0,
		    elemY = 0;

		elems.forEach(function (elem) {
			var right = document.createElement("div"),
			    bottom = document.createElement("div");
			right.classList.add("edge");
			bottom.classList.add("edge");

			right.classList.add("edge-right");
			bottom.classList.add("edge-bottom");

			if (elem.classList.contains("moveable")) {
				var move = function move(e) {
					if (e.target.classList.contains("moveable-anchor")) {
						e.stopPropagation();
						//e.cancelBubble();
						e.preventDefault();
						var x = e.pageX;
						var y = e.pageY;
						if (x === undefined) {
							x = e.touches[0].pageX;
							y = e.touches[0].pageY;
						}
						elemX = x - elem.offsetLeft;
						elemY = y - elem.offsetTop;
						dragging = "body";
						selected = elem;
					}
				};

				elem.addEventListener("mousedown", move);
				elem.addEventListener("touchstart", move);
			}

			if (elem.classList.contains("resizeable")) {
				var startr = function startr(e) {
					e.stopPropagation();
					//e.cancelBubble();
					e.preventDefault();
					dragging = "right";
					selected = elem;
				};

				var startb = function startb(e) {
					e.stopPropagation();
					//e.cancelBubble();
					e.preventDefault();
					dragging = "bottom";
					selected = elem;
				};

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
				var x = e.pageX;
				var y = e.pageY;
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
})(window);
//# sourceMappingURL=eschack-babel.js.map
