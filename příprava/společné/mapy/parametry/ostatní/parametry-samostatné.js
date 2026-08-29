//základní parametry
// proměnná parametry definována v souboru hlava.ejs
parametry.urlParams = new URLSearchParams(window.location.search);
parametry.rozsah = (parametry.urlParams.get('rozsah') === null) ? "standard" : parametry.urlParams.get('rozsah');
parametry.hledanastrana = parametry.urlParams.get('strana');