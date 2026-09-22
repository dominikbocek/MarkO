export let tooltip = d3.select("#prohlizec")
    .append("dialog")
    .attr("id", "tooltip1")
    .attr("open", "true")

export let tooltip2 = d3.select("#prohlizec")
    .append("dialog")
    .attr("id", "tooltip2")
    .attr("open", "true")

export function infobox(subunits, strany, info) {
    let mapa = d3.select("#mapa")

    mapa.selectAll(".subunit")
    .data(subunits.features)
    .on("mouseover", function (event, d) {
        tooltip2.style("visibility", "visible");
        //tooltip.style("top", (event.offsetY-30)+"px").style("left",(event.offsetX)+"px")
        tooltip2.style("top", (event.offsetY-10)+"px").style("left",(event.offsetX+10)+"px")

        info(event, d, strany)
    })
    .on("click", function(event, d) {
        tooltip.style("visibility", "visible");
        tooltip.style("top", (event.offsetY-10)+"px").style("left",(event.offsetX+10)+"px")

        info(event, d, strany)
    })
    //.on("mousemove", function (d) {tooltip.style("top", (event.offsetY-10)+"px").style("left",(event.offsetX+30)+"px")})
    .on("mouseout", function () {tooltip2.style("visibility", "hidden")});
}

export function infonazev(d) {
    let nazev;

    if(d.properties["NAZEV"] !== undefined) {
        nazev = d.properties["NAZEV"]
    } else if (d.properties["naz_obec"] !== undefined) {
        if(d.properties["naz_mco"] !== undefined) {// pro případ okrskových map
            nazev = d.properties["naz_mco"]
        } else {
            nazev = d.properties["naz_obec"]
        }
    } else {
        nazev = undefined
    }

    return nazev
}

export function infonazev2(d, obvody) {
    let seznam_obvodu = Object.getOwnPropertyNames(obvody)
    for (let i = 0; i < seznam_obvodu.length; i++) {
        //console.log(obvody[element])
        if(obvody[seznam_obvodu[i]][1] == d.id.split("-")[0]) {
            return obvody[seznam_obvodu[i]][0]
        }
    }
}