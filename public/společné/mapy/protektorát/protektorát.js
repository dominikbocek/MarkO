import { nactenimapy } from "/společné/mapy/vykreslení/načtení.js"

//Protektorát
//vykreslení mapy
export async function sudety(subunitsCR) {
  const svg = d3.select("#mapa #protektorat");

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
    .attr("stroke", "white") // výchozí barva, lze změnit v nastavení
}

// okresy 1950

export async function okresy1950(subunitsCR) {
  const svg = d3.select("#mapa #okresy1950");

  const data = await nactenimapy("/společné/mapy/protektorát/Okresy_1950.json")

  var projection = d3.geoMercator()
  projection.fitExtent([[0, 0], [1450, 750]], subunitsCR);

  var path = d3.geoPath()
    .projection(projection);

  // vykreslíme obce
  svg.selectAll(".okresy1950")
    .data(data.features)
    .enter().append("path")
    .attr("class", function(d) { return "okresy1950" })
    .attr("fill", "none")
    .attr("d", path)
}

export async function okresy1960(subunitsCR) {
  const svg = d3.select("#mapa #okresy1960");

  const data = await nactenimapy("/společné/mapy/protektorát/Okresy_1961.json")

  var projection = d3.geoMercator()
  projection.fitExtent([[0, 0], [1450, 750]], subunitsCR);

  var path = d3.geoPath()
    .projection(projection);

  // vykreslíme obce
  svg.selectAll(".okresy1960")
    .data(data.features)
    .enter().append("path")
    .attr("class", function(d) { return "okresy1960" })
    .attr("fill", "none")
    .attr("d", path)
    .attr("stroke", "white") // výchozí barva, lze změnit v nastavení
}