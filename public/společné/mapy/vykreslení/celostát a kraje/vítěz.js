import { legenda_normalni } from "../../legendy/legenda-normalni.js"
import { nactenimapy, nactenistran, nacteni_csv } from "/společné/mapy/vykreslení/načtení.js"
import { vykresleni_zaklad } from "/společné/mapy/vykreslení/vykreslení.js"

export async function vykresleni(svg, druhvoleb, geojson = null, stranyjson = null) {
  // vykreslení mapy

  let legendaelement = d3.select("#legenda")

  const data = await nactenimapy(parametry.data)
  const strany = await nactenistran(parametry.legendazdroj)
  const csv = await nacteni_csv(parametry.statistiky)

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
    .attr("fill", function(d) {
      let mx = 0
      let px = ''
      for (let i = 1; i <= d.properties.POCET_VS; i++) {// v případě, že počet subjektů převýší uvedené číslo, je potřeba ho zvýšit, jinak budou subjekty nad limitem ignorovány
        let v = parseInt(d.properties[ i.toString() ])
        if (v > mx) {
          mx = v
          px = i
        }
      }

      if (px == '') {
        return "#aaa"
      } else {
        let identifikator

        switch (druhvoleb) {
          case "prezidentské":
            identifikator = "CKAND"
            break;
          case "sněmovní":
            identifikator = "KSTRANA"
            break;
          case "krajské":
            identifikator = "KSTRANA"
            break;
          default:
            break;
        }

        let vitezny_subjekt = strany.filter(function(element) {return Number(element[identifikator]) == px})
        return vitezny_subjekt[0]['color']
      }
    })
    .attr("d", path)
    .attr("stroke", "#888")
    .attr("stroke-width", "0.25px")
    .attr("stroke-linejoin", "round")

  legenda_normalni(legendaelement, strany, druhvoleb)

  return {
    subunits: subunits,
    strany: strany
  }
}