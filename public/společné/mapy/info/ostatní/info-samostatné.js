import { infonazev, tooltip } from "/společné/mapy/info/info základ.js"

export function info(d) {
  let podil = d.properties["PROCENTA"] !== undefined ? `${Math.round((d.properties["PROCENTA"])*100)/100} %`: null
  const udaje = {
    "podil": podil,
    "nazev": infonazev(d)
  }

  tooltip.html(`<b>${udaje["nazev"]}</b><br>`
  +(udaje["podil"]==null?"Data nejsou dostupná":`Podíl hlasů: ${udaje["podil"]}<br>`));
}