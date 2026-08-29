const SVGelement = "#mapa"
const svg = d3.select(SVGelement)
var width = +svg.attr("width")
var height = +svg.attr("height")

let delka = 2000

let zoom = d3.zoom()
	.scaleExtent([1, 10])
    .duration(delka)
    .translateExtent([[0, 0], [1450, 750]])
	.on('zoom', handlezoom);

function initEvents() {
	d3.select('#zoom-in').on('click', zoomIn);
	d3.select('#zoom-out').on('click', zoomOut);
	d3.select('#reset-zoom').on('click', resetzoom);
	d3.select('#doleva').on('click', panRight);
	d3.select('#doprava').on('click', panLeft);
	d3.select('#nahoru').on('click', panDown)
	d3.select('#dolu').on('click', panUp)
}

function initzoom() {
	svg
		.call(zoom);
}

function handlezoom(e) {
	d3.selectAll(`${SVGelement} path`)
		.attr('transform', e.transform);
}

function zoomIn() {
	svg
		.transition()
        .duration(delka)
		.call(zoom.scaleBy, 2);
}

function zoomOut() {
	svg
		.transition()
        .duration(delka)
		.call(zoom.scaleBy, 0.5);
}

function resetzoom() {
	svg
		.transition()
        .duration(delka)
		.call(zoom.scaleTo, 1);
}

function panLeft() {
	svg
		.transition()
        .duration(0)
		.call(zoom.translateBy, -50, 0);
}

function panRight() {
	svg
		.transition()
        .duration(0)
		.call(zoom.translateBy, 50, 0);
}

function panUp() {
	svg
		.transition()
        .duration(0)
		.call(zoom.translateBy, 0, -50);
}

function panDown() {
	svg
		.transition()
        .duration(0)
		.call(zoom.translateBy, 0, 50);
}

initEvents();
initzoom()