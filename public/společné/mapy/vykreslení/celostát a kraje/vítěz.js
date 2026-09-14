import { nactenimapy, nactenistran, nacteni_csv } from "/společné/mapy/vykreslení/načtení.js"
import { vykresleni_zaklad } from "/společné/mapy/vykreslení/vykreslení.js"

export async function vykresleni() {
  // vykreslení mapy

  const svg = d3.select("#mapa g")

  window.data = await nactenimapy(parametry.data)
  window.strany = await nactenistran(parametry.legendazdroj)
  window.csv = await nacteni_csv(parametry.statistiky)

  window.subunits = await vykresleni_zaklad(data, csv)

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
        switch (parametry.druh) {
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
        window.vitezny_subjekt = strany.filter(function(element) {return Number(element[identifikator]) == px})
        return vitezny_subjekt[0]['color']
      }
    })
    .attr("d", path)

  window.onresize = function() {
    projection.fitExtent([[0, 0], [1450, 750]], subunits);
    svg.selectAll(".subunit")
      .attr("d", path)
  }


  return {
    subunits: subunits,
    strany: strany
  }
}