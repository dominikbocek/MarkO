//základní parametry
// proměnná parametry definována v souboru hlava.ejs
if(parametry.typzobrazeni == "normální") {
    parametry.urlParams = new URLSearchParams(window.location.search);
    parametry.koalice = parametry.urlParams.get('koalice');
    if (parametry.koalice !== null) {parametry.koalice = true} else {parametry.koalice = false}
    parametry.data = parametry.koalice ? `volebni_okrsky-simple-data-topo-${parametry.id_obce}-2.json` : `volebni_okrsky-simple-data-topo-${parametry.id_obce}.json`
    parametry.strany = parametry.koalice ? `parties-${parametry.id_obce}-2.json` : `parties-${parametry.id_obce}.json`
    parametry.legendazdroj = parametry.koalice ? `vysledky_cr_${parametry.id_obce}_2.json` : `vysledky_cr_${parametry.id_obce}.json`
} else if(parametry.typzobrazeni == "účast") {
    parametry.data = `volebni_okrsky-simple-data-topo-${parametry.id_obce}.json`
    parametry.urlParams = new URLSearchParams(window.location.search);
    parametry.rozsah = (parametry.urlParams.get('rozsah') === null) ? "standard" : parametry.urlParams.get('rozsah');
}