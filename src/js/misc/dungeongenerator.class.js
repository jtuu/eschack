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
