(function() {
	var elems = Array.from(document.querySelectorAll(".moveable, .resizeable"));

	var dragging = false,
		selected,
		elemX = 0,
		elemY = 0;

	function move(e, elem) {
		if (e.target.classList.contains("moveable-anchor")) {
			e.stopPropagation();
			//e.cancelBubble();
			e.preventDefault();
			let x = e.pageX;
			let y = e.pageY;
			if (x === undefined) {
				x = e.touches[0].pageX;
				y = e.touches[0].pageY;
			}
			elemX = x - elem.offsetLeft;
			elemY = y - elem.offsetTop;
			dragging = "body";
			selected = elem;
		}
	}

	function startr(e, elem) {
		e.stopPropagation();
		//e.cancelBubble();
		e.preventDefault();
		dragging = "right";
		selected = elem;
	}

	function startb(e, elem) {
		e.stopPropagation();
		//e.cancelBubble();
		e.preventDefault();
		dragging = "bottom";
		selected = elem;
	}

	elems.forEach(elem => {
		let right = document.createElement("div"),
			bottom = document.createElement("div");
		right.classList.add("edge");
		bottom.classList.add("edge");

		right.classList.add("edge-right");
		bottom.classList.add("edge-bottom");

		if (elem.classList.contains("moveable")) {
			elem.addEventListener("mousedown", e => move(e, elem));
			elem.addEventListener("touchstart", e => move(e, elem));
		}

		if (elem.classList.contains("resizeable")) {
			bottom.addEventListener("mousedown", e => startb(e, elem));
			bottom.addEventListener("touchstart", e => startb(e, elem));
			right.addEventListener("mousedown", e => startr(e, elem));
			right.addEventListener("touchstart", e => startr(e, elem));

			elem.appendChild(right);
			elem.appendChild(bottom);
		}
	});

	function gmove(e) {
		//e.preventDefault();
		if (dragging && selected) {
			let x = e.pageX;
			let y = e.pageY;
			if (x === undefined) {
				x = e.touches[0].pageX;
				y = e.touches[0].pageY;
			}
			if (dragging === "right") {
				selected.style.width = selected.offsetWidth + (x - selected.offsetWidth) - selected.offsetParent.offsetLeft - selected.offsetLeft + "px";
			} else if (dragging === "bottom") {
				selected.style.height = selected.offsetHeight + (y - selected.offsetHeight) - selected.offsetParent.offsetTop - selected.offsetTop + "px";
			} else if (dragging === "body") {
				selected.style.top = y - elemY + "px";
				selected.style.left = x - elemX + "px";
			}
		}
	}

	document.addEventListener("mousemove", gmove);
	document.addEventListener("touchmove", gmove);

	function end(e) {
		e.stopPropagation();
		//e.cancelBubble();
		//e.preventDefault();
		dragging = false;
		selected = undefined;
	}

	document.addEventListener("mouseup", end);
	document.addEventListener("touchend", end);
})();
