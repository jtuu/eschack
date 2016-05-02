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
						(self.stats.time) / 1000 + 1
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
			if (this.logic.delegateAction(this.player, this.keyHandler.get(e.keyCode))) {
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
			objs
		} = dungeon,
		img = new Image();
		img.src = secondCanvas.toDataURL();
		this.dungeonLevels[this.stats.currentDungeonLevel] = {
			objs: [],
			rooms: rooms,
			paths: paths,
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
			//put player in the last room if we're going up
			if (dir === "up") {
				this.player.position.set(
					this.dungeonLevels[level].rooms[this.dungeonLevels[level].rooms.length - 1].x + 1,
					this.dungeonLevels[level].rooms[this.dungeonLevels[level].rooms.length - 1].y + 1
				);
			} else {
				//or in the first room
				this.player.position.set(
					this.dungeonLevels[level].rooms[0].x + 1,
					this.dungeonLevels[level].rooms[0].y + 1
				);
			}
		} else {
			let options = Utils.DungeonGenerator.defaultOptions;
			options.stairs.up = true;
			let dungeon = Utils.DungeonGenerator.makeLevel(this.player, options);
			objs = dungeon.objs;
			this.dungeonLevels[level] = {
				objs: [],
				rooms: dungeon.rooms,
				paths: dungeon.paths
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
			fov.draw();
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
