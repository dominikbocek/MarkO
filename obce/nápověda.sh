#!/bin/bash

Help_prikazy_volebni_mapy() {
    local prikaz="$1"
    if [ "$prikaz" == "" ]; then
        echo "MarkO: program na vytváření map s volebními výsledky - verze pro obecní volby"
        echo
        echo "Nápověda:"
        echo "možnosti"
        echo "-h                        zobrazí tuto nápovědu"
        echo "-i                        zobrazí informace o programu"
        echo "-n                        spustí program v normálním režimu"
        echo "-S                        spustí program v normálním režimu, určeno pro statutární města"
        echo "-s                        vypíše seznam kandidujících subjektů"
        echo "-k                        vytvoří koalice podle zadaných subjektů a propíše je do mapy okrskových vítězů"
        echo "-koalice-samostatne       vytvoří koalice podle zadaných subjektů, ale neprojeví se to na mapě okrskových vítězů, pouze na mapě míry podpory"
        exit
    fi
    case $prikaz in
        -n)
            echo "Spustí program v normálním režimu, tedy vytvoří mapu s barevným vyznačením vítězů. Zpracuje obec/samosprávný obvod podle zadaného kódu (u statutárních obcí - pokud mají samosprávné obvody - zpracuje pouze statutární zastupitelstvo)."
            echo
            echo "Formát příkazu:"
            echo "      -n <volby> <zdroj> <obec>"
            echo "<volby> název voleb, pod nímž jsou uvedeny v soubrou společné/info.csv"
            echo "<zdroj> RÚIAN|místní zdroj, ve výchozím stavu místní zdroj z roku 2022"
            echo "<obec> kód obce nebo místního samosprávného obvodu"
            exit;;
        -S)
            echo "Viz možnost -n. U statutárních obcí - pokud mají samosprávné obvody - zpracuje statutární zastupitelstvo i samosprávné obvody."
            echo
            echo "Formát příkazu:"
            echo "      -S <volby> <zdroj> <obec>"
            exit;;
        -s)
            echo "Vypíše tabulku volebních subjektů. Hodí se v případě, že chcete vytvářet koalice."
            echo
            echo "Formát příkazu:"
            echo "      -s <volby> <obec> <vypsat> <json>"
            echo "<volby> název voleb, pod nímž jsou uvedeny v soubrou společné/info.csv"
            echo "<obec> kód obce nebo místního samosprávného obvodu"
            echo "<vypsat> určuje, jaký seznam se vypíše; možné hodnoty: základ, základ+koalice, všechno (viz manuál)"
            echo "<json> určuje, zda se seznam vypíše ve formátu json; možné hodnoty: ano (volitelné, ostatní hodnoty znamenají ne, výchozí stav je ne)"
            exit;;
        -i)
            echo "Vypíše informace o programu, ale nic užitečného tam nejspíš nenajdete."
            exit;;
        -k)
            echo "Umožňuje vytvářet koalice."
            echo
            echo "Formát příkazu:"
            echo "      -k <volby> <obec> <koalice> <název_koalice> <zkratka>"
            echo "<volby> název voleb, pod nímž jsou uvedeny v soubrou společné/info.csv"
            echo "<obec> kód obce nebo místního samosprávného obvodu"
            echo "<koalice> čísla koaličních subjektů, viz možnost -s"
            echo "<název_koalice> název koalice"
            echo "<zkratka> zkratka názvu koalice"
            exit;;
        -koalice-samostatne)
            echo "Vytvoří koalice podle zadaných kandidátů, ale neprojeví se to na mapě okrskových vítězů, pouze na mapě míry podpory."
            echo
            echo "Formát příkazu:"
            echo "  viz možnost -k"
            echo "Koalice lze vytvářet neomezeně, ale nelze je mezi sebou kombinovat."
            exit;;
        *)
            python3 -m webbrowser "https://www.youtube.com/watch?v=f7JezlJx1-4"
            exit;;
    esac
}

Help_prikazy_samostatne() {
    local prikaz="$1"
    if [ "$prikaz" == "$1" ]; then
        echo "Program na vytváření map s volebními výsledky - verze pro obecní volby"
        echo "Nápověda:"
        echo
        echo "možnosti"
        echo "-h      zobrazí tuto nápovědu"
        echo "-n      spustí program v normálním režimu"
        echo "-S      spustí program v normálním režimu, určeno pro statutární města"
        echo "-k      zpracuje výsledky na základě dříve vytvořených koalic, pokud byly vytvořeny, případně zpracuje subjekt/y samostatně (více informací v manuálu)"
    fi
    case $prikaz in
        -n)
            echo "Spustí program v normálním režimu, tedy vytvoří mapu volební podpory pro zadaný volební subjekt."
            echo
            echo "Formát příkazu:"
            echo "      -n <volby> <strana> <obec>"
            echo "<volby> název voleb, pod nímž jsou uvedeny v soubrou společné/info.csv"
            echo "<strana> číslo strany, viz možnost -s"
            echo "<obec> kód obce nebo místního samosprávného obvodu"
            exit;;
        -S)
            echo "Viz možnost -n. U statutárních obcí - pokud mají samosprávné obvody - zpracuje statutární zastupitelstvo i samosprávné obvody."
            echo
            echo "Formát příkazu:"
            echo "      -S <volby> <strana> <obec>"
            exit;;
        -k)
            echo "Zpracuje výsledky na základě dříve vytvořených koalic, pokud byly vytvořeny, případně zpracuje subjekt/y samostatně (více informací v manuálu)."
            echo
            echo "<volby> název voleb, pod nímž jsou uvedeny v soubrou společné/info.csv"
            echo "<strana> číslo strany, viz možnost -s"
            echo "<obec> kód obce nebo místního samosprávného obvodu"
            exit;;
        *)
            python3 -m webbrowser "https://www.youtube.com/watch?v=aY3Mq0em8mY"
            exit;;
    esac
}