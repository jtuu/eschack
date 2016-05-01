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