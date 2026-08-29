//menu
export async function menu() {
  let kandidati = []
  let data
  try {
    data = await d3.csv(parametry.seznamstran)
  } catch (error) {
    try {
      data = await d3.csv(parametry.seznamstran2)
    } catch (error) {
      console.error("Seznam volebních subjektů neexistuje.") 
    }
  }
      
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
}