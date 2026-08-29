#!/bin/bash
#############################
# Nápověda                  #
#############################

Help() {
   echo "Program na vytváření map s volebními výsledky - verze pro obecní volby"
   echo "Nápověda:"
   echo
   echo "možnosti"
   echo "-h      zobrazí tuto nápovědu"
   echo "-n      spustí program v normálním režimu"
   echo "-k      zpracuje výsledky na základě dříve vytvořených koalic, pokud byly vytvořeny, případně zpracuje subjekt/y samostatně (více informací v manuálu)"
}

# Poznámky:
# - běžná zastupitelstva a statutární zastupitelstva + samosprávné obvody (varianta -S); v případě statutárních měst se zpracují i samosprávné obvody (tzn. zpracuje se celá obec)
# - běžná zastupitelstva + samosprávné obvody a statutární zastupitelstva (varianta -n); zpracuje se zastupitelstvo podle zadaného kódu

# Přidružené scripty
# URL

source ../společné/urlencode.sh

# Pomocné funkce

source ./pomocne.sh

#############################
# Hlavní program
#############################

obvody_n_k() {
   local volby="$1"
   local obec="$2"
   local koalice="$3"
   if [ -z "$koalice" ]; then koalice=ne; fi
   if ! (( $(python3 "$adresar_instalace/jestatut.py" --volby "$volby" --obec "$obec" --vratit "kodstatut") == 0 )); then # samosprávný obvod
      kod=$(python3 "$adresar_instalace/jestatut.py" --volby "$volby" --obec "$obec" --vratit "kodstatut")
      mkdir -p "$adresar_voleb/obce/$kod/$obec/samostatné"
      python3 "$adresar_instalace/pouze_hlasy.py" --volby "$volby" --obec "$obec" --koalice "$koalice"
      cd "$adresar_voleb/obce/$kod/$obec" || exit
   else
      echo "statut nebo obyč"
      mkdir -p "$adresar_voleb/obce/$obec/samostatné"
      python3 "$adresar_instalace/pouze_hlasy.py" --volby "$volby" --obec "$obec" --koalice "$koalice"
      cd "$adresar_voleb/obce/$obec" || exit
   fi
}

############################################################
# Možnosti                                                 #
############################################################

shopt -s extglob
if [ "$1" == "" ]
   then
   Help
   exit
fi

case $1 in
   -h) # zobrazí nápovědu
      Help
      exit;;
   -n) # poběží v normálním režimu, tzn. zpracuje původní výsledky; zpracuje obec/obvod podle zadaného kódu
      adresar_voleb="$(realpath "../public/volby/$2")"
      adresar_instalace="$(realpath .)"
      Overeni_zpracovani "$2" "$4"
      obvody_n_k "$2" "$4"
      ;;
   -S) # zpracuje celou obec, pokud má samosprávné obvody
      adresar_voleb="$(realpath "../public/volby/$2")"
      adresar_instalace="$(realpath .)"
      Overeni_zpracovani "$2" "$4"
      ;;
   -k) # zpracuje vše, tzn. původní výsledky i koalice, pokud byly vytvořeny (cisloobce-univerzal.csv)
      adresar_voleb="$(realpath "../public/volby/$2")"
      adresar_instalace="$(realpath .)"
      Overeni_zpracovani "$2" "$4"
      obvody_n_k "$2" "$4" ano
      ;;
   *) # neplatná možnost
      echo "Neplatná možnost: $1"
      echo
      Help
      exit;;
esac

if [ "$1" == "-S" ]; then
   if $(python3 "$adresar_instalace/jestatut.py" --volby "$2" --obec "$4" --vratit "jestatut"); then # statutární město s městskými částmi/obvody
      seznam_obvodu=($(python3 "$adresar_instalace/seznam_obvodů.py" --volby "$2" --obec "$4" | tr -d '[],'))
      for i in "${seznam_obvodu[@]}"; do # zpracování jednotlivých samosprávných obvodů
         mkdir -p "$adresar_voleb/obce/$4/$i/samostatné"
         ( bash "$adresar_instalace/samostatne.sh" -n "$2" "$3" "$i" )
      done
      cd "$adresar_instalace" # kvůli ověřování souborů
      ( bash "$adresar_instalace/samostatne.sh" -n "$2" "$3" "$4" )
      if [ "$5" == "auto" ]; then
         otevrit_prohlizec "$2" "$4" "samostatné"
      fi
   else
      cd "$adresar_instalace" # kvůli ověřování souborů
      ( bash "$adresar_instalace/samostatne.sh" -n "$2" "$3" "$4" "$5" )
   fi
fi

if [ "$1" == "-n" ] || [ "$1" == "-k" ]; then
   python3 "$adresar_instalace/statistiky_jednotlive.py" --volby "$2" --kstrana "$3" --obec "$4" # zpracuje pouze zadanou stranu/y, pokud není zadána žádná, zpracuje všechny
   if [ "$3" == "" ]; then
      for f in ./samostatné/*.csv; do
         csv2json -n "$f" > "$f.ndjson"
         ndjson-join --left 'd.id' volebni_okrsky-simple.ndjson "$f.ndjson" | ndjson-map 'Object.assign(d[0], Object.assign(d[0].properties, d[1]))' > "$f-volebni_okrsky-simple-data.ndjson"
         cat "$f-volebni_okrsky-simple-data.ndjson" | ndjson-reduce 'p.features.push(d), p' '{type: "FeatureCollection", features: []}' > "$f-volebni_okrsky-simple-data.json"
         geo2topo tracts="$f-volebni_okrsky-simple-data.json" > "$f-volebni_okrsky-simple-data-topo.json"
      done
   else
      IFS=', ' read -r -a subjekty <<< "$3"
      cd "samostatné"
      for element in "${subjekty[@]}"; do
         csv2json -n "$element.csv" > "$element.ndjson"
         ndjson-join --left 'd.id' "../volebni_okrsky-simple.ndjson" "$element.ndjson" | ndjson-map 'Object.assign(d[0], Object.assign(d[0].properties, d[1]))' > "$element-volebni_okrsky-simple-data.ndjson"
         cat "$element-volebni_okrsky-simple-data.ndjson" | ndjson-reduce 'p.features.push(d), p' '{type: "FeatureCollection", features: []}' > "$element-volebni_okrsky-simple-data.json"
         geo2topo tracts="$element-volebni_okrsky-simple-data.json" > "$element.csv-volebni_okrsky-simple-data-topo.json"
      done
   fi
   rm -v !(*volebni_okrsky-simple-data-topo.json)
   #if [ "$7" == "auto" ]; then
   #   otevrit_prohlizec "$2" "$4" "samostatné"
   #fi
fi