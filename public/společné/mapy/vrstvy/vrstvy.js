import { nactenimapy } from "/společné/mapy/vykreslení/načtení.js"

//vykreslení vrstvy
export async function vykreslit_vrstvu(subunitsCR, vrstva) {
  const svg = d3.select(`#${vrstva["selector"]}`);

  const data = await nactenimapy(vrstva["url"])

  var projection = d3.geoMercator()
  projection.fitExtent([[0, 0], [1450, 750]], subunitsCR);

  var path = d3.geoPath()
    .projection(projection);

  // vykreslíme obce
  return svg.selectAll(`.${vrstva["selector"]}`)
    .data(data.features)
    .enter().append("path")
    .attr("class", function(d) { return vrstva["selector"] })
    .attr("fill", "none")
    .attr("d", path)
    .attr("stroke", document.getElementById("barva").value)
}