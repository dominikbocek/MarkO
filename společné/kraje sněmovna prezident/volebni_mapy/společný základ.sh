if [ "$1" == "-n" ]; then
    cd "$adresar_voleb"
    # zde řešíme zdroj map pro vykreslení
    if [ "$3" == "" ] || [ "$3" == "obce" ]; then #zpracování výsledků po obcích
        ogr2ogr -t_srs EPSG:4326 -lco ENCODING=UTF-8 "$adresar_voleb/obce.shp" "$adresar_okrsku/ostatní/2026/OBCE_P.shp"
        shp2json -n --encoding "utf-8" "$adresar_voleb/obce.shp" | ndjson-map 'd.id = d.properties.KOD, d' > "$adresar_voleb/volebni_okrsky.ndjson"
        statistiky="statistics-obce.csv"
        echo "obce" > "použité statistiky.txt"
    else # parametr slouží jako cesta k datům o okrscích (viz struktura složky okrsky)
        if ! test -f "$adresar_okrsku/$3/okrsky.shp"; then
            echo "Zadaná cesta k okrskovým mapám neexistuje."
            exit
        fi
        ogr2ogr -t_srs EPSG:4326 -lco ENCODING=UTF-8 "$adresar_voleb/okrsky.shp" "$adresar_okrsku/$3/okrsky.shp"
        shp2json -n --encoding=utf-8 "$adresar_voleb/okrsky.shp" | ndjson-map 'd.id = d.properties.kod_mco==null?d.properties.kod_obec + "-" + d.properties.cislo:d.properties.kod_mco + "-" + d.properties.cislo, d' > "$adresar_voleb/volebni_okrsky.ndjson"
        statistiky="statistics.csv"
        echo "okrsky" > "použité statistiky.txt"
    fi
    geo2topo -n tracts=volebni_okrsky.ndjson > volebni_okrsky-topo.json
    toposimplify -P 0.05 -f < volebni_okrsky-topo.json > volebni_okrsky-simple-topo.json
    topo2geo < volebni_okrsky-simple-topo.json tracts=volebni_okrsky-simple.json
    ndjson-split 'd.features' < volebni_okrsky-simple.json > volebni_okrsky-simple.ndjson
    python3 "$adresar_instalace/vytvorit_statistiky.py" --volby "$2"
    python3 "$adresar_instalace/vytvorit_statistiky_obce.py" --volby "$2"
    csv2json -n "$statistiky" > statistics.ndjson
    if ! test -f "$statistiky-univerzal.csv"; then # u druhého kola prezidentských voleb k ničemu
        cp "$statistiky" statistics-univerzal.csv # nutno rozdělit na obce a okrsky
    fi
    ndjson-join --left 'd.id' volebni_okrsky-simple.ndjson statistics.ndjson | ndjson-map 'Object.assign(d[0], Object.assign(d[0].properties, d[1]))' > volebni_okrsky-simple-data.ndjson
    cat volebni_okrsky-simple-data.ndjson | ndjson-reduce 'p.features.push(d), p' '{type: "FeatureCollection", features: []}' > volebni_okrsky-simple-data.json
    geo2topo tracts=volebni_okrsky-simple-data.json > volebni_okrsky-simple-data-topo.json
    python3 "$adresar_instalace/odstranit_sloupce.py" --volby "$2"
    python3 "$adresar_instalace/seznam_subjektu_json.py" --volby "$2"
    python3 "$adresar_instalace/legenda.py" --volby "$2"
    python3 "$adresar_instalace/pridat_barvy.py" --volby "$2"
    python3 "$adresar_instalace/kopirovat_barvy.py" --volby "$2"
    #python3 -m webbrowser "http://127.0.0.1/volby/$(urlencode "$(Url)")/$(urlencode "první kolo")"  
fi

if [ "$1" == "-k" ]; then # u druhého kola prezidentských voleb k ničemu
   cd "$adresar_voleb"
   python3 "$adresar_instalace/odstranit_cleny_koalice.py" --volby "$2" --koalice "$3"
   csv2json -n statistics2.csv > statistics2.ndjson
   ndjson-join --left 'd.id' volebni_okrsky-simple.ndjson statistics2.ndjson | ndjson-map 'Object.assign(d[0], Object.assign(d[0].properties, d[1]))' > volebni_okrsky-simple-data.ndjson
   cat volebni_okrsky-simple-data.ndjson | ndjson-reduce 'p.features.push(d), p' '{type: "FeatureCollection", features: []}' > volebni_okrsky-simple-data.json
   geo2topo tracts=volebni_okrsky-simple-data.json > volebni_okrsky-simple-data-topo2.json
   python3 "$adresar_instalace/seznam_subjektu_json.py" --volby "$2" --koalice ano
   python3 "$adresar_instalace/seznam_subjektu_json.py" --volby "$2" --koalice univerzal
   python3 "$adresar_instalace/pridat_barvy.py" --volby "$2" --koalice ano
   python3 "$adresar_instalace/kopirovat_barvy.py" --volby "$2" --koalice ano
   if [ "$6" == "auto" ]; then
      otevrit_prohlizec "$2" "?koalice"
   fi
fi