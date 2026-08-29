#!/bin/bash

############
# Nápověda #
############

Help() {
   echo "MarkO: program na vytváření map s volebními výsledky - verze pro krajské volby"
   echo "Nápověda:"
   echo
   echo "možnosti"
   echo "-h      zobrazí tuto nápovědu"
   echo "-n      spustí program v normálním režimu"
   echo "-k      zpracuje výsledky na základě dříve vytvořených koalic, pokud byly vytvořeny, případně zpracuje subjekt/y samostatně (více informací v manuálu)"
}

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

############################################################
# Hlavní program                                           #
############################################################

source "../společné/kraje sněmovna prezident/samostatne/společný základ.sh"