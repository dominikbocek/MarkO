export let tooltip = d3.select("#prohlizec")
    .append("dialog")
    .attr("id", "tooltip1")
    .attr("open", "true")
    .html(`<button type="button" onclick="document.getElementById('tooltip1').style.visibility = 'hidden'" class="btn-close" aria-label="Close"></button>`)
    .append("div")

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
        tooltip2.style("top", (event.offsetY-10)+"px").style("left",(event.offsetX+10)+"px")

        info(event, d, strany)
    })
    .on("click", function(event, d) {
        d3.select("#tooltip1").style("visibility", "visible");
        d3.select("#tooltip1").style("top", (event.offsetY-10)+"px").style("left",(event.offsetX+10)+"px")

        info(event, d, strany)
    })
    //.on("mousemove", function (d) {tooltip.style("top", (event.offsetY-10)+"px").style("left",(event.offsetX+30)+"px")})
    .on("mouseout", function () {tooltip2.style("visibility", "hidden")});
}

function infonazev_stat(d) {
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

function infonazev2_obce_obvody(d) {
    let obvody
    return "Dočasně nedostupné..."
}

export function infonazev(d, obvody) {
    if(parametry.lokalita == "stát" || parametry.druh !== "komunální") {
        return infonazev_stat(d)
    } else if(parametry.lokalita == "obec" || parametry.lokalita == "obvod") {
        console.log("test")
        return infonazev2_obce_obvody(d, obvody)
    }
}