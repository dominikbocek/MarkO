otevrit_prohlizec() {
   local volby="$1"
   local kod="$2"
   local pripona="$3"
   if ! (( $(python3 "$adresar_instalace/jestatut.py" --volby "$volby" --obec "$kod" --vratit "kodstatut") == 0 )); then # samosprávný obvod
      obec=$(python3 "$adresar_instalace/jestatut.py" --volby "$volby" --obec "$kod" --vratit "kodstatut")
      python3 -m webbrowser "http://127.0.0.1/volby/$(urlencode "$volby")/obce/$obec/$kod/$pripona"
   else
      python3 -m webbrowser "http://127.0.0.1/volby/$(urlencode "$volby")/obce/$kod/$pripona"
   fi
}

Overeni_zpracovani() {
   local volby="$1"
   local obec="$2"
   local kod=$(python3 "$adresar_instalace/jestatut.py" --volby "$volby" --obec "$obec" --vratit "kodstatut")
   if (( $kod == 0 )); then
      if ! test -f "$adresar_voleb/obce/$obec/volebni_okrsky-simple-data-topo-$obec.json"; then
         echo "Chybí soubor $adresar_voleb/obce/$obec/volebni_okrsky-simple-data-topo-$obec.json"
         echo "Pro vytvoření samostatných map kandidujících subjektů je potřeba nejprve zpracovat data v normálním režimu pomocí příkazu bash ./volebni_mapy.sh -n"
         exit
      fi
   elif ! (( $kod == 0 )) && $(python3 "$adresar_instalace/jestatut.py" --volby "$volby" --obec "$obec" --vratit "jesamospravnyobvod"); then
      if ! test -f "$adresar_voleb/obce/$kod/$obec/volebni_okrsky-simple-data-topo-$obec.json"; then
         echo "Chybí soubor $adresar_voleb/obce/$kod/$obec/volebni_okrsky-simple-data-topo-$obec.json"
         echo "Pro vytvoření samostatných map kandidujících subjektů je potřeba nejprve zpracovat data v normálním režimu pomocí příkazu bash ./volebni_mapy.sh -n"
         exit
      fi
   fi
}