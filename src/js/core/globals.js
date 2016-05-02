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
