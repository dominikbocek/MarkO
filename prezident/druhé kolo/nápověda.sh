#!/bin/bash

Help_prikazy_volebni_mapy() {
    local prikaz="$1"
    if [ "$prikaz" == "" ]; then
        echo "MarkO: program na vytváření map s volebními výsledky - verze pro 2. kolo prezidentských voleb"
        echo
        echo "Nápověda:"
        echo "možnosti"
        echo "-h                       zobrazí tuto nápovědu"
        echo "-i                       zobrazí informace o programu"
        echo "-n                       spustí program v normálním režimu"
        exit
    fi
    case $prikaz in
        -n)
            echo "Spustí program v normálním režimu, tedy vytvoří mapu volební podpory pro zadaný volební subjekt."
            echo
            echo "Formát příkazu:"
            echo "      -n <volby>"
            echo "<volby> název voleb, pod nímž jsou uvedeny v soubrou společné/info.csv"
            exit;;
        -s)
            echo "Vypíše tabulku volebních subjektů. Hodí se v případě, že chcete vytvářet koalice."
            echo
            echo "Fornát příkazu:"
            echo "      -s <volby> <seznam> <vypsat_jako_json>"
            echo "<volby> představují název podsložky, ve které jsou uložená data pro zadané volby"
            echo "<seznam> je volitelným parametrem; možné hodnoty jsou 'základ', 'základ+koalice' a 'všechno'. Hodnota 'základ' vypisuje seznam kandidujících subjektů. Hodnota 'základ+koalice' vypisuje seznam kandidujících subjektů, které zůstaly po vytvoření koalic, plus koalice vytvořené možností -k. Hodnota 'všechno' vypisuje seznam kandidujícíh subjektů plus koalice vytvořené možností -k a -koalice-samostatne."
            exit;;
        -i)
            echo "Vypíše informace o programu, ale nic užitečného tam nejspíš nenajdete."
            exit;;
        *)
            python3 -m webbrowser "https://www.youtube.com/watch?v=f7JezlJx1-4"
            exit;;
    esac
}

Help_prikazy_samostatne() {
    local prikaz="$1"
    if [ "$prikaz" == "" ]; then
        echo "MarkO: program na vytváření map s volebními výsledky - verze pro 2. kolo prezidentských voleb"
        echo "Nápověda:"
        echo
        echo "možnosti"
        echo "-h      zobrazí tuto nápovědu"
        echo "-n      spustí program v normálním režimu"
        exit
    fi
    case $prikaz in
        -n)
            echo "Spustí program v normálním režimu, tedy vytvoří mapu volební podpory pro zadaný volební subjekt."
            echo
            echo "Formát příkazu:"
            echo "      -n <volby>"
            echo "<volby> název voleb, pod nímž jsou uvedeny v soubrou společné/info.csv"
            exit;;
        *)
            python3 -m webbrowser "https://www.youtube.com/watch?v=aY3Mq0em8mY"
            exit;;
    esac
}