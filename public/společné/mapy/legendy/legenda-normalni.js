// vykreslení legendy

export function legenda_normalni(element, data, druhvoleb) {

    let keys = []
    let barvy = []

    let x = data.length > 10 ? 10: data.length;
    for(let i = 0; i < x; i++) {
        let nazev = druhvoleb=="prezidentské"?data[i]["kandidat"]:data[i]["strana"];
        keys.push(nazev + " (" + Math.round(data[i]["proc_hlasu"] * 100) / 100 + " %)"); barvy.push(data[i]["color"])
    }
    // Add one dot in the legend for each name.
    let g = element.append("g")
    g.attr("transform", "translate(80,30)")
    let subjekt = g.selectAll("mydots").data(keys).enter().append("g")
    let puntik = subjekt.insert("circle")
    let startovanipozice = 0
    let polomerkoule = 4
    let odsazenitextu = 30
    puntik.attr("cx", 0)
    puntik.attr("cy", function(d,i){ return startovanipozice - polomerkoule + i*25})
    puntik.attr("r", polomerkoule*2)
    puntik.style("fill", barvy)
    puntik.style("outline", "solid 1px rgb(117,117,117)")
    puntik.style("border-radius", "8px")

    let text = subjekt.insert("text")
    text.attr("x", odsazenitextu)
    text.attr("y", function(d,i){ return startovanipozice + i*25})
    text.text(function(d){ return d})
    text.attr("text-anchor", "left")
    text.style("alignment-baseline", "middle")
            
    let koule = element.selectAll("circle")
    for (var y = 0; y < koule._groups[0].length; y++) {
        koule._groups[0][y].style.fill = barvy[y]
    }
}