//základní parametry
// proměnná parametry definována v souboru hlava.ejs
parametry.urlParams = new URLSearchParams(window.location.search);
parametry.rozsah = (parametry.urlParams.get('rozsah') === null) ? "standard" : parametry.urlParams.get('rozsah');
parametry.hledanastrana = parametry.urlParams.get('strana');
if(parametry.druh !== "komunální") {
    if (parametry.id_obce !== "") {predpona = "../../../"} else {predpona = "../"}
    parametry.data = predpona + "volebni_okrsky-simple-data.json"
    switch (parametry.druh) {
        case "prezidentské":
            parametry.seznamstran = `${predpona}samostatné/../candidates-univerzal.csv`
            parametry.seznamstran2 = `${predpona}samostatné/../candidates.csv`
            break;
    
        default:
            parametry.seznamstran = `${predpona}samostatné/../parties-univerzal.csv`
            parametry.seznamstran2 = `${predpona}samostatné/../parties.csv`
            break;
    }
    if(parametry.lokalita == "stát") {
        parametry.csv = `${predpona}samostatné/${parametry.hledanastrana}-obce.csv`
    } else if(parametry.lokalita == "obec") {
        parametry.csv = `${predpona}samostatné/${parametry.hledanastrana}.csv`
    }
}