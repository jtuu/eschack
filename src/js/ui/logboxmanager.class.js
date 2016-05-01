//manages logging
const LogboxManager = class LogboxManager {
	constructor(logbox, rowCount) {
		this.logbox = logbox;

		this.rowCount = rowCount;
		this.rows = [];
		this.messages = [];

		for (let i = 0; i < this.rowCount; i++) {
			let row = document.createElement("div");
			row.className = "logbox-row";
			row.id = "logbox-row-" + (i + 1);
			this.logbox.appendChild(row);
			this.rows.push(row);
		}
	}

	//this handles inserting new messages and moving old etc
	//type is the css class used
	log(text, type = "default") {
		text = text.charAt(0).toUpperCase() + text.slice(1);

		let msg = document.createElement("span");
		msg.className = "logmsg logmsg-" + type;
		msg.innerHTML = text;

		this.messages.push(msg);

		let target = this.rows.find(row => row.children.length === 0);

		if (target) {
			target.appendChild(msg);
		} else {
			this.rows[0].children[0].remove();
			this.rows.forEach((row, index) => {
				row.appendChild(this.messages[this.messages.length - (this.rowCount - index)]);
			});
		}
	}
};