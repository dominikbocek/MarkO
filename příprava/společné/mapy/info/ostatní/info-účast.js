import { infonazev, tooltip } from "/společné/mapy/info/info základ.js"

export function info(d) {
    let ucast = d.properties.ucast !== undefined ? `${Math.round((d.properties.ucast)*100)/100} %`: d.properties.PL_HL_CELK !== undefined && d.properties.VOL_SEZNAM !== undefined ? `${Math.round(((d.properties.PL_HL_CELK / d.properties.VOL_SEZNAM) * 10000))/100} %` : null
    const udaje = {
        "ucast": ucast,
        "nazev": infonazev(d)
    }

    tooltip.html(`<b>${udaje["nazev"]}</b><br>`
    +(udaje["ucast"]==null?"Data nejsou dostupná":`Volební účast: ${udaje["ucast"]}<br>`));
}