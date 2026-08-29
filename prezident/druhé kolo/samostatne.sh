#!/bin/bash

############
# Nápověda #
############

Help() {
   echo "MarkO: program na vytváření map s volebními výsledky - verze pro 2. kolo prezidentských voleb"
   echo "Nápověda:"
   echo
   echo "možnosti"
   echo "-h      zobrazí tuto nápovědu"
   echo "-n      spustí program v normálním režimu"
}

# Ověření
Overeni() {
   local volby="$1"
   if [ "$volby" == "" ]; then
      echo "Nezadali jste žádné volby."
      exit
   fi
   adresar_voleb="$(realpath "../../public/volby/$volby")/druhé kolo"
   adresar_instalace="$(realpath .)"
}

# Přidružené scripty
# URL

source ../../společné/urlencode.sh

# Informace

source ../../společné/info.sh

############################################################
# Hlavní program                                           #
############################################################

#############################
# Možnosti                  #
#############################

shopt -s extglob
if [ "$1" == "" ]; then
   Help
   exit
fi
   
case $1 in
   -h) # zobrazí nápovědu
      Help
      exit;;
   -n) # poběží v normálním režimu, tzn. zpracuje původní výsledky
      Overeni "$2"
      if ! test -f "$adresar_voleb/volebni_okrsky-simple-data-topo.json"; then
         echo "Chybí soubor $adresar_voleb/volebni_okrsky-simple-data-topo.json"
         echo "Pro vytvoření samostatných map kandidujících subjektů je potřeba nejprve zpracovat data v normálním režimu pomocí příkazu bash ./volebni_mapy.sh -n"
         exit
      fi
      mkdir -p "$adresar_voleb/samostatné"
      python3 "$adresar_instalace/pouze_hlasy.py" --volby "$2" --zpracovani $(less "$adresar_voleb/použité statistiky.txt")
      python3 "$adresar_instalace/popisky.py" --volby "$2" --zpracovani $(less "$adresar_voleb/použité statistiky.txt")
      ;;
   *) # neplatná možnost
      echo "Neplatná možnost: $1"
      echo
      Help
      exit;;
esac

if [ "$1" == "-n" ]; then
   cd "$adresar_voleb"
   python3 "$adresar_instalace/statistiky_jednotlive.py" --volby "$2"
   for f in ./samostatné/*.csv; do
      csv2json -n $f > $f.ndjson
      ndjson-join --left 'd.id' volebni_okrsky-simple.ndjson $f.ndjson | ndjson-map 'Object.assign(d[0], Object.assign(d[0].properties, d[1]))' > $f-volebni_okrsky-simple-data.ndjson
      cat $f-volebni_okrsky-simple-data.ndjson | ndjson-reduce 'p.features.push(d), p' '{type: "FeatureCollection", features: []}' > $f-volebni_okrsky-simple-data.json
      geo2topo tracts=$f-volebni_okrsky-simple-data.json > $f-volebni_okrsky-simple-data-topo.json
   done
   cd "samostatné"
   rm -v !(*volebni_okrsky-simple-data-topo.json)
fi