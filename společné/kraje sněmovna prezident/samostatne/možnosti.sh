#!/bin/bash

#############################
# Možnosti                  #
#############################

shopt -s extglob
if [ "$1" == "" ]; then
   Help
fi

case $1 in
   -h) # zobrazí nápovědu
      Help
      ;;
   -n) # poběží v normálním režimu, tzn. zpracuje původní výsledky
      Overeni "$2"
      if ! test -f "$adresar_voleb/volebni_okrsky-simple-data-topo.json"; then
         echo "Chybí soubor $adresar_voleb/volebni_okrsky-simple-data-topo.json"
         echo "Pro vytvoření samostatných map kandidujících subjektů je potřeba nejprve zpracovat data v normálním režimu pomocí příkazu bash ./volebni_mapy.sh -n"
         exit
      fi
      mkdir -p "$adresar_voleb/samostatné"
	   python3 "$adresar_instalace/vytvorit_statistiky_pouze_hlasy.py" --volby "$2" --zpracovani $(less "$adresar_voleb/použité statistiky.txt")
	   python3 "$adresar_instalace/popisky.py" --volby "$2" --zpracovani $(less "$adresar_voleb/použité statistiky.txt")
      ;;
   -k) # zpracuje vše, tzn. původní výsledky i koalice, pokud byly vytvořeny (statistics-univerzal.csv)
      Overeni "$2"
      if ! test -f "$adresar_voleb/statistics-univerzal.csv"; then
         echo "Chybí soubor $adresar_voleb/statistics-univerzal.csv"
         echo "Nejsou připravené podklady. Nejprve vytvořte koalice pomocí nástroje volebni_mapy.sh"
         exit
      fi
      mkdir -p "$adresar_voleb/samostatné"
      python3 "$adresar_instalace/vytvorit_statistiky_pouze_hlasy.py" --volby "$2" --koalice ano --zpracovani $(less "$adresar_voleb/použité statistiky.txt")
      python3 "$adresar_instalace/popisky.py" --volby "$2" --zpracovani $(less "$adresar_voleb/použité statistiky.txt")
      ;;
   *) # neplatná možnost
      echo "Neplatná možnost: $1"
      echo
      Help
      exit;;
esac