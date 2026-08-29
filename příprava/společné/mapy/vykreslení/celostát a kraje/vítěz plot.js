import { nactenimapy, nactenistran } from "/společné/mapy/vykreslení/načtení.js"

export async function vykresleni(zobrazitInfo) {

  const data = await nactenimapy(parametry.data)
  const strany = await nactenistran(parametry.strany)

  // zjistí barvu vítězné strany
  function barva(d) {
    let mx = 0
    let px = ""
    for (let i = 1; i <= d.properties.POCET_VS; i++) {
      const v = parseInt(d.properties[i.toString()])
      if (v > mx) {
        mx = v
        px = i
      }
    }

    if (px === "") {
      return "#aaa"
    }

    return strany[px]["color"]
  }


  function vykresliMapu() {
    const element = document.querySelector("#kontejner-mapy").querySelector("div").querySelector("div")

    //const width = element.clientWidth || 1450

    const plot = Plot.plot({
      margin: 0,
      projection: {
        type: "mercator",
        domain: data
      },
      marks: [
        Plot.geo(data, {
          fill: barva,
          className: "mapa",
          stroke: null,
          title: function (d) {const volebnidata = zobrazitInfo(d, strany); return `${volebnidata["nazev"]}\nPrvní místo: ${volebnidata["prvnimisto"]["strana"]}\nDruhé místo: ${volebnidata["druhemisto"]["strana"]}\nTřetí místo: ${volebnidata["tretimisto"]["strana"]}`},
          tip: true
        })
      ]
    })

    plot.id = "mapa"

    element.replaceChildren(plot)

    return plot
  }

  vykresliMapu()

  window.kulvplote = function() {vykresliMapu()}
  document.getElementById("mapa").removeAttribute("width")
  document.getElementById("mapa").removeAttribute("height")
}