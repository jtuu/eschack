/* @depends gameobject.class.js */
const Item = class Item extends GameObject{
	constructor(position){
		super(position);
		this.canDrop = true;
	}
	
	update(){
		return true;
	}
};