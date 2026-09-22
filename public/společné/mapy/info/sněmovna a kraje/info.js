import { infonazev, tooltip, tooltip2 } from "/společné/mapy/info/info základ.js"

export function info(event, d, strany) {
  let hlasy = []

  for (let i = 1; i <= parseInt(d.properties.POCET_VS); i++) {
    hlasy.push(i)
  }
                    
  hlasy.sort((a,b) => {
    return parseInt(d.properties[b.toString()]) - parseInt(d.properties[a.toString()])
  })

  let strana = function (poradi) {return strany.filter(function(element) {if(element["KSTRANA"] == hlasy[poradi]) {return element["KSTRANA"]}})[0]}

  let ucast = Math.round((Number(d.properties.PL_HL_CELK) / Number(d.properties.VOL_SEZNAM))*10000)/100 + "%"
  let pocet_stran = d.properties.POCET_VS !== undefined ? d.properties.POCET_VS: null
  let prvnimisto = {"strana": strana(0) !== undefined ? strana(0)["zkratka"]: "data nejsou dostupná", "podil": strana(0) !== undefined ? `${Math.round((d.properties[hlasy[0].toString()]/d.properties.PL_HL_CELK)*10000)/100} %`: "data nejsou dostupná"}
  let druhemisto = {"strana": strana(1) !== undefined ? strana(1)["zkratka"]: "data nejsou dostupná", "podil": strana(1) !== undefined ? `${Math.round((d.properties[hlasy[1].toString()]/d.properties.PL_HL_CELK)*10000)/100} %`: "data nejsou dostupná"}
  let tretimisto = {"strana": strana(2) !== undefined ? strana(2)["zkratka"]: "data nejsou dostupná", "podil": strana(2) !== undefined ? `${Math.round((d.properties[hlasy[2].toString()]/d.properties.PL_HL_CELK)*10000)/100} %`: "data nejsou dostupná"}
  
  const udaje = {
    "nazev": infonazev(d),
    "pocet_stran": pocet_stran, //asi už není nadále potřeba, ale co já vím...
    "ucast": ucast,
    "prvnimisto": prvnimisto,
    "druhemisto": druhemisto,
    "tretimisto": tretimisto
  }

  if(event.type == "click") {
    tooltip.html(`<b>${udaje["nazev"]}</b><br>`
    +(udaje["pocet_stran"]==null?"Data nejsou dostupná":
      `Volební účast: ${udaje["ucast"]}<br>
      Vítěz: ${udaje["prvnimisto"]["strana"]} (${udaje["prvnimisto"]["podil"]})<br>
      Druhé místo: ${udaje["druhemisto"]["strana"]} (${udaje["druhemisto"]["podil"]})<br>
      `+(udaje["pocet_stran"]>2?`Třetí místo: ${udaje["tretimisto"]["strana"]} (${udaje["tretimisto"]["podil"]})`:""))+`<button type="button" onclick="document.getElementById('tooltip1').style.visibility = 'hidden'" class="btn-close" aria-label="Close"></button>`
    );
  }

  if(event.type == "mouseover") {
    tooltip2.html(`<b>${udaje["nazev"]}</b>`)
  }
}