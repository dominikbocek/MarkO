// vykreslení legendy

var Svg = d3.select("#mapa")

  // create a list of keys
  var keys = []
  var barvy = []
  fetch(legenda)
    .then(res => res.json())
    .then(data => {
        for(let i = 0; i < 10; i++) {keys.push(data[i]["strana"] + " (" + Math.round(data[i]["proc_hlasu"] * 100) / 100 + "%)"); barvy.push(data[i]["color"])}
          // Add one dot in the legend for each name.
  g = Svg.selectAll("mydots").data(keys).enter().append("g")
  puntik = g.insert("circle")
  puntik.attr("cx", 1080)
  puntik.attr("cy", function(d,i){ return 100 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
  puntik.attr("r", 8)
  //puntik.attr("x", 800)
  puntik.style("fill", barvy)
  puntik.style("outline", "solid 1px rgb(117,117,117)")
  puntik.style("border-radius", "8px")

  text = g.insert("text")
  text.attr("x", 1100)
  text.attr("y", function(d,i){ return 100 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
  //.style("fill", function(d){ return color(d)})
  text.text(function(d){ return d})
  text.attr("text-anchor", "left")
  text.style("alignment-baseline", "middle")
        
    var koule = document.querySelectorAll("circle")
    for (var y = 0; y < koule.length; y++) {
      koule[y].style.fill = barvy[y]
    }
    })