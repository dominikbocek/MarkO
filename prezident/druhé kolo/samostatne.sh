#!/bin/bash
#############################
# Nápověda                  #
#############################
Help() {
echo "Program na vytváření map s volebními výsledky - verze pro 2. kolo prezidentských voleb"
echo "Nápověda:"
echo
echo "možnosti"
echo "-h      zobrazí tuto nápovědu"
echo "-n      spustí program v normálním režimu"
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
# Hlavní program
#############################

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
      -n) # poběží v normálním režimu, tzn. zpracuje původní výsledky
         if ! test -f "volebni_okrsky-simple-data-topo.json"; then
         echo "Pro vytvoření samostatných map kandidujících subjektů je potřeba nejprve zpracovat data v normálním režimu pomocí příkazu bash ./volebni_mapy.sh -n"
         exit
         fi
         ;;
      *) # neplatná možnost
         echo "Neplatná možnost: $1"
         echo
         Help
         exit;;
   esac

if [ "$1" == "-n" ]; then
    mkdir "samostatné"
    python3 ./pouze_hlasy.py
    python3 ./popisky.py
    python3 ./statistiky_jednotlive.py
    for f in ./samostatné/*.csv; do
        csv2json -n $f > $f.ndjson
        ndjson-join --left 'd.id' volebni_okrsky-simple.ndjson $f.ndjson | ndjson-map 'Object.assign(d[0], Object.assign(d[0].properties, d[1]))' > $f-volebni_okrsky-simple-data.ndjson
        cat $f-volebni_okrsky-simple-data.ndjson | ndjson-reduce 'p.features.push(d), p' '{type: "FeatureCollection", features: []}' > $f-volebni_okrsky-simple-data.json
        geo2topo tracts=$f-volebni_okrsky-simple-data.json > $f-volebni_okrsky-simple-data-topo.json
    done
    cd "samostatné"
    rm -v !(*volebni_okrsky-simple-data-topo.json)
    python3 ../seznam.py > script.js
    cd ..
    python3 -m webbrowser "http://127.0.0.1/volby/$(urlencode "$(Url)")/$(urlencode "druhé kolo")/$(urlencode samostatné)"
fi