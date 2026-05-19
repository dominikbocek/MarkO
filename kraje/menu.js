//menu
var strany = []
fetch("../parties-univerzal.json")
.then(res => {
  if (!res.ok) throw new Error("Primární zdroj selhal.");
  return res.json();
})
.catch(() => {
  console.warn("Používám fallback...");
  return fetch("../parties.json")
    .then(res => {
      if (!res.ok) throw new Error("Fallback selhal.");
      return res.json();
    });
})
  .then(data => {
    const result = Object.values(data).map(item => ({
      "KSTRANA": item.KSTRANA,
      "ZKRATKAK30": item.ZKRATKAK30
}));
    if(urlParams.get('strana') !== null) {
      window.nazev += ", " + result.find(element => element["KSTRANA"] == hledanastrana)["ZKRATKAK30"];
      g.append("text")
        .attr("class", "caption")
        .attr("x", x.range()[0])
        .attr("y", 50)
        .attr("fill", "#000")
        .attr("font-size", "18px")
        .attr("font-style", "italic")
        .attr("text-anchor", "start")
        .attr("font-family", "serif")
        .text("Mapa volebních výsledků pro " + nazev);
    }
      result.forEach(function (element) {if(cisla.find((cislo) => cislo == Number(element["KSTRANA"]))) {window.strany.push(element["KSTRANA"] + " - " + element["ZKRATKAK30"])}})
      var select = document.getElementById("vyber");
    window.strany.forEach(function(strana) {
      var option = document.createElement("option");
      option.innerText = strana;
      option.value = strana.split(" - ")[0];
      select.appendChild(option);
    });
});