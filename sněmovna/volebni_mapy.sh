#!/bin/bash

DRUH_VOLEB="KRAJE"

############
# Nápověda #
############

Help() {
   echo "MarkO: program na vytváření map s volebními výsledky - verze pro sněmovní volby"
   echo
   echo "Nápověda:"
   echo "možnosti"
   echo "-h                       zobrazí tuto nápovědu"
   echo "-i                       zobrazí informace o programu"
   echo "-n                       spustí program v normálním režimu"
   echo "-s                       vypíše seznam kandidujících subjektů"
   echo "-k                       vytvoří koalice podle zadaných subjektů a propíše je do mapy okrskových vítězů"
   echo "-koalice-samostatne      vytvoří koalice podle zadaných subjektů, ale neprojeví se to na mapě okrskových vítězů, pouze na mapě míry podpory"
}

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
   local seznam_souboru=("pscoco.csv" "psrkl.csv" "pst4.csv" "pst4p.csv")
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