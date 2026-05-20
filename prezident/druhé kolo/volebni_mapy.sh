#!/bin/bash
# MarkO: program na vytváření volebních map - verze pro 2. kolo prezidentských voleb

#############################
# Ověření existence souborů #
#############################
Overeni() {
seznam_souboru=("pecoco.csv" "perk.csv" "pet1.csv" "barvy.csv" "vysledky.xml")
for i in "${seznam_souboru[@]}"; do
  if ! test -f $i; then
    echo "Soubor $i neexistuje. Program nemůže pokračovat."
    exit
  fi
done
}

#############################
# URL                       #
#############################

urlencode() {
   LC_ALL=C awk -- '
    BEGIN {
      for (i = 1; i <= 255; i++) hex[sprintf("%c", i)] = sprintf("%%%02X", i)
    }
    function urlencode(s,  c,i,r,l) {
      l = length(s)
      for (i = 1; i <= l; i++) {
        c = substr(s, i, 1)
        r = r "" (c ~ /^[-._~0-9a-zA-Z]$/ ? c : hex[c])
      }
      return r
    }
    BEGIN {
      for (i = 1; i < ARGC; i++)
        print urlencode(ARGV[i])
    }' "$@"
}

Url() {
# zdroj - https://stackoverflow.com/a/1371283

dirname="$(realpath "$(pwd)/../")"
shopt -s extglob           # enable +(...) glob syntax
result=${dirname%%+(/)}    # trim however many trailing slashes exist
result=${result##*/}       # remove everything before the last / that still remains
result=${result:-/}        # correct for dirname=/ case
echo "$result"
}

#############################
# Nápověda                  #
#############################
Help() {
echo "MarkO: program na vytváření map s volebními výsledky - verze pro 2. kolo prezidentských voleb"
echo
echo "Nápověda:"
echo "možnosti"
echo "-h                       zobrazí tuto nápovědu"
echo "-i                       zobrazí informace o programu"
echo "-n                       spustí program v normálním režimu"
}

#############################
# Hlavní program
#############################

############################################################
# Možnosti                                                 #
############################################################
# Get the options
if [ "$1" == "" ]
then
Help
exit
fi
   case $1 in
      -h) # zobrazí nápovědu
         Help
         exit;;
      -n) # poběží v normálním režimu
         Overeni
         ;;
      -i) # informace o programu
         echo "Informace o programu"
         echo
         echo "Tento program zpracovává data z výsledků voleb a vytváří přehledné volební mapy. Jeho hlavním cílem je demonstrovat, jak se proměnila politická situace Česka nikoliv v samotných výsledcích podle počtu hlasů, nýbrž podle míst, kde voliči žijí."
         echo
         echo "Program má dvě základní funkcionality:"
         echo "   a) vytváří mapu volebních vítězů na úrovni okrsků. Každý kandidát má vlastní barvu. Je to totéž, co ukazují v televizi nebo v článcích na internetu."
         echo "   b) zobrazuje míru podpory účastníků voleb napříč územím."
         echo
         echo "Více informací najdete v přiloženém manuálu."
         echo
         echo "Program vychází z otevřených dat Českého statistického úřadu. Úřad bohužel neposkytuje data ke všem volbám, které proběhly po sametové revoluci, ačkoliv výsledky voleb do České národní rady, Federálního shromáždění a referenda o vstupu do Evropské unie jsou na webu dostupné. Není v mých silách, aby tato data ručně předělával do formátu, v jakém jsou v ostatních případech."
         echo
         echo "Program sice není uživatelsky přátelský, ale byl koncipován tak, aby nevyžadoval žádné pokročilé znalosti a mohli s ním pracovat i uživatelé, kteří nejsou počítačově zdatní."
         echo
         echo "Pro ušetření mého času a mých nervů se na části výroby tohoto programu podílela umělá inteligence."
         echo
         echo "Nakládejte s programem, jak uznáte za vhodné. Pokud něco nefunguje, s velkou pravděpodobností se o tom píše v manuálu. Pokud ani tam nenaleznete řešení, budete si muset pomoci sami, jak by řekl každý správný pravičák."
         echo
         echo "Konec hlášení."
         exit;;
       *) # neplatná možnost
         echo "Neplatná možnost: $1"
         echo
         Help
         exit;;
   esac

if [ "$1" == "-n" ]; then
    shp2json -n --encoding=utf-8 okrsky.shp | ndjson-map 'd.id = d.properties.PLACE_ID, d' > volebni_okrsky.ndjson
    geo2topo -n tracts=volebni_okrsky.ndjson > volebni_okrsky-topo.json
    toposimplify -P 0.05 -f < volebni_okrsky-topo.json > volebni_okrsky-simple-topo.json
    topo2geo < volebni_okrsky-simple-topo.json tracts=volebni_okrsky-simple.json
    ndjson-split 'd.features' < volebni_okrsky-simple.json > volebni_okrsky-simple.ndjson
    python3 ./transform.py
    csv2json -n statistics.csv > statistics.ndjson
    ndjson-join --left 'd.id' volebni_okrsky-simple.ndjson statistics.ndjson | ndjson-map 'Object.assign(d[0], Object.assign(d[0].properties, d[1]))' > volebni_okrsky-simple-data.ndjson
    cat volebni_okrsky-simple-data.ndjson | ndjson-reduce 'p.features.push(d), p' '{type: "FeatureCollection", features: []}' > volebni_okrsky-simple-data.json
    geo2topo tracts=volebni_okrsky-simple-data.json > volebni_okrsky-simple-data-topo.json
    python3 ./odstranit_sloupce.py
    python3 ./csvtojson.py
    python3 ./xmltojson.py
    python3 ./pridat_barvy.py
    python3 ./kopirovat_barvy.py
    echo "var nazev = '$(Url)'" > script.js
    python3 -m webbrowser "http://127.0.0.1/volby/$(urlencode "$(Url)")/$(urlencode "druhé kolo")"
fi