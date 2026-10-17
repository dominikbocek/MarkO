export async function vykresleni_zaklad(geodata, statistiky) {

    let subunits

    if(parametry.lokalita == "stát") { 
        const puvodnigeometrie = geodata.objects.tracts.geometries

        // seskupení podle id (pouze pro zobrazení celostátních výsledků)
        //const obce = d3.group(puvodnigeometrie, d => String(d.properties.kod_obec))
        const obce = d3.group(puvodnigeometrie, function(d) {if(d.properties.kod_obec == undefined) {return String(d.properties.Obec)} else {return String(d.properties.kod_obec)}})

        // Sloučení okrsků každé obce
        const slouceno = Array.from(obce, ([idObce, okrsky]) => {

        const geometrie = topojson.mergeArcs(geodata, okrsky)
        window.geometrie = geometrie

        geometrie.id = idObce
        //geometrie.properties = {naz_obec: puvodnigeometrie.filter(function(element) {return element.properties.kod_obec == geometrie.id})[0]["properties"]["naz_obec"]}

        return geometrie
        })

        // vytvoření nového TopoJSON objektu
        const mergedObject = {
        type: "GeometryCollection",
        geometries: slouceno
        }

        subunits = topojson.feature(geodata, mergedObject) // pro zobrazení po obcích použít topojson.feature(geodata, mergedObject), pro okrsky topojson.feature(geodata, geodata.objects.tracts)
    } else if(parametry.lokalita == "obec" || parametry.lokalita == "obvod") {
        subunits = topojson.feature(geodata, geodata.objects.tracts) // obce
    }

    if(parametry.druh !== "komunální") {
        if(parametry.lokalita == "obec") {
            subunits.features = subunits.features.filter(function(element) {return element["properties"]["kod_obec"].startsWith(parametry.id_obce)})
        } else if(parametry.lokalita == "obvod") {
            subunits.features = subunits.features.filter(function(element) {if(element["properties"]["kod_mco"] !== null) {return element["properties"]["kod_mco"].startsWith(parametry.id_obce)}})
        }
    }

    subunits.features.forEach(element => {
        statistiky.filter(function(element2) {
        if (element2["id"] == element["id"]) {
            let naz_obec = element.properties.naz_obec
            element.properties = element2
            element.properties.naz_obec = naz_obec
        }
        })
    });

    return subunits
}