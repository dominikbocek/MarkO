#!/bin/bash

# Ověření
Overeni() {
   local volby="$1"
   if [ "$volby" == "" ]; then
      echo "Nezadali jste žádné volby."
      exit
   fi
   adresar_voleb="$(realpath "../public/volby/$volby")"
   adresar_instalace="$(realpath .)"
}

# Přidružené scripty
# URL

source ../společné/urlencode.sh

# Informace

source ../společné/info.sh

# Pomocné funkce

source ./pomocne.sh

# Nápověda

source ./nápověda.sh

############################################################
# Hlavní program                                           #
############################################################

source "../společné/kraje sněmovna prezident/samostatne/společný základ.sh"