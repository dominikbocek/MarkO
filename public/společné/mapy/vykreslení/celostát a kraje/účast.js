import { nactenimapy, nacteni_csv } from "/společné/mapy/vykreslení/načtení.js"
import { vykresleni_zaklad } from "/společné/mapy/vykreslení/vykreslení.js"

export async function vykresleni() {
  // vykreslení mapy

  const svg = d3.select("#mapa g")

  let data = await nactenimapy(parametry.data)
  let csv = await nacteni_csv(parametry.statistiky)

  const subunits = await vykresleni_zaklad(data, csv)

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
    .attr("fill", function(d) { return color(d.properties.ucast !== undefined ? Math.round((d.properties.ucast)*100)/100: d.properties.PL_HL_CELK !== undefined && d.properties.VOL_SEZNAM !== undefined ? Math.round(((d.properties.PL_HL_CELK / d.properties.VOL_SEZNAM) * 10000))/100 : null);})
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