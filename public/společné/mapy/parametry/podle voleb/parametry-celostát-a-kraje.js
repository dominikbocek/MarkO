//základní parametry
// proměnná parametry definována v souboru hlava.ejs
if (parametry.id_obce !== "") {predpona = "../../"} else {predpona = ""}

if(parametry.typzobrazeni == "normální") {
    parametry.urlParams = new URLSearchParams(window.location.search);
    parametry.koalice = parametry.urlParams.get('koalice');
    if (parametry.koalice !== null) {
        parametry.koalice = true
    } else {
        parametry.koalice = false
    }
    parametry.data = predpona + "volebni_okrsky-simple-data.json"
    if(parametry.lokalita == "obec") {
        parametry.statistiky = parametry.koalice ? predpona + "statistics2.csv" : predpona + "statistics.csv"
    } else if(parametry.lokalita = "stát") {
        parametry.statistiky = parametry.koalice ? predpona + "statistics-obce2.csv" : predpona + "statistics-obce.csv"
    }
    parametry.legendazdroj = parametry.koalice ? "vysledky_cr2.json" : "vysledky_cr.json"
} else if(parametry.typzobrazeni == "účast") {
    parametry.data = predpona + "volebni_okrsky-simple-data.json"
    if(parametry.lokalita == "obec") {
        parametry.statistiky = predpona + "statistics.csv"
    } else if(parametry.lokalita = "stát") {
        parametry.statistiky = "statistics-obce.csv"
    }
    parametry.urlParams = new URLSearchParams(window.location.search);
    parametry.rozsah = (parametry.urlParams.get('rozsah') === null) ? "standard" : parametry.urlParams.get('rozsah');
}