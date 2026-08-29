export let tooltip = d3.select("figure div")
    .append("div")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background", "white")
    .style("border", "solid #222 1px")
    .style("padding", "5px")
    .style("top", "0")
    .style("right", "0")
    .style("width", "400px")
    .style("height", "100svh")

export function infobox(subunits, strany, info) {
    let mapa = d3.select("#mapa")

    mapa.selectAll(".subunit")
    .data(subunits.features)
    .on("mouseover", function (event, d) {
        tooltip.style("visibility", "visible");

        info(d, strany)
    })
    //.on("mousemove", function (d) {tooltip.style("top", (event.offsetY-10)+"px").style("left",(event.offsetX+30)+"px")})
    .on("mouseout", function () {tooltip.style("visibility", "hidden")});
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
            break
        }
    }
}