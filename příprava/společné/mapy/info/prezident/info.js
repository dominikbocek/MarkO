import { infonazev, tooltip } from "/společné/mapy/info/info základ.js"

export function info(d, strany) {
  let hlasy = []

  for (let i = 1; i <= parseInt(d.properties.POCET_VS); i++) {
    hlasy.push(i)
  }
                
  hlasy.sort((a,b) => {
    return parseInt(d.properties[b.toString()]) - parseInt(d.properties[a.toString()])
  })
                
  let ucast = Math.round((Number(d.properties.PL_HL_CELK) / Number(d.properties.VOL_SEZNAM))*10000)/100 + "%"
  let pocet_stran = d.properties.POCET_VS !== undefined ? d.properties.POCET_VS: null
  let prvnimisto = {"strana": strany[hlasy[0]] !== undefined ? `${strany[hlasy[0]]["JMENO"]} ${strany[hlasy[0]]["PRIJMENI"]}`: "data nejsou dostupná", "podil": strany[hlasy[0]] !== undefined ? `${Math.round((d.properties[hlasy[0].toString()]/d.properties.PL_HL_CELK)*10000)/100} %`: "data nejsou dostupná"}
  let druhemisto = {"strana": strany[hlasy[1]] !== undefined ? `${strany[hlasy[1]]["JMENO"]} ${strany[hlasy[1]]["PRIJMENI"]}`: "data nejsou dostupná", "podil": strany[hlasy[1]] !== undefined ? `${Math.round((d.properties[hlasy[1].toString()]/d.properties.PL_HL_CELK)*10000)/100} %`: "data nejsou dostupná"}
  let tretimisto = {"strana": strany[hlasy[2]] !== undefined ? `${strany[hlasy[2]]["JMENO"]} ${strany[hlasy[2]]["PRIJMENI"]}`: "data nejsou dostupná", "podil": strany[hlasy[2]] !== undefined ? `${Math.round((d.properties[hlasy[2].toString()]/d.properties.PL_HL_CELK)*10000)/100} %`: "data nejsou dostupná"}

  const udaje = {
    "nazev": infonazev(d),
    "pocet_stran": pocet_stran,
    "ucast": ucast,
    "prvnimisto": prvnimisto,
    "druhemisto": druhemisto,
    "tretimisto": tretimisto
  }

  tooltip.html(`<b>${udaje["nazev"]}</b><br>`
  +(udaje["pocet_stran"]==null?"Data nejsou dostupná":
    `Volební účast: ${udaje["ucast"]}<br>
    Vítěz: ${udaje["prvnimisto"]["strana"]} (${udaje["prvnimisto"]["podil"]})<br>
    Druhé místo: ${udaje["druhemisto"]["strana"]} (${udaje["druhemisto"]["podil"]})<br>
    `+(udaje["pocet_stran"]>2?`Třetí místo: ${udaje["tretimisto"]["strana"]} (${udaje["tretimisto"]["podil"]})`:"")
  ));
}