import { legenda_skala, color } from "../../legendy/legenda-skala.js"
import { nactenimapy, nacteni_csv } from "/společné/mapy/vykreslení/načtení.js"
import { vykresleni_zaklad } from "/společné/mapy/vykreslení/vykreslení.js"

export async function vykresleni(svg) {
  // vykreslení mapy

  const legendaelement = d3.select("#legenda")

  const data = await nactenimapy(parametry.data)
  const csv = await nacteni_csv(parametry.csv)

  const subunits = await vykresleni_zaklad(data, csv)

  const procentualnirozsah = parametry.rozsah

  var projection = d3.geoMercator()
    //.center(d3.geoCentroid(subunits)) //střed ČR
  projection.fitExtent([[0, 0], [1450, 750]], subunits);

  var path = d3.geoPath()
    .projection(projection);

  // vykreslíme obce
  svg.selectAll(".subunit")
    .data(subunits.features)
    .enter().append("path")
    .attr("class", function(d) { return "subunit " + d.id; })
    .attr("fill", function(d) { return color(procentualnirozsah)(d.properties["PROCENTA"]); })
    .attr("d", path)

  legenda_skala(legendaelement, procentualnirozsah)

  return {
    subunits: subunits
  }
}