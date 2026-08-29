export async function vykresleni_zaklad(geodata, statistiky) {
    
    let data = topojson.topology({tracts: geodata})

    let subunits

    if(parametry.lokalita == "stát") { 
        const puvodnigeometrie = data.objects.tracts.geometries

        // seskupení podle id (pouze pro zobrazení celostátních výsledků)
        const obce = d3.group(puvodnigeometrie, d => String(d.properties.kod_obec))

        // Sloučení okrsků každé obce
        const slouceno = Array.from(obce, ([idObce, okrsky]) => {

        const geometrie = topojson.mergeArcs(data, okrsky)

        geometrie.id = idObce
        geometrie.properties = {naz_obec: puvodnigeometrie.filter(function(element) {return element.properties.kod_obec == geometrie.id})[0]["properties"]["naz_obec"]}
        //console.log(geometrie)

        return geometrie
        })

        // vytvoření nového TopoJSON objektu
        const mergedObject = {
        type: "GeometryCollection",
        geometries: slouceno
        }

        subunits = topojson.feature(data, mergedObject)
    } else if(parametry.lokalita == "obec") {
        subunits = topojson.feature(data, data.objects.tracts) // obce
    }

    if(parametry.lokalita == "obec" && parametry.druh !== "komunální") {
        subunits.features = subunits.features.filter(function(element) {return element["properties"]["kod_obec"].startsWith(parametry.id_obce)})
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