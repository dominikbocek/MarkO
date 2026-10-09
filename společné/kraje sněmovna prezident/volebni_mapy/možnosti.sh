#!/bin/bash

#############################
# Možnosti                  #
#############################

case $1 in
   -h) # zobrazí nápovědu
      Help_prikazy_volebni_mapy "$2"
      ;;
   -n) # poběží v normálním režimu
      if [ $# -lt 2 ]; then
         Help_prikazy_volebni_mapy "$1"
      fi
      Overeni "$2"
      mkdir -p "$adresar_voleb"
      ;;
   -s) # vypíše volební subjekty
      if [ $# -lt 4 ]; then
         Help_prikazy_volebni_mapy "$1"
      fi
      Overeni "$2"
      if ! test -f "$adresar_voleb/volebni_okrsky-simple-data.json"; then
         echo "Pro zobrazení kandidujících subjektů musí nejprve proběhnout zpracování dat ve standartním režimu (možnost -n)."
         exit
      fi
      python3 "$adresar_instalace/vypsat_volebni_subjekty.py" --volby "$2" --vypsat "$3" --json "$4"
      exit;;
   -k) # uvoří koalice
      if [ $# -lt 5 ]; then
         Help_prikazy_volebni_mapy "$1"
      fi
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
      if [ $# -lt 5 ]; then
         Help_prikazy_volebni_mapy "$1"
      fi
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
      if ! [ "$1" == "" ]; then
         echo "Neplatná možnost: $1"
         echo
      fi
      Help_prikazy_volebni_mapy
      exit;;
esac