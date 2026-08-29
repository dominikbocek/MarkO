#!/bin/bash

DRUH_VOLEB="PREZIDENT"

############
# Nápověda #
############

Help() {
  echo "MarkO: program na vytváření map s volebními výsledky - verze pro 2. kolo prezidentských voleb"
  echo
  echo "Nápověda:"
  echo "možnosti"
  echo "-h                       zobrazí tuto nápovědu"
  echo "-i                       zobrazí informace o programu"
  echo "-n                       spustí program v normálním režimu"
  exit
}

source ../nápověda.sh

#############################
# Ověření existence souborů #
#############################

Overeni() {
  local sada="$1"
  if [ "$sada" == "" ]; then
    echo "Nezadali jste žádné volby."
    exit
  fi
  local seznam_souboru=("pecoco.csv" "perk.csv" "pet1.csv" "vysledky.xml")
  for i in "${seznam_souboru[@]}"; do
    if ! test -f "../../sada/$sada/$i"; then
      echo "Soubor $i neexistuje. Program nemůže pokračovat."
      exit
    fi
  done
  adresar_voleb="$(realpath "../../public/volby")/$sada/druhé kolo"
  adresar_instalace="$(realpath .)"
  adresar_okrsku="$adresar_instalace/../../okrsky"
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

if [ "$1" == "" ]; then
  Help
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
  -i) # informace o programu
    Info
    exit;;
  *) # neplatná možnost
    echo "Neplatná možnost: $1"
    echo
    Help
    exit;;
esac

source "../../společné/kraje sněmovna prezident/volebni_mapy/společný základ.sh"