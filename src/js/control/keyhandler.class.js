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
