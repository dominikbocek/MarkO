#!/bin/bash

#############################
# Možnosti                  #
#############################

shopt -s extglob

case $1 in
   -h) # zobrazí nápovědu
      Help_prikazy_samostatne "$2"
      ;;
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
   -k) # zpracuje vše, tzn. původní výsledky i koalice, pokud byly vytvořeny (statistics-univerzal.csv)
      Overeni "$2"
      if ! test -f "$adresar_voleb/statistics-univerzal.csv"; then
         echo "Chybí soubor $adresar_voleb/statistics-univerzal.csv"
         echo "Nejsou připravené podklady. Nejprve vytvořte koalice pomocí nástroje volebni_mapy.sh"
         exit
      fi
      mkdir -p "$adresar_voleb/samostatné"
      python3 "$adresar_instalace/vytvorit_statistiky_pouze_hlasy.py" --volby "$2" --koalice ano --zpracovani "obce"
      python3 "$adresar_instalace/vytvorit_statistiky_pouze_hlasy.py" --volby "$2" --koalice ano --zpracovani "okrsky"
      python3 "$adresar_instalace/popisky.py" --volby "$2" --zpracovani "obce"
      python3 "$adresar_instalace/popisky.py" --volby "$2" --zpracovani "okrsky"
      ;;
   *) # neplatná možnost
      if ! [ "$1" == "" ]; then
         echo "Neplatná možnost: $1"
         echo
      fi
      Help_prikazy_samostatne
      exit;;
esac

cd "$adresar_voleb"
python3 "$adresar_instalace/vytvorit_statistiky_jednotlive.py" --volby "$2" --zpracovani "okrsky" --kstrana "$3" # zpracuje pouze zadanou stranu/y, pokud není zadána žádná, zpracuje všechny
python3 "$adresar_instalace/vytvorit_statistiky_jednotlive.py" --volby "$2" --zpracovani "obce" --kstrana "$3"