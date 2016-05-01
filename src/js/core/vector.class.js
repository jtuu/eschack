const Vector = class Vector {
	constructor(u, v) {
		//if no arguments, use random values in [-1, 0, 1]
		this.u = isNaN(u) ? Math.sign(Math.random() * 10 - 5) : u;
		this.v = isNaN(v) ? Math.sign(Math.random() * 10 - 5) : v;
	}

	set(arr) {
		this.u = arr[0];
		this.v = arr[1];
	}

	get get() {
		return [this.u, this.v];
	}

	//basically this just sets the larger
	//absolute value to 1 and the smaller to 0
	reduce() {
		let vals = this.get;
		let absmax = Math.max.apply(null, vals.map(Math.abs));
		this.set(vals.map(v => Math.round(v / absmax)));
	}
};