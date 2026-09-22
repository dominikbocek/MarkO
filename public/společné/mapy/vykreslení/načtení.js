const svg = document.getElementById("mapa")
let hlaska = function(text) {return `<text x='50%' y='50%' text-anchor='middle' transform='translate(-50,-50)' fill='red' font-size='16'>${text}</text>`}

function chyba(hlaseni, url) {
  console.error('Chyba při načítání dat:', hlaseni);
  svg.innerHTML = hlaska(`Chyba při načítání dat. Adresa ${url} není dostupná. Soubor pravděpodobně neexistuje.`);
}

export async function nactenimapy(url) {
  try {
    return await d3.json(url)
  } catch(err) {
    if(parametry.typzobrazeni == "samostatné" && parametry.urlParams.get('strana') == null) {
      svg.innerHTML = hlaska(`Vyberte ze seznamu níže požadovaný subjekt.`);
    } else {
      chyba(err, url)
    }
  }
}

export async function nactenistran(url) {
  try {
    return await d3.json(url)
  } catch(err) {
    chyba(err, url)
  }
}

export async function nacteni_csv(url) {
  if(parametry.typzobrazeni == "samostatné" && (parametry.hledanastrana == "" || isNaN(parametry.hledanastrana))) {
    svg.innerHTML = hlaska(`Neplatné id`)
    return 0
  }

  try {
    return await d3.csv(url)
  } catch(err) {
    if(parametry.typzobrazeni == "samostatné" && parametry.urlParams.get('strana') == null) {
      svg.innerHTML = hlaska(`Vyberte ze seznamu níže požadovaný subjekt.`);
    } else {
      chyba(err, url)
    }
  }
}