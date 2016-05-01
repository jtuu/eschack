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