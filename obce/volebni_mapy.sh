#!/bin/bash
# MarkO: program na vytváření volebních map - verze pro obecní volby - RC 4
# https://www.shellcheck.net/

#############################
# Ověření existence souborů #
#############################

# Poznámky
# zdroje: RÚIAN - otestováno a funkční, podklady pro volby - otestováno a funkční, vlastní podklady - netestováno
# rozšíření nápovědy???
# datum.csv není součástí sady, ale je nutný pro odstranění duplicit u případných pozdějších doplňovacích voleb apod.

Overeni_souboru() {
   local sada=$1
   local seznam_souboru=("kvcoco.csv" "kvrzcoco.csv" "kvhl.csv" "kvt3.csv" "kvros.csv" "datum.csv") # vynechán soubor barvy.csv, je ve složce s verzí programu
   for i in "${seznam_souboru[@]}"; do
      if ! test -f "../sada/$sada/$i"; then
         echo "Soubor $i neexistuje. Program nemůže pokračovat."
         exit
      fi
   done
   adresar_voleb="$(realpath "../public/volby/$sada")"
   adresar_instalace="$(realpath .)"
}

# Přidružené scripty
# URL

source ../společné/urlencode.sh

# Informace

source ../společné/info.sh

# Pomocné funkce

source ./pomocne.sh

# konvence názvů? (vysledky_cr_cisloobce --> vysledky_obce_cisloobce)

#############################
# Nápověda                  #
#############################

Help() {
   echo "MarkO: program na vytváření map s volebními výsledky - verze pro obecní volby"
   echo
   echo "Nápověda:"
   echo "možnosti"
   echo "-h                                     zobrazí tuto nápovědu"
   echo "-i                                     zobrazí informace o programu"
   echo "-n <volby> <id>                        spustí program v normálním režimu"
   echo "-s <volby> <id>                        vypíše seznam kandidujících subjektů"
   echo "-k <volby> <id> <...>                  vytvoří koalice podle zadaných subjektů a propíše je do mapy okrskových vítězů"
   echo "-koalice-samostatne <volby> <id> <...> vytvoří koalice podle zadaných subjektů, ale neprojeví se to na mapě okrskových vítězů, pouze na mapě míry podpory"
}

#############################
# Hlavní program
#############################

############################################################
# Možnosti                                                 #
############################################################

if [ "$1" == "" ]; then
   Help
   exit
fi

case $1 in
   -h) # zobrazí nápovědu
      Help
      exit;;
   -S) # zpracuje celé obce bez ohledu na to, zda jsou statutární nebo ne (nutno ověřit, že uživatel nezadává kód pro samosprávný obvod)
      Overeni_souboru "$2"
      mkdir -p "$adresar_voleb/obce"
      cd "$adresar_voleb"
      python3 "$adresar_instalace/třídění.py" --volby "$2"
      ;;
   -o) # vypíše obce
      Overeni_souboru "$2"
      python3 "$adresar_instalace/vypsat_obce.py" --volby "$2" --json "$3"
      exit;;
   -s) # vypíše strany
      Overeni_souboru "$2"
      Overeni_zpracovani "$2" "$3"
      python3 ./vypsat_strany.py --volby "$2" --obec "$3" --vypsat "$4" --json "$5"
      exit;;
   -n) # zpracuje obec/samosprávný obvod podle zadaného kódu (u statutárních obcí - pokud mají samosprávné obvody - zpracuje pouze statutární zastupitelstvo)
      Overeni_souboru "$2"
      mkdir -p "$adresar_voleb/obce"
      cd "$adresar_voleb"
      python3 "$adresar_instalace/třídění.py" --volby "$2"
      ;;
   -k) # uvoří koalice, doplnit ověření, zda zadané strany vůbec existují, totéž u ostatních verzí programu; zatím to nefunguje pro místní samosprávné obvody
      Overeni_souboru "$2"
      Overeni_zpracovani "$2" "$3"
      odpoved="$(python3 ./koalice.py --volby "$2" --obec "$3" --koalice "$4" --nazevkoalice "$5" --zkratka "$6")"
      if [ "$odpoved" != "ok" ]; then exit; fi
      if [ "$2" == "" ] || [ "$3" == "" ] || [ "$4" == "" ]|| [ "$6" == "" ]; then echo "Nezadali jste potřebné parametry."; exit; fi
      ;;
   -koalice-samostatne) # vytvoří libovolné koalice, aniž by se to projevilo na mapách okrskových vítězů
      Overeni_souboru "$2"
      Overeni_zpracovani "$2" "$3"
      odpoved="$(python3 "$adresar_instalace/koalice_samostatne.py" --volby "$2" --obec "$3" --koalice "$4" --nazevkoalice "$5" --zkratka "$6")"
      if [ "$odpoved" == "" ]; then exit; fi
      if [ "$2" == "" ] || [ "$3" == "" ] || [ "$4" == "" ] || [ "$5" == "" ] || [ "$6" == "" ]; then echo "Nezadali jste potřebné parametry."; exit; fi
      python3 "$adresar_instalace/csvtojson.py" --volby "$2" --obec "$3" --koalice univerzal
      ( bash "$adresar_instalace/samostatne.sh" -k "$2" "$odpoved" "$3" )
      exit
      ;;
   -v)
      Overeni_souboru "$2"
      python3 "$adresar_instalace/vypsat_obce.py" --volby "$2" --vyhledat "$3" --hledanahodnota "$4"
      exit;;
   -i) # informace o programu
      Info
      exit;;
   *) # neplatná možnost
      echo "Neplatná možnost: $1"
      echo
      Help
      exit;;
esac

zpracovani_dat() {
   local volby="$1"
   local kodstatut="$2"
   ndjson-join --left 'd.id' volebni_okrsky-simple.ndjson "$kodstatut.ndjson" | ndjson-map 'Object.assign(d[0], Object.assign(d[0].properties, d[1]))' > "volebni_okrsky-simple-data-$kodstatut.ndjson"
   cat "volebni_okrsky-simple-data-$kodstatut.ndjson" | ndjson-reduce 'p.features.push(d), p' '{type: "FeatureCollection", features: []}' > "volebni_okrsky-simple-data-$kodstatut.json"
   geo2topo tracts="volebni_okrsky-simple-data-$kodstatut.json" > "volebni_okrsky-simple-data-topo-$kodstatut.json"
   python3 "$adresar_instalace/odstranit_sloupce.py" --volby "$volby" --obec "$kodstatut"
   python3 "$adresar_instalace/csvtojson.py" --volby "$volby" --obec "$kodstatut"
   python3 "$adresar_instalace/legenda.py" --volby "$volby" --obec "$kodstatut"
   python3 "$adresar_instalace/pridat_barvy.py" --volby "$volby" --obec "$kodstatut"
   python3 "$adresar_instalace/kopirovat_barvy.py" --volby "$volby" --obec "$kodstatut"
}

zpracovani_dat_k() {
   local volby="$1"
   local kodstatut="$2"
   ndjson-join --left 'd.id' volebni_okrsky-simple.ndjson "$kodstatut-2.ndjson" | ndjson-map 'Object.assign(d[0], Object.assign(d[0].properties, d[1]))' > "volebni_okrsky-simple-data-$kodstatut.ndjson"
   cat "volebni_okrsky-simple-data-$kodstatut.ndjson" | ndjson-reduce 'p.features.push(d), p' '{type: "FeatureCollection", features: []}' > "volebni_okrsky-simple-data-$kodstatut.json"
   geo2topo tracts="volebni_okrsky-simple-data-$kodstatut.json" > "volebni_okrsky-simple-data-topo-$kodstatut-2.json"
   python3 "$adresar_instalace/csvtojson.py" --volby "$volby" --obec "$kodstatut" --koalice ano
   python3 "$adresar_instalace/csvtojson.py" --volby "$volby" --obec "$kodstatut" --koalice univerzal
   python3 "$adresar_instalace/pridat_barvy.py" --volby "$volby" --obec "$kodstatut" --koalice ano
   python3 "$adresar_instalace/kopirovat_barvy.py" --volby "$volby" --obec "$kodstatut" --koalice ano
}

obvody_n_k() {
   local volby="$1"
   local kodstatut="$2"
   if $(python3 "$adresar_instalace/jestatut.py" --volby "$volby" --obec "$kodstatut" --vratit "jestatut"); then
      seznam_obvodu=($(python3 "$adresar_instalace/seznam_obvodů.py" --volby "$volby" --obec "$kodstatut" | tr -d '[],')) # nutno rozlišit typ zastupitelstva (1 - zastupitelstvo obce, 2 - zastupitelstvo městské části/obvodu, viz. https://www.volby.cz/opendata/kv2022/KV2022ciselnikyPopis.pdf)
      echo "${seznam_obvodu[@]}"
      for i in "${seznam_obvodu[@]}"; do # zpracování jednotlivých samosprávných obvodů
         mkdir -p "$adresar_voleb/obce/$kodstatut/$i"
         python3 "$adresar_instalace/transform.py" --volby "$volby" --obec "$i"
         python3 "$adresar_instalace/přidat.py" --volby "$volby" --obec "$i"
      done
   else
      python3 "$adresar_instalace/transform.py" --volby "$volby" --obec "$kodstatut"
   fi
   if ! $(python3 "$adresar_instalace/jestatut.py" --volby "$volby" --obec "$kodstatut" --vratit "jesamospravny") && ! (( $(python3 "$adresar_instalace/jestatut.py" --volby "$volby" --obec "$kodstatut" --vratit "kodstatut") == 0 )); then
      if ! [ "$$" -eq "$BASHPID" ]; then
         echo "Tyto speciální obvody nelze zpracovávat zvlášť! Nutno vždy použít celé statutární město."
      fi
      exit
   fi
}

if [ "$1" == "-n" ] || [ "$1" == "-S" ]; then # data z RÚIANu + data pro sněmovní volby mají stejný formát, zbytek je ve formátu stejném jako volby 2022
   # zpracování statutárních měst se samosprávnými částmi může trvat docela dlouho, přidat možnost zpracovat místní části samostatně
   # $1 = -n
   # $2 = volby
   # $3 = zdroj
   # $4 = obec
   if ! [ -e "$adresar_voleb/kvrzcoco.ndjson" ]; then # volebni_okrsky.ndjson ověřit existenci
      csv2json -r ";" -n "$adresar_instalace/../sada/$2/kvrzcoco.csv" > "$adresar_voleb/kvrzcoco.ndjson" # seznam všech zastupitelstev; převedeno přes d3-dsv
   fi
   # zde řešíme zdroj map pro vykreslení
   if [ "$3" == "" ]; then # pro volby z roku 2022 a starší je použita sada z roku 2022, jelikož starší data již nejsou k dispozici, je rovněž nastavena jako výchozí, pokud není argument specifikován
      shp2json -n --encoding=utf-8 "$adresar_instalace/../okrsky/volební/2022/okrsky.shp" | ndjson-map 'd.id = d.properties.Momc==0?d.properties.Obec + "-" + d.properties.Cislo:d.properties.Momc + "-" + d.properties.Cislo, d' > "$adresar_voleb/volebni_okrsky.ndjson"
      kodstatut=$(python3 "$adresar_instalace/jestatut.py" --volby "$2" --obec "$4" --vratit "kodstatut")
      if $(python3 "$adresar_instalace/jestatut.py" --volby "$2" --obec "$4" --vratit "jesamospravny"); then # samosprávný obvod
         # if test -d "$adresar_voleb/obce/$kodstatut/$4"; then rm -r "$adresar_voleb/obce/$kodstatut/$4"; fi pokud se spustí znovu, původní složla se smaže
         mkdir -p "$adresar_voleb/obce/$kodstatut/$4"
         cd "$adresar_voleb/obce/$kodstatut/$4"
         python3 "$adresar_instalace/filtr.py" --volby "$2" --obec "$4"
      elif (( $kodstatut == 0 )); then
         echo "statut nebo obyč" # u obyčejných obcí není potřeba vytvářet adresář, existuje už z dřívějška
         # if test -d "$adresar_voleb/obce/$4"; then rm -r "$adresar_voleb/obce/$4"; fi pokud se spustí znovu, původní složla se smaže
         mkdir -p "$adresar_voleb/obce/$4/"
         cd "$adresar_voleb/obce/$4/"
         python3 "$adresar_instalace/filtr.py" --volby "$2" --obec "$4"
      fi
   elif [ "$3" == "RÚIAN" ]; then
      kodstatut=$(python3 "$adresar_instalace/jestatut.py" --volby "$2" --obec "$4" --vratit "kodstatut")
      if $(python3 "$adresar_instalace/jestatut.py" --volby "$2" --obec "$4" --vratit "jesamospravny"); then # samosprávný obvod         
         # if test -d "$adresar_voleb/obce/$kodstatut/$4"; then rm -r "$adresar_voleb/obce/$kodstatut/$4"; fi pokud se spustí znovu, původní složla se smaže
         if ! test -f "$adresar_voleb/$kodstatut.zip"; then
            curl -o "$adresar_voleb/$kodstatut.zip" "https://services.cuzk.cz/shp/obec/epsg-5514/$kodstatut.zip"
         fi
         python3 "$adresar_instalace/unzip.py" --obec "$kodstatut"
         obec="$adresar_voleb/obce/$kodstatut"
         obeckod="$kodstatut"
         mkdir -p "$obec/$4/"
         cd "$obec/$4"
      elif (( $kodstatut == 0 )); then
         # if test -d "$adresar_voleb/obce/$4"; then rm -r "$adresar_voleb/obce/$4"; fi pokud se spustí znovu, původní složla se smaže
         if ! test -f "$4.zip"; then
            curl -o "$adresar_voleb/$4.zip" "https://services.cuzk.cz/shp/obec/epsg-5514/$4.zip"
         fi
         python3 "$adresar_instalace/unzip.py" --obec "$4"
         obec="$adresar_voleb/obce/$4"
         obeckod="$4"
         cd "$obec"
      else
         # if test -d "$adresar_voleb/obce/$kodstatut/$4"; then rm -r "$adresar_voleb/obce/$kodstatut/$4"; fi pokud se spustí znovu, původní složla se smaže
         if ! test -f "$adresar_voleb/$kodstatut.zip"; then
            curl -o "$adresar_voleb/$kodstatut.zip" "https://services.cuzk.cz/shp/obec/epsg-5514/$kodstatut.zip"
         fi
         python3 "$adresar_instalace/unzip.py" --obec "$kodstatut"
         obec="$adresar_voleb/obce/$kodstatut"
         obeckod="$kodstatut"
         mkdir -p "$obec/"
      fi
      ogr2ogr -t_srs EPSG:4326 "$obec/okrsky.shp" "$obec/VO_P.shp"
      shp2json -n --encoding=utf-8 "$obec/okrsky.shp" > volebni_okrsky.ndjson
      python3 "$adresar_instalace/přečíslování.py" --volby "$2" --obec "$4"
      mv "volebni_okrsky_nove.ndjson" "volebni_okrsky.ndjson"
      if [ -e "$obec/MOMC_P.shp" ]; then # statutární město s městskými částmi/obvody
         cat "volebni_okrsky.ndjson" | ndjson-map 'd.id = d.properties.MOMC_KOD + "-" + d.properties.CISLO, d' > "volebni_okrsky_nove.ndjson"
      else # běžné zastupitelstvo
         cat "volebni_okrsky.ndjson" | ndjson-map 'd.id = d.properties.OBEC_KOD + "-" + d.properties.CISLO, d' > "volebni_okrsky_nove.ndjson"
      fi
      mv "volebni_okrsky_nove.ndjson" "volebni_okrsky.ndjson"
   else # parametr slouží jako cesta k datům o okrscích (viz struktura složky okrsky), nutno použít sadu pro dané volby, podklady pro celý stát z RÚIANU pro tento mechanismus nefungují
      mkdir -p "$adresar_voleb/obce/$4"
      shp2json -n --encoding=utf-8 "$adresar_instalace/../okrsky/$3/okrsky.shp" | ndjson-map 'd.id = d.properties.Momc==0?d.properties.Obec + "-" + d.properties.Cislo:d.properties.Momc + "-" + d.properties.Cislo, d' > "$adresar_voleb/volebni_okrsky.ndjson"
      python3 "$adresar_instalace/filtr.py" --volby "$2" --obec "$4"
   fi
   geo2topo -n tracts=volebni_okrsky.ndjson > volebni_okrsky-topo.json
   topo2geo < volebni_okrsky-topo.json tracts=volebni_okrsky-simple.json
   ndjson-split 'd.features' < volebni_okrsky-simple.json > volebni_okrsky-simple.ndjson # ???
fi

if [ "$1" == "-S" ]; then
   # zde řešíme přípravu statistických dat
   if $(python3 "$adresar_instalace/jestatut.py" --volby "$2" --obec "$4" --vratit "jestatut"); then # statutární město s městskými částmi/obvody
      if [ "$3" == "RÚIAN" ]; then
         ogr2ogr -t_srs EPSG:4326 "$obec/obvody.shp" "$obec/MOMC_P.shp"
         shp2json -n --encoding=utf-8 "$obec/obvody.shp" > obvody.ndjson
      else
         python3 "$adresar_instalace/filtr.py" --volby "$2" --obec "$4"
      fi
      seznam_obvodu=($(python3 "$adresar_instalace/seznam_obvodů.py" --volby "$2" --obec "$4" | tr -d '[],')) # nutno rozlišit typ zastupitelstva (1 - zastupitelstvo obce, 2 - zastupitelstbo městské části/obvodu, viz. https://www.volby.cz/opendata/kv2022/KV2022ciselnikyPopis.pdf)
      for i in "${seznam_obvodu[@]}"; do
         cd "$adresar_instalace" # kvůli ověřování souborů
         ( bash "$adresar_instalace/volebni_mapy.sh" -n "$2" "$3" "$i" )
         if ! test -f "$obec/.zpracováno"; then # pro případ, že by se po možnosti -n spustila možnost -S
            python3 "$adresar_instalace/přidat.py" --volby "$2" --obec "$i"
         fi
      done
      cd "$obec"
      # zpracování statutárního zastupitelstva
      # zde transform.py není potřeba, jelikož statistiky k volbám do statutárního zastupitelstva již máme
      csv2json -n "$4.csv" > "$4.ndjson"
      if ! test -f "$4-univerzal.csv"; then
         cp "$4.csv" "$4-univerzal.csv"
      fi
      zpracovani_dat "$2" "$4"
      echo "-S" > .zpracováno
   else # zpracování běžné obce
      cd "$adresar_instalace" # kvůli ověřování souborů
      ( bash "$adresar_instalace/volebni_mapy.sh" -n "$2" "$3" "$4" "$5" )
   fi
   if [ "$5" == "auto" ]; then
      otevrit_prohlizec "$2" "$4"
   fi
fi

if [ "$1" == "-n" ]; then
   obvody_n_k "$2" "$4"
   csv2json -n "$4.csv" > "$4.ndjson"
   if ! test -f "$4-univerzal.csv"; then
      cp "$4.csv" "$4-univerzal.csv"
   fi
   zpracovani_dat "$2" "$4"
   echo "-n" > .zpracováno
   if [ "$5" == "auto" ]; then
      otevrit_prohlizec "$2" "$4"
   fi
fi

if [ "$1" == "-k" ]; then
   # --volby "$2" --obec "$3" --koalice "$4" --nazevkoalice "$5" --zkratka "$6"
   obvody_n_k "$2" "$3"
   kodstatut=$(python3 "$adresar_instalace/jestatut.py" --volby "$2" --obec "$3" --vratit "kodstatut")
   if $(python3 "$adresar_instalace/jestatut.py" --volby "$2" --obec "$3" --vratit "jesamospravny"); then # samosprávný obvod
      cd "$adresar_voleb/obce/$kodstatut/$3" || exit
   elif (( $kodstatut == 0 )); then
      cd "$adresar_voleb/obce/$3/" || exit
   fi
   python3 "$adresar_instalace/odstranit_cleny_koalice.py" --volby "$2" --obec "$3" --koalice "$4"
   csv2json -n "$3-2.csv" > "$3-2.ndjson"
   zpracovani_dat_k "$2" "$3"
   echo "-k" > .zpracováno
   if [ "$7" == "auto" ]; then
      otevrit_prohlizec "$2" "$3" "?koalice"
   fi
fi