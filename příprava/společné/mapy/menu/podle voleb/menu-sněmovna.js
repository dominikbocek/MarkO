//menu
export async function menu() {
  var strany = []
  return fetch("../parties-univerzal.json")
    .then(res => {
      if (!res.ok) throw new Error("Primární zdroj selhal.");
      return res.json();
      }
    )
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
      result.forEach(function (element) {if(cisla.find((cislo) => cislo == Number(element["KSTRANA"]))) {strany.push(element["KSTRANA"] + ";" + element["ZKRATKAK30"])}})
      var select = document.getElementById("seznam");
      strany.forEach(function(strana) {
        var option = document.createElement("option");
        option.innerText = strana.split(";")[1];
        option.value = strana.split(";")[0]
        select.appendChild(option);
      });

      return `${result.find(element => element["KSTRANA"] == parametry.hledanastrana)["ZKRATKAK30"]}`
    });
}