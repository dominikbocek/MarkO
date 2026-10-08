import { infonazev, tooltip, tooltip2 } from "/společné/mapy/info/info základ.js"

export function info(event, d) {
  let podil = d.properties["PROCENTA"] !== undefined ? `${Math.round((d.properties["PROCENTA"])*100)/100} %`: null
  const udaje = {
    "podil": podil,
    "nazev": infonazev(d, window.obvody)
  }

  if(event.type == "click") {
    tooltip.html(`<b>${udaje["nazev"]}</b><br>`
    +(udaje["podil"]==null?"Data nejsou dostupná":`Podíl hlasů: ${udaje["podil"]}<br>`));
  }

  if(event.type == "mouseover"){
    tooltip2.html(`<b>${udaje["nazev"]}</b><br>`)
  }
}