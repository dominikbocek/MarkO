import { legenda_skala, color } from "../../legendy/legenda-skala.mjs"

export async function vykresleni(svg, rozsah = null, geojson = null) {
  // vykreslení mapy

  let d3, legendaelement, nacteni, vykresleni_zaklad, data, csv, procentualnirozsah, subunits

  await (async() => {
    if(typeof(window) == "undefined") {// běžíme na serveru
      d3 = await import("d3")
      subunits = geojson
      procentualnirozsah = rozsah
      legendaelement = svg
    } else {
      d3 = window.d3
      legendaelement = d3.select("#legenda")
      nacteni = await import("/společné/mapy/vykreslení/načtení.js")
      vykresleni_zaklad = await import("/společné/mapy/vykreslení/vykreslení.js")

      data = await nacteni.nactenimapy(parametry.data)
      csv = await nacteni.nacteni_csv(parametry.csv)

      subunits = await vykresleni_zaklad.vykresleni_zaklad(data, csv)

      procentualnirozsah = parametry.rozsah
    }
  })()

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