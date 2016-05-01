//manages the inventory UI component
const InventoryManager = class InventoryManager{
	constructor(inventoryBox, inventory){
		this.wrapper = inventoryBox;
		this.inventory = inventory;
		let container = document.createElement("div");
		container.style.padding = "10px";
		this.container = container;
		this.wrapper.appendChild(this.container);
	}
	
	update() {
		if (!!this.container.children.length) {
			Array.from(this.container.children).forEach(item => item.remove());
		}
		this.inventory.forEach((item, key) => {
			let ele = document.createElement("div");
			ele.innerHTML = Utils.alphabetMap[key] + " - " + item;
			this.container.appendChild(ele);
		});
	}
};