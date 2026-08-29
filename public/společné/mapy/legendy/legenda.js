// vykreslení legendy

let popisky = d3.select("#legenda")

  // create a list of keys
  let keys = []
  let barvy = []
  fetch(parametry.legendazdroj)
    .then(res => res.json())
    .then(data => {let x = data.length > 10 ? 10: data.length;
        for(let i = 0; i < x; i++) {
            let nazev = parametry.druh=="prezidentské"?data[i]["kandidat"]:data[i]["strana"];
            keys.push(nazev + " (" + Math.round(data[i]["proc_hlasu"] * 100) / 100 + " %)"); barvy.push(data[i]["color"])
        }
        // Add one dot in the legend for each name.
        let g = popisky.selectAll("mydots").data(keys).enter().append("g")
        let puntik = g.insert("circle")
        puntik.attr("cx", 80)
        puntik.attr("cy", function(d,i){ return 100 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
        puntik.attr("r", 8)
        //puntik.attr("x", 800)
        puntik.style("fill", barvy)
        puntik.style("outline", "solid 1px rgb(117,117,117)")
        puntik.style("border-radius", "8px")

        let text = g.insert("text")
        text.attr("x", 110)
        text.attr("y", function(d,i){ return 100 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
        //.style("fill", function(d){ return color(d)})
        text.text(function(d){ return d})
        text.attr("text-anchor", "left")
        text.style("alignment-baseline", "middle")
        
        let koule = d3.selectAll("circle")
        for (var y = 0; y < koule._groups[0].length; y++) {
            koule._groups[0][y].style.fill = barvy[y]
        }
    })