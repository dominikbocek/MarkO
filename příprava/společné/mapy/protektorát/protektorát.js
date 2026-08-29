import { nactenimapy } from "/společné/mapy/vykreslení/načtení.js"

//Protektorát
//vykreslení mapy
export async function sudety(subunitsCR) {
  let meritko = 7000
  const svg = d3.select("#mapa");

  const data = await nactenimapy("/společné/mapy/protektorát/protektorát.json")

  const subunits = topojson.feature(data, data.objects.tracts) // obce

  var projection = d3.geoMercator()
  projection.fitExtent([[0, 0], [1450, 750]], subunitsCR);

  var path = d3.geoPath()
    .projection(projection);

  // vykreslíme obce
  svg.selectAll(".protektorat")
    .data(subunits.features)
    .enter().append("path")
    .attr("class", function(d) { return "protektorat" })
    .attr("fill", "none")
    .attr("d", path)
}