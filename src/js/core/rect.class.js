const Rect = class Rect {
	constructor(bounds) {
		Object.assign(this, bounds);
		if (!this.type) {
			this.type = Rect.type.DEFAULT;
		}
	}

	static get type() {
		return {
			DEFAULT: 0,
			ROOM: 1,
			PATH: 2,
			CHUNK: 3,
			DOOR: 4
		};
	}

	get mids() {
		return {
			top: new Rect({
				x: ~~(this.x + this.w / 2),
				y: this.y,
				w: 1,
				h: 1
			}),
			left: new Rect({
				x: this.x,
				y: ~~(this.y + this.h / 2),
				w: 1,
				h: 1
			}),
			right: new Rect({
				x: this.x + this.w,
				y: ~~(this.y + this.h / 2),
				w: 1,
				h: 1
			}),
			bottom: new Rect({
				x: ~~(this.x + this.w / 2),
				y: this.y + this.h,
				w: 1,
				h: 1
			})
		};
	}

	shrink(amount) {
		if (amount !== ~~amount) {
			this.x += Math.floor(amount);
			this.y += Math.floor(amount);
			this.w -= Math.ceil(amount);
			this.h -= Math.ceil(amount);
		} else {
			this.x += amount;
			this.y += amount;
			this.w -= amount * 2;
			this.h -= amount * 2;
		}
	}

	grow(amount) {
		if (amount !== ~~amount) {
			this.x -= Math.floor(amount);
			this.y -= Math.floor(amount);
			this.w += Math.ceil(amount);
			this.h += Math.ceil(amount);
		} else {
			this.x -= amount;
			this.y -= amount;
			this.w += amount * 2;
			this.h += amount * 2;
		}
	}

	clone() {
		return new Rect({
			x: this.x,
			y: this.y,
			w: this.w,
			h: this.h,
			type: this.type
		});
	}

	intersect(rect2) {
		let r1l = this.x,
			r1r = this.x + this.w,
			r1t = this.y,
			r1b = this.y + this.h;
		let r2l = rect2.x,
			r2r = rect2.x + rect2.w,
			r2t = rect2.y,
			r2b = rect2.y + rect2.h;
		let diffs = {
			left: Infinity,
			right: Infinity,
			bottom: Infinity,
			top: Infinity,
		};

		if (r1r >= r2l && r1l <= r2l) {
			diffs.left = r1r - r2l;
		}
		if (r1l <= r2r && r1r >= r2r) {
			diffs.right = r2r - r1l;
		}
		if (r1t <= r2b && r1b >= r2b) {
			diffs.top = r1t - r2b;
		}
		if (r1b >= r2t && r1t <= r2t) {
			diffs.bottom = r2t - r1b;
		}
		let min = Object.keys(diffs).map(k => diffs[k]).reduce((p, c) => c < p ? c : p);

		if (min === Infinity) {
			return false;
		}

		return Object.keys(diffs).find(k => diffs[k] === min);
	}

	get split() {
		return {
			h: pos => {
				pos = pos || ~~(Math.random() * this.h);
				return [
					new Rect({
						x: this.x,
						y: this.y,
						w: this.w,
						h: pos,
						splitDir: "h"
					}),
					new Rect({
						x: this.x,
						y: this.y + pos,
						w: this.w,
						h: this.h - pos,
						splitDir: "h"
					})
				];
			},
			w: pos => {
				pos = pos || ~~(Math.random() * this.w);
				return [
					new Rect({
						x: this.x,
						y: this.y,
						w: pos,
						h: this.h,
						splitDir: "w"
					}),
					new Rect({
						x: this.x + pos,
						y: this.y,
						w: this.w - pos,
						h: this.h,
						splitDir: "w"
					})
				];
			}
		};
	}

};
