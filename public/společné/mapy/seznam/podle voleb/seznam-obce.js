//seznam
export async function seznam() {
  var strany = []
  let data
  try {
    data = await d3.csv(parametry.seznamstran)
  } catch (error) {
    try {
      data = await d3.csv(parametry.seznamstran2)
    } catch (error) {
      throw new Error("Seznam volebních subjektů neexistuje.");
    }
  }
      
  const result = Object.values(data).map(item => ({
    "OSTRANA": item.OSTRANA,
    "ZKRATKAO30": item.ZKRATKAO30,
    "POR_STR_HL": item.POR_STR_HL
  }));      

  result.forEach(function (element) {if(cisla.find((cislo) => cislo == Number(element["POR_STR_HL"]))) {strany.push(element["POR_STR_HL"] + ";" + element["ZKRATKAO30"])}})
  var select = document.getElementById("seznam");
  strany.forEach(function(strana) {
    var option = document.createElement("option");
    option.innerText = strana.split(";")[1];
    option.value = strana.split(";")[0]
    select.appendChild(option);
  });

  return `${result.find(element => element["POR_STR_HL"] == parametry.hledanastrana)["ZKRATKAO30"]}`
}