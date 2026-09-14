const svg = document.getElementById("mapa")
const legenda = document.querySelector("#legenda")
let hlaska = function(text) {return `<text x='50%' y='50%' text-anchor='middle' transform='translate(-50,-50)' fill='red' font-size='16'>${text}</text>`}

export async function nactenimapy(url) {
  try {
    return await d3.json(url)
  } catch(err) {
    if(parametry.typzobrazeni == "samostatné" && parametry.urlParams.get('strana') == null) {
      svg.innerHTML = hlaska(`Vyberte ze seznamu níže požadovaný subjekt.`);
    } else {
      console.error('Chyba při načítání dat:', err);
      svg.innerHTML = hlaska(`Chyba při načítání dat. Adresa ${url} není dostupná. Soubor pravděpodobně neexistuje.`);
    }
  }
}

export async function nactenistran(url) {
  try {
    return await d3.json(url)
  } catch(err) {
    console.error("Chyba při načítání dat:", err)
    legenda.innerHTML = hlaska(`Chyba při načítání dat. Adresa ${url} není dostupná. Soubor pravděpodobně neexistuje.`);
  }
}

export async function nacteni_csv(url) {
  try {
    return await d3.csv(url)
  } catch(err) {
    if(parametry.typzobrazeni == "samostatné" && parametry.urlParams.get('strana') == null) {
      svg.innerHTML = hlaska(`Vyberte ze seznamu níže požadovaný subjekt.`);
    } else {
      console.error('Chyba při načítání dat:', err);
      svg.innerHTML = hlaska(`Chyba při načítání dat. Adresa ${url} není dostupná. Soubor pravděpodobně neexistuje.`);
    }
  }
}