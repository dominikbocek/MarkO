import { nactenimapy, nactenistran } from "/společné/mapy/vykreslení/načtení.js"

export async function vykresleni() {
  //vykreslení mapy
  const svg = d3.select("#mapa g")

  window.data = await nactenimapy(parametry.data)
  const strany = await nactenistran(parametry.strany)

  const subunits = topojson.feature(data, data.objects.tracts) // obce

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
        return strany[px]['color']
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