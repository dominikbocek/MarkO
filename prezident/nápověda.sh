#!/bin/bash

Help_prikazy() {
    local prikaz="$1"
    case $prikaz in
        -n)
            echo "Spustí program v normálním režimu, tedy vytvoří mapu s barevným vyznačením vítězů."
            echo
            echo "Formát příkazu:"
            echo "      -n <volby> <uzemni_jednotka>"
            echo "<volby> představují název podsložky, ve které jsou uložená data pro zadané volby"
            echo "<uzemni_jednotka> je volitelným parametrem. Slouží ke specifikování podrobnosti mapy. Zpracovává výsledky na úrovni obcí a okrsků. Hodnotou je buď 'obce' nebo relativní cesta k podsložce s daty k okrskovým mapám. Ve výchozím stavu (pokud není zadána hodnota) zpracovává výsledky na úrovni obcí."
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
            echo "<koalice> je ve formátu čísel kandidátů (CKAND) oddělených čárkou; čísla kandidátů lze zjistit zadáním příkazu -s <volby>"
            echo "<nazev_koalice> je libovolné pojmenování vzniklé koalice; při víceslovném pojmenování nutno označit uvozovkami"
            echo "<zkratka_koalice> je totéž, co <nazev_koalice>, je zde pouze z důvodu zachování stejného formátu s daty volebních výsledků"
            echo
            echo "Lze vytvářet více koalic, pokud počet subjektů v seznamu je větší než 2." Koalice je poté možné kombinovat mezi sebou. Je možné vytvořit i celkovou koalici ze všech subjektů v seznamu, ale proč by to někdo dělal...
            echo "V případě vytváření více koalic použijte CKAND z příkazu -s 'základ+koalice', viz možnost -s"
            echo "U druhého kola prezidentských voleb není tato možnost dostupná."
            exit;;
        -koalice-samostatne)
            echo "Vytvoří koalice podle zadaných kandidátů, ale neprojeví se to na mapě okrskových vítězů, pouze na mapě míry podpory."
            echo
            echo "Formát příkazu:"
            echo "  viz možnost -k"
            echo "Koalice lze vytvářet neomezeně, ale nelze je mezi sebou kombinovat."
            echo "U druhého kola prezidentských voleb není tato možnost dostupná."
            ;;
        *)
            python3 -m webbrowser "https://www.youtube.com/watch?v=f7JezlJx1-4"
    esac
}