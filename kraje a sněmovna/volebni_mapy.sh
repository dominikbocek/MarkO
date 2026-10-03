#!/bin/bash

DRUH_VOLEB="KRAJE"

# Nápověda

source "./nápověda.sh"

#############################
# Ověření existence souborů #
#############################

Overeni() {
   local sada="$1"
   if [ "$sada" == "" ]; then
      echo "Nezadali jste žádné volby."
      exit
   fi
   eval local seznam_souboru=$(python3 ./soubory.py --volby "sněmovní volby 2025")
   for i in "${seznam_souboru[@]}"; do
      if ! test -f "../sada/$sada/$i"; then
         echo "Soubor $i neexistuje. Program nemůže pokračovat."
         exit
      fi
   done
   adresar_voleb="$(realpath "../public/volby")/$sada"
   adresar_instalace="$(realpath .)"
   adresar_okrsku="$adresar_instalace/../okrsky"
}

# Přidružené scripty
# URL

source ../společné/urlencode.sh

# Informace

source ../společné/info.sh

# Pomocné funkce

source ./pomocne.sh

############################################################
# Hlavní program                                           #
############################################################

source "../společné/kraje sněmovna prezident/volebni_mapy/možnosti.sh"

source "../společné/kraje sněmovna prezident/volebni_mapy/společný základ.sh"