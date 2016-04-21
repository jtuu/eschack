(function() {
	var elems = Array.from(document.querySelectorAll(".moveable, .resizeable"));

	var dragging = false,
		selected,
		elemX = 0,
		elemY = 0;

	elems.forEach(elem => {
		let right = document.createElement("div"),
			bottom = document.createElement("div");
		right.classList.add("edge");
		bottom.classList.add("edge");

		right.classList.add("edge-right");
		bottom.classList.add("edge-bottom");

		if (elem.classList.contains("moveable")) {
			elem.addEventListener("mousedown", e => {
				elemX = e.pageX - elem.offsetLeft;
				elemY = e.pageY - elem.offsetTop;
				dragging = "body";
				selected = elem;
				e.stopPropagation();
			});
		}

		if (elem.classList.contains("resizeable")) {
			right.addEventListener("mousedown", e => {
				dragging = "right";
				selected = elem;
				e.stopPropagation();
			});

			bottom.addEventListener("mousedown", e => {
				dragging = "bottom";
				selected = elem;
				e.stopPropagation();
			});

			elem.appendChild(right);
			elem.appendChild(bottom);
		}
	});

	document.addEventListener("mousemove", e => {
		if (dragging && selected) {
			if (dragging === "right") {
				selected.style.width = selected.offsetWidth + (e.pageX - selected.offsetWidth) - selected.offsetLeft + "px";
			} else if (dragging === "bottom") {
				selected.style.height = selected.offsetHeight + (e.pageY - selected.offsetHeight) - selected.offsetTop + "px";
			} else if (dragging === "body") {
				selected.style.top = e.pageY - elemY + "px";
				selected.style.left = e.pageX - elemX + "px";
			}
		}
	});

	document.addEventListener("mouseup", e => {
		dragging = false;
		selected = undefined;
	});
})();