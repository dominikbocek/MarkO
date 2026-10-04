#!/bin/bash

Help_prikazy_volebni_mapy() {
    local prikaz="$1"
    if [ "$prikaz" == "" ]; then
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
        exit
    fi
    case $prikaz in
        -n)
            echo "Spustí program v normálním režimu, tedy vytvoří mapu s barevným vyznačením vítězů."
            echo
            echo "Formát příkazu:"
            echo "      -n <volby> <mapový_podklad>"
            echo "<volby> název voleb, pod nímž jsou uvedeny v soubrou společné/info.csv"
            echo "<mapový_podklad> relativní cesta k mapovému podkladu, volitelné"
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
        -k)
            echo "Umožňuje vytvářet koalice."
            echo
            echo "Formát příkazu:"
            echo "      -n <volby> <koalice> <nazev_koalice> <zkratka_koalice>"
            echo "Všechny parametry jsou povinné."
            echo "<volby> představují název podsložky, ve které jsou uložená data pro zadané volby"
            echo "<koalice> je ve formátu čísel kandidátů (KSTRANA) oddělených čárkou; čísla kandidátů lze zjistit zadáním příkazu -s <volby>"
            echo "<nazev_koalice> je libovolné pojmenování vzniklé koalice; při víceslovném pojmenování nutno označit uvozovkami"
            echo "<zkratka_koalice> je totéž, co <nazev_koalice>, je zde pouze z důvodu zachování stejného formátu s daty volebních výsledků"
            echo
            echo "Lze vytvářet více koalic, pokud počet subjektů v seznamu je větší než 2." Koalice je poté možné kombinovat mezi sebou. Je možné vytvořit i celkovou koalici ze všech subjektů v seznamu, ale proč by to někdo dělal...
            echo "V případě vytváření více koalic použijte KSTRANA z příkazu -s 'základ+koalice', viz možnost -s"
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
    if [ "$prikaz" == "" ]; then
        echo "MarkO: program na vytváření map s volebními výsledky - verze pro sněmovní a krajské volby"
        echo "Nápověda:"
        echo
        echo "možnosti"
        echo "-h      zobrazí tuto nápovědu"
        echo "-n      spustí program v normálním režimu"
        echo "-k      zpracuje výsledky na základě dříve vytvořených koalic, pokud byly vytvořeny, případně zpracuje subjekt/y samostatně (více informací v manuálu)"
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
        -k)
            echo "Zpracuje výsledky na základě dříve vytvořených koalic, pokud byly vytvořeny, případně zpracuje subjekt/y samostatně (více informací v manuálu)."
            echo
            echo "Formát příkazu:"
            echo "      -k <volby>"
            echo "<volby> název voleb, pod nímž jsou uvedeny v soubrou společné/info.csv"
            exit;;
        *)
            python3 -m webbrowser "https://www.youtube.com/watch?v=aY3Mq0em8mY"
            exit;;
    esac
}