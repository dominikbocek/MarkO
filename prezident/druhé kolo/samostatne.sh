#!/bin/bash

############
# Nápověda #
############

Help() {
   echo "MarkO: program na vytváření map s volebními výsledky - verze pro 2. kolo prezidentských voleb"
   echo "Nápověda:"
   echo
   echo "možnosti"
   echo "-h      zobrazí tuto nápovědu"
   echo "-n      spustí program v normálním režimu"
}

# Ověření
Overeni() {
   local volby="$1"
   if [ "$volby" == "" ]; then
      echo "Nezadali jste žádné volby."
      exit
   fi
   adresar_voleb="$(realpath "../../public/volby/$volby")/druhé kolo"
   adresar_instalace="$(realpath .)"
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

shopt -s extglob
if [ "$1" == "" ]; then
   Help
   exit
fi
   
case $1 in
   -h) # zobrazí nápovědu
      Help
      exit;;
   -n) # poběží v normálním režimu, tzn. zpracuje původní výsledky
      Overeni "$2"
      if ! test -f "$adresar_voleb/statistics.csv"; then
         echo "Chybí soubor $adresar_voleb/statistics.csv"
         echo "Pro vytvoření samostatných map kandidujících subjektů je potřeba nejprve zpracovat data v normálním režimu pomocí příkazu bash ./volebni_mapy.sh -n"
         exit
      fi
      mkdir -p "$adresar_voleb/samostatné"
      python3 "$adresar_instalace/vytvorit_statistiky_pouze_hlasy.py" --volby "$2" --zpracovani "obce"
      python3 "$adresar_instalace/vytvorit_statistiky_pouze_hlasy.py" --volby "$2" --zpracovani "okrsky"
	   python3 "$adresar_instalace/popisky.py" --volby "$2" --zpracovani "obce"
      python3 "$adresar_instalace/popisky.py" --volby "$2" --zpracovani "okrsky"
      ;;
   *) # neplatná možnost
      echo "Neplatná možnost: $1"
      echo
      Help
      exit;;
esac

python3 "$adresar_instalace/vytvorit_statistiky_jednotlive.py" --volby "$2" --zpracovani "okrsky"
python3 "$adresar_instalace/vytvorit_statistiky_jednotlive.py" --volby "$2" --zpracovani "obce"