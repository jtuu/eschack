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
