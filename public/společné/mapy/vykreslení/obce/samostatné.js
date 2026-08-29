import { nactenimapy } from "/společné/mapy/vykreslení/načtení.js"

export async function vykresleni() {
  // vykreslení mapy
  const svg = d3.select("#mapa g")

  const data = await nactenimapy(`${parametry.hledanastrana}.csv-volebni_okrsky-simple-data-topo.json`)

  const subunits = topojson.feature(data, data.objects.tracts) // obce

  var projection = d3.geoMercator()
    //.center(d3.geoCentroid(subunits)) //střed obce
  projection.fitExtent([[0, 0], [1450, 750]], subunits);

  var path = d3.geoPath()
    .projection(projection);

  // vykreslíme obce
  svg.selectAll(".subunit")
    .data(subunits.features)
    //.insert("g")
    .enter().append("path")
    .attr("class", function(d) { return "subunit " + d.id; })
    .attr("fill", function(d) { return color(d.properties["PROCENTA"]); })
    .attr("d", path)

  window.onresize = function() {
    projection.fitExtent([[0, 0], [1450, 750]], subunits);
    svg.selectAll(".subunit")
      .attr("d", path)
  }

  return {
    subunits: subunits
  }
}