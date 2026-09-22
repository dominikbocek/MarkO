import { infonazev, tooltip, tooltip2 } from "/společné/mapy/info/info základ.js"

export function info(event, d) {
    let ucast = d.properties.ucast !== undefined ? `${Math.round((d.properties.ucast)*100)/100} %`: d.properties.PL_HL_CELK !== undefined && d.properties.VOL_SEZNAM !== undefined ? `${Math.round(((d.properties.PL_HL_CELK / d.properties.VOL_SEZNAM) * 10000))/100} %` : null
    const udaje = {
        "ucast": ucast,
        "nazev": infonazev(d)
    }

    if(event.type == "click") {
        tooltip.html(`<b>${udaje["nazev"]}</b><br>`
        +(udaje["ucast"]==null?"Data nejsou dostupná":`Podíl hlasů: ${udaje["ucast"]}<br>`)+`<button type="button" onclick="document.getElementById('tooltip1').style.visibility = 'hidden'" class="btn-close" aria-label="Close"></button>`);
    }

    if(event.type == "mouseover") {
        tooltip2.html(`<b>${udaje["nazev"]}</b><br>`);
    }
}