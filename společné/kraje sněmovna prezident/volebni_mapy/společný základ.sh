if [ "$1" == "-n" ]; then
    cd "$adresar_voleb"
    # zde řešíme zdroj map pro vykreslení
    zdroj="$3"
    if [ "$zdroj" == "" ]; then #zpracování výsledků po obcích
        zdroj="volební/2025"
    fi
    # parametr slouží jako cesta k datům o okrscích (viz struktura složky okrsky)
    if ! test -f "$adresar_okrsku/$zdroj/okrsky.shp"; then
        echo "Zadaná cesta k okrskovým mapám neexistuje."
        exit
    fi
    ogr2ogr -t_srs EPSG:4326 -lco ENCODING=UTF-8 "$adresar_voleb/okrsky.shp" "$adresar_okrsku/$zdroj/okrsky.shp" --quiet -ct_opt WARN_ABOUT_DIFFERENT_COORD_OP=NO
    shp2json -n --encoding=utf-8 "$adresar_voleb/okrsky.shp" | ndjson-map 'd.id = d.properties.kod_mco==null?d.properties.kod_obec + "-" + d.properties.cislo:d.properties.kod_mco + "-" + d.properties.cislo, d' > "$adresar_voleb/volebni_okrsky.ndjson"
    geo2topo -n tracts=volebni_okrsky.ndjson > volebni_okrsky-topo.json
    toposimplify -P 0.05 -f < volebni_okrsky-topo.json > volebni_okrsky-simple-topo.json 2> /dev/null
    topo2geo < volebni_okrsky-simple-topo.json tracts=volebni_okrsky-simple-data.json
    python3 "$adresar_instalace/vytvorit_seznam_subjektu.py" --volby "$2"
    python3 "$adresar_instalace/vytvorit_statistiky.py" --volby "$2"
    python3 "$adresar_instalace/vytvorit_statistiky_obce.py" --volby "$2"
    if ! test -f "statistics-univerzal.csv"; then # u druhého kola prezidentských voleb k ničemu
        cp "statistics.csv" statistics-univerzal.csv # nutno rozdělit na obce a okrsky
    fi
    if ! test -f "statistics-obce-univerzal.csv"; then # u druhého kola prezidentských voleb k ničemu
        cp "statistics-obce.csv" statistics-obce-univerzal.csv # nutno rozdělit na obce a okrsky
    fi
    python3 "$adresar_instalace/legenda.py" --volby "$2" --dosouboru "ano"
fi

if [ "$1" == "-k" ]; then # u druhého kola prezidentských voleb k ničemu
   cd "$adresar_voleb"
   python3 "$adresar_instalace/legenda.py" --volby "$2" --koalice "ano" --dosouboru "ano"
   if [ "$6" == "auto" ]; then
      otevrit_prohlizec "$2" "?koalice"
   fi
fi