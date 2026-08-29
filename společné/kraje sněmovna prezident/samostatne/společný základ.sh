cd "$adresar_voleb"
python3 "$adresar_instalace/vytvorit_statistiky_jednotlive.py" --volby "$2" --kstrana "$3" # zpracuje pouze zadanou stranu/y, pokud není zadána žádná, zpracuje všechny
if [ "$3" == "" ]; then # zpracování všech subjektů
   for f in ./samostatné/*.csv; do
      csv2json -n $f > $f.ndjson
      ndjson-join --left 'd.id' volebni_okrsky-simple.ndjson $f.ndjson | ndjson-map 'Object.assign(d[0], Object.assign(d[0].properties, d[1]))' > $f-volebni_okrsky-simple-data.ndjson
      cat $f-volebni_okrsky-simple-data.ndjson | ndjson-reduce 'p.features.push(d), p' '{type: "FeatureCollection", features: []}' > $f-volebni_okrsky-simple-data.json
      geo2topo tracts=$f-volebni_okrsky-simple-data.json > $f-volebni_okrsky-simple-data-topo.json
   done
   cd "samostatné"
else # zpracování vybraných subjektů
   IFS=', ' read -r -a subjekty <<< "$3"
   cd "samostatné"
   for element in "${subjekty[@]}"; do
      csv2json -n "$element.csv" > "$element.ndjson"
      ndjson-join --left 'd.id' ../volebni_okrsky-simple.ndjson "$element.ndjson" | ndjson-map 'Object.assign(d[0], Object.assign(d[0].properties, d[1]))' > "$element-volebni_okrsky-simple-data.ndjson"
      cat "$element-volebni_okrsky-simple-data.ndjson" | ndjson-reduce 'p.features.push(d), p' '{type: "FeatureCollection", features: []}' > "$element-volebni_okrsky-simple-data.json"
      geo2topo tracts="$element-volebni_okrsky-simple-data.json" > "$element.csv-volebni_okrsky-simple-data-topo.json"
   done
fi
rm -v !(*volebni_okrsky-simple-data-topo.json)