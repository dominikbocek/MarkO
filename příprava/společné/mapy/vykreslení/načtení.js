export async function nactenimapy(url) {
  try {
    return await d3.json(url)
  } catch(err) {
    if (parametry.typzobrazeni !== "normální" && parametry.urlParams.get('strana') !== null) {
      console.error('Chyba při načítání dat:', err);
      document.querySelector("svg").innerHTML = "<text x='50%' y='50%' text-anchor='middle' transform='translate(-50,-50)' fill='red' font-size='16'>Chyba při načítání dat. Soubor pravděpodobně neexistuje.</text>";
    } else if(parametry.typzobrazeni !== "normální" && parametry.urlParams.get('strana') == null) {
      document.querySelector("svg").innerHTML = "<text x='50%' y='50%' text-anchor='middle' transform='translate(-50,-50)' fill='black' font-size='16'>Vyberte ze seznamu níže požadovaný subjekt.</text>";
    } else {
      console.error('Chyba při načítání dat:', err);
      document.querySelector("#mapa").innerHTML = `<text x='50%' y='50%' text-anchor='middle' transform='translate(-50,-50)' fill='red' font-size='16'>Chyba při načítání dat. Adresa ${url} není dostupná. Soubor pravděpodobně neexistuje.</text>`
    }
  }
}

export async function nactenistran(url) {
  try {
    return await d3.json(url)
  } catch(err) {
    console.error("Chyba při načítání dat:", err)
    document.querySelector("#legenda").innerHTML = `<text x='50%' y='50%' text-anchor='middle' transform='translate(-50,-50)' fill='red' font-size='16'>Chyba při načítání dat. Adresa ${url} není dostupná. Soubor pravděpodobně neexistuje.</text>`;
  }
}