/* @depends ../abstract/dungeonfeature.class.js */
const Stair = class Stair extends GameObject{
	constructor(position, direction){
		super(position);
		this.direction = direction;
		this.bgColor = "hsl(0,0%,35%)";
		
		if(this.direction === "up"){
			this.glyph = "<";
		}else if(this.direction === "down"){
			this.glyph = ">";
		}
		this.color = "hsl(0,0%,75%)";
		this.flavorName = this.direction+"stair";
	}
	
	update(){
		return 0;
	}
	
	toString(){
		return "A staircase going "+this.direction;
	}
};