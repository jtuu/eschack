const EquipmentManager = class EquipmentManager {
	constructor(equipmentBox, equipment) {
		this.wrapper = equipmentBox;
		this.equipment = equipment;
		let container = document.createElement("div");
		container.style.padding = "10px";
		this.container = container;
		this.wrapper.appendChild(this.container);
	}

	update() {
		if (!!this.container.children.length) {
			Array.from(this.container.children).forEach(item => item.remove());
		}
		Object.keys(this.equipment).filter(k => this.equipment[k]).forEach((k, i) => {
			let parent = document.createElement("div"),
				key = document.createElement("div"),
				slot = document.createElement("div"),
				value = document.createElement("div");

			parent.className = "equipment-row";
			key.className = "equipment-key";
			slot.className = "equipment-slot";
			value.className = "equipment-item";

			key.innerHTML = Utils.alphabetMap[i];
			slot.innerHTML = k;
			value.innerHTML = this.equipment[k];

			parent.appendChild(key);
			parent.appendChild(slot);
			parent.appendChild(value);
			this.container.appendChild(parent);
		});
	}
};
