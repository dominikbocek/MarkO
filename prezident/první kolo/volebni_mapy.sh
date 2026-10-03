#!/bin/bash

DRUH_VOLEB="PREZIDENT"

# MarkO: program na vytváření volebních map - verze pro 1. kolo prezidentských voleb

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
  adresar_voleb="$(realpath "../../public/volby")/$sada/první kolo"
  adresar_instalace="$(realpath .)"
  adresar_okrsku="$adresar_instalace/../../okrsky"
}

# Přidružené scripty
# URL

source ../../společné/urlencode.sh

# Informace

source ../../společné/info.sh

# Nápověda

source ./nápověda.sh

#############################
# Hlavní program
#############################

source "../../společné/kraje sněmovna prezident/volebni_mapy/možnosti.sh"

source "../../společné/kraje sněmovna prezident/volebni_mapy/společný základ.sh"