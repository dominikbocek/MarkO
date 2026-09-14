#!/bin/bash

#############################
# Možnosti                  #
#############################

if [ "$1" == "" ]; then
   Help
   exit
fi

case $1 in
   -h) # zobrazí nápovědu
      if [ "$2" == "" ]; then
         Help
      else
         Help_prikazy "$2"
      fi
      ;;
   -n) # poběží v normálním režimu
      Overeni "$2"
      mkdir -p "$adresar_voleb"
      ;;
   -s) # vypíše volební subjekty
      Overeni "$2"
      if ! test -f "$adresar_voleb/volebni_okrsky-simple-data.json"; then
         echo "Pro zobrazení kandidujících subjektů musí nejprve proběhnout zpracování dat ve standartním režimu (možnost -n)."
         exit
      fi
      python3 "$adresar_instalace/vypsat_volebni_subjekty.py" --volby "$2" --vypsat "$3" --json "$4"
      exit;;
   -k) # uvoří koalice
      Overeni "$2"
      if ! test -f "$adresar_voleb/volebni_okrsky-simple-data.json"; then
         echo "Pro vznik koalic musí nejprve proběhnout zpracování dat ve standartním režimu (možnost -n)."
         exit
      fi
      odpoved="$(python3 "$adresar_instalace/vytvorit_koalice.py" --volby "$2" --koalice "$3" --nazevkoalice "$4" --zkratka "$5")"
      if [ "$odpoved" != "ok" ]; then exit; fi
      if [ "$2" == "" ] || [ "$3" == "" ] || [ "$4" == "" ]; then echo "Nezadali jste potřebné parametry."; exit; fi
      ;;
   -koalice-samostatne) # vytvoří libovolné koalice, aniž by se to projevilo na mapách okrskových vítězů
      Overeni "$2"
      if ! test -f "$adresar_voleb/statistics-univerzal.csv"; then
         echo "Pro vznik koalic musí nejprve proběhnout zpracování dat ve standartním režimu (možnost -n)."
         exit
      fi
      odpoved="$(python3 "$adresar_instalace/vytvorit_koalice_samostatne.py" --volby "$2" --koalice "$3" --nazevkoalice "$4" --zkratka "$5")"
      if [ "$odpoved" == "" ]; then exit; fi
      if [ "$2" == "" ] || [ "$3" == "" ] || [ "$4" == "" ] || [ "$5" == "" ]; then echo "Nezadali jste potřebné parametry."; exit; fi
      python3 "$adresar_instalace/seznam_subjektu_json.py" --volby "$2" --koalice univerzal
      ( bash "$adresar_instalace/samostatne.sh" -k "$2" "$odpoved" )
      exit
      ;;
   -i) # informace o programu
      Info
      exit;;
    *) # neplatná možnost
      echo "Neplatná možnost: $1"
      echo
      Help
      exit;;
esac