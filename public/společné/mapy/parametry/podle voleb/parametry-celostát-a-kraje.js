//základní parametry
// proměnná parametry definována v souboru hlava.ejs
switch (parametry.lokalita) {
    case "stát":
        predpona = ""
        break;
    case "obec":
        predpona = "../../"
        break;
    case "obvod":
        predpona = "../../../"
        break;
}

if(parametry.typzobrazeni == "normální") {
    parametry.urlParams = new URLSearchParams(window.location.search);
    parametry.koalice = parametry.urlParams.get('koalice');
    if (parametry.koalice !== null) {
        parametry.koalice = true
    } else {
        parametry.koalice = false
    }
    parametry.data = predpona + "volebni_okrsky-simple-data.json"
    switch (parametry.lokalita) {
        case "stát":
            parametry.statistiky = parametry.koalice ? predpona + "statistics-obce2.csv" : predpona + "statistics-obce.csv"
            break;
        case "obec":
        case "obvod":
            parametry.statistiky = parametry.koalice ? predpona + "statistics2.csv" : predpona + "statistics.csv"
            break;
    }
    parametry.legendazdroj = parametry.koalice ? "vysledky_cr2.json" : "vysledky_cr.json"
} else if(parametry.typzobrazeni == "účast") {
    parametry.data = predpona + "volebni_okrsky-simple-data.json"
    switch (parametry.lokalita) {
        case "stát":
            parametry.statistiky = "statistics-obce.csv"
            break;
        case "obec":
        case "obvod":
            parametry.statistiky = predpona + "statistics.csv"
            break;
    }
    parametry.urlParams = new URLSearchParams(window.location.search);
    parametry.rozsah = (parametry.urlParams.get('rozsah') === null) ? "standard" : parametry.urlParams.get('rozsah');
}