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
							actor.cheatMode = true;
							this.logger.log("Cheat mode activated", "hilight");
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
