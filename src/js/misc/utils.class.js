/*
@depends ../objs/stair.class.js
@depends ../objs/wall.class.js
@depends monsters/honeybadger.class.js
@depends jackalope.class.js
@depends redcap.class.js
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

	static generateRandomWeapon() {
		let materials = ["Bronze", "Iron", "Steel"],
			types = ["Dagger", "Sword", "Axe", "Pikestaff"];

		let name = materials[Math.round(Math.random() * (materials.length - 1))] +
			" " + types[Math.round(Math.random() * (types.length - 1))];

		return new Weapon(name, Math.round(Math.random() * 5 + 1), Math.round(Math.random() * 6 + 4));
	}

	//use this to generate maps
	//(actually it generates array of objs which then get inserted by Game)
	static get DungeonGenerator() {
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

			//try to spawn some enemies within room
			static insertEnemies(room, options) {
				let enemyList = [Jackalope, Honeybadger, Redcap];
				let enemies = [];
				for (let x = room.x + room.w; x > room.x; x--) {
					for (let y = room.y + room.h; y > room.y; y--) {
						if (Math.random() < options.enemies.spawnChance) {
							let enemy = enemyList[Math.round(Math.random() * (enemyList.length - 1))];
							enemy = new enemy(new Point(x, y));
							enemy = this.generateEquipment(enemy);
							enemies.push(enemy);
						}
					}
				}
				return enemies;
			}

			static generateEquipment(enemy) {
				if (enemy.canWield) {
					enemy.equipment.weapon = Utils.generateRandomWeapon();
				}
				if (enemy.canWear) {

				}
				return enemy;
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

				if (options.stairs.up) {
					//put an upstairs on player
					objs.push(new Stair(new Point(rooms[0].x + 1, rooms[0].y + 1), "up"));
				}

				if (options.stairs.down) {
					//put a downstairs in "last" room
					objs.push(new Stair(new Point(rooms[options.rooms.count - 1].x + 1, rooms[options.rooms.count - 1].y + 1), "down"));
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
					objs = objs.concat(this.insertEnemies(room, options));
				});

				//carve out paths
				paths.forEach(path => {
					for (let i0 = Math.min(path.x1, path.x2), i1 = Math.max(path.x1, path.x2); i0 < i1; i0++) {
						matrix[path.y1][i0].empty();
					}
					for (let i0 = Math.min(path.y2, path.y3), i1 = Math.max(path.y2, path.y3); i0 < i1; i0++) {
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
					objs
				};
			}

			static get defaultOptions() {
				return {
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
