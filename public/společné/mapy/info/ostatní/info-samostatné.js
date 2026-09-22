import { infonazev, tooltip, tooltip2 } from "/společné/mapy/info/info základ.js"

export function info(event, d) {
  let podil = d.properties["PROCENTA"] !== undefined ? `${Math.round((d.properties["PROCENTA"])*100)/100} %`: null
  const udaje = {
    "podil": podil,
    "nazev": infonazev(d)
  }

  if(event.type == "click") {
    tooltip.html(`<b>${udaje["nazev"]}</b><br>`
    +(udaje["podil"]==null?"Data nejsou dostupná":`Podíl hlasů: ${udaje["podil"]}<br>`)+`<button type="button" onclick="document.getElementById('tooltip1').style.visibility = 'hidden'" class="btn-close" aria-label="Close"></button>`);
  }

  if(event.type == "mouseover"){
    tooltip2.html(`<b>${udaje["nazev"]}</b><br>`)
  }
}