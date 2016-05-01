/* 
@depends point.class.js
@depends ../abstract/gameobject.class.js
 */
//tiles have constant positions and they contain gameobjects
//they live in TileGroups
//perhaps this should extend GameObject?
const Tile = class Tile {
	constructor(point, ...contents) {
		this.position = point;
		this.contents = [];
	}

	//check if tile has anything in it
	get isEmpty() {
		return this.contents.length === 0;
	}

	//add object to tiles container
	add(obj) {
		if (!obj instanceof GameObject) throw new TypeError("Added object must be of type GameObject.");
		if(obj.isMoveBlocking){
			this.contents.unshift(obj);
		}else{
			this.contents.push(obj);
		}
	}

	//remove from tiles container
	remove(obj) {
		let index = this.contents.indexOf(obj);
		if(index > -1){
			this.contents.splice(index, 1);
			return true;
		}
		return false;
	}

	//get the first object in container
	get top() {
		return this.contents[0];
	}

	//remove everything from container
	empty() {
		this.contents = [];
	}

	//get all contents
	get get() {
		return this.contents;
	}

	toString() {
		return "Floor";
	}
};