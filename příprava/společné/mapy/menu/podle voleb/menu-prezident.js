//menu
export async function menu() {
  var kandidati = []
  return fetch("../candidates-univerzal.json")
    .then(res => {
      if (!res.ok) throw new Error("Primární zdroj selhal.");
        return res.json();
      }
    )
    .catch(() => {
      console.warn("Používám fallback...");
      return fetch("../candidates.json")
        .then(res => {
          if (!res.ok) throw new Error("Fallback selhal.");
            return res.json();
        });
    })
    .then(data => {
      const result = Object.values(data).map(item => ({
        "CKAND": item.CKAND,
        "JMENO": item.JMENO,
        "PRIJMENI": item.PRIJMENI
      }));
      result.forEach(function (element) {if(cisla.find((cislo) => cislo == Number(element["CKAND"]))) {kandidati.push(element["CKAND"] + ";" + element["JMENO"] + " " + element["PRIJMENI"])}})
      var select = document.getElementById("seznam");
      kandidati.forEach(function(kandidat) {
        var option = document.createElement("option");
        option.innerText = kandidat.split(";")[1];
        option.value = kandidat.split(";")[0];
        select.appendChild(option);
      });

      return `${result.find(element => element["CKAND"] == parametry.hledanastrana)["JMENO"]} ${result.find(element => element["CKAND"] == parametry.hledanastrana)["PRIJMENI"]}`
    });
}