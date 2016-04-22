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
				e.stopPropagation();
				e.cancelBubble();
				e.preventDefault();
				elemX = e.pageX - elem.offsetLeft;
				elemY = e.pageY - elem.offsetTop;
				dragging = "body";
				selected = elem;
			});
		}

		if (elem.classList.contains("resizeable")) {
			right.addEventListener("mousedown", e => {
				e.stopPropagation();
				e.cancelBubble();
				e.preventDefault();
				dragging = "right";
				selected = elem;
			});

			bottom.addEventListener("mousedown", e => {
				e.stopPropagation();
				e.cancelBubble();
				e.preventDefault();
				dragging = "bottom";
				selected = elem;
			});

			elem.appendChild(right);
			elem.appendChild(bottom);
		}
	});

	document.addEventListener("mousemove", e => {
		e.preventDefault();
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
		e.stopPropagation();
		e.cancelBubble();
		e.preventDefault();
		dragging = false;
		selected = undefined;
	});
})();