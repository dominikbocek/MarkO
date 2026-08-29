//základní parametry
// proměnná parametry definována v souboru hlava.ejs
if(parametry.typzobrazeni == "normální") {
    parametry.urlParams = new URLSearchParams(window.location.search);
    parametry.koalice = parametry.urlParams.get('koalice');
    if (parametry.koalice !== null) {parametry.koalice = true} else {parametry.koalice = false}
    parametry.data = parametry.koalice ? "volebni_okrsky-simple-data-topo2.json" : "volebni_okrsky-simple-data-topo.json"
    parametry.strany = parametry.koalice ? "candidates2.json" : "candidates.json"
    parametry.legendazdroj = parametry.koalice ? "vysledky_cr2.json" : "vysledky_cr.json"
} else if(parametry.typzobrazeni == "účast") {
    parametry.data = "volebni_okrsky-simple-data-topo.json"
    parametry.urlParams = new URLSearchParams(window.location.search);
    parametry.rozsah = (parametry.urlParams.get('rozsah') === null) ? "standard" : parametry.urlParams.get('rozsah');
}