const Lifebar = class Lifebar {
	constructor(id, name, container, stats) {
		this.id = id;
		this.name = name;
		this.stats = stats;

		this.container = container;

		let label = document.createElement("label");
		label.setAttribute("for", "bar-lifebar-" + this.name + "-" + this.id);
		label.innerHTML = this.name;
		this.label = label;

		let bar = document.createElement("div");
		bar.className = "bar bar-lifebar";
		bar.id = "bar-lifebar-" + this.name + "-" + this.id;
		this.bar = bar;

		this.set();

		this.container.appendChild(label);
		this.label.appendChild(bar);
	}

	set(value) {
		if (!isNaN(value)) {
			this.value = value;
		}
		this.bar.setAttribute("data-content", this.stats.HP + "/" + this.stats.maxHP);

		//approximate visual size, range [0...100]
		//do we need more precision? is this too much precision?
		let sizeClass = "bar-size-" + Math.max(Math.floor(this.stats.HP / this.stats.maxHP * 100), 0);
		if (this.bar.className.match(/size/)) {
			this.bar.className = this.bar.className.replace(/bar-size-[0-9]{1,3}/, sizeClass);
		} else {
			this.bar.classList.add(sizeClass);
		}
	}

	setStyle(style) {
		let styles = {
			"hilight": "hilighted",
			"default": "default"
		};
		style = styles[style];
		if (style) {
			//remove other styles
			Object.values(styles).filter(v => v !== style).forEach(f => {
				this.bar.classList.remove(f);
				this.label.classList.remove(f);
			});

			this.bar.classList.add(style);
			this.label.classList.add(style);
		}
	}

	//remove from dom
	remove() {
		this.bar.remove();
		this.label.remove();
	}

	hide() {
		this.bar.style.display = "none";
		this.label.style.display = "none";
	}

	show() {
		this.bar.style.display = "";
		this.label.style.display = "";
	}
};
