async function nactenivysledku(url) {
  try {
    return await d3.json(url)
  } catch(err) {
    console.error("Chyba při načítání dat:", err)
    document.querySelector("svg").innerHTML = "<text x='50%' y='50%' text-anchor='middle' transform='translate(-50,-50)' fill='red' font-size='16'>Chyba při načítání dat. Soubor pravděpodobně neexistuje.</text>";
  }
}

  const data = await nactenivysledku("/vysledky_cr.json")
  const filtrovanadata = data.filter(function(el) {if(el["proc_hlasu"] > 1) {return el}})

  window.strop = d3.max(data, (d) => {return d.proc_hlasu})

  if((strop % 10) < 5) {strop = ((Math.round(strop / 10))*10 + 5)}
  else if((strop % 10) > 5) {strop = (Math.round(strop / 10))*10}

  var graf = Plot.plot({
  x: {label: "volební subjekty"},
  y: {percent: false, label: "procenta", grid: true},
  marks: [
    Plot.barY(
      filtrovanadata, {
        x: "kandidat",
        y: "proc_hlasu",
        fill: "color",
        text: "test",
        sort: {x: "-y"},
        title: function (d) {var cislo = `${Math.round(d.proc_hlasu*100)/100} %`; return cislo.replace(".", ",")},
        tip: true
      }
    ),
    Plot.ruleY([0], {stroke: "black"}),
    Plot.ruleY([strop], {stroke: ""})
  ]
})

export default function chart01() {document.getElementById("chartOne").append(graf)}