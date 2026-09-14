import argparse
import pandas as pd
import json
import sys
import os

# zpracování argumentů a ověřování vstupů
parser = argparse.ArgumentParser()
parser.add_argument('--volby', action="store", dest='volby', required=True)
parser.add_argument('--koalice', action="store", dest='koalice', required=True)
parser.add_argument('--nazevkoalice', action="store", dest='nazevkoalice', required=True)
parser.add_argument('--zkratka', action="store", dest='zkratka', required=True)
argumenty = parser.parse_args()

for argument in argumenty.__dict__:
    if argumenty.__dict__[argument] == "":
        sys.exit(f"Argument {argument} nesmí být prázdný!")

volby = argumenty.volby
koalice = argumenty.koalice
nazevkoalice = argumenty.nazevkoalice
zkratka = argumenty.zkratka

koalice = koalice.split(",")

seznam_subjektu_koalice = "parties2.csv"
seznam_subjektu_vsechno = "parties-univerzal.csv"
vysledky = "vysledky_cr2.json"

os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}")

### upravení seznamu subjektů (přidání koalice do seznamu a vytvoření samostatného souboru) ###

# přidání
strany = pd.read_csv(seznam_subjektu_koalice, delimiter=",", encoding='utf-8')
kstrana_vstrana = len(strany) + 1
a = pd.DataFrame([[kstrana_vstrana, str(kstrana_vstrana) + "-" + "koala", nazevkoalice, zkratka]], columns=['KSTRANA', 'VSTRANA', 'ZKRATKAK30', 'ZKRATKAK8'])
strany = pd.concat([strany, a])

# odstranění ze seznamu subjektů
koalice = [int(numeric_string) for numeric_string in koalice]
strany = strany[~strany["KSTRANA"].isin(koalice)]
strany["KSTRANA"] = range(1, len(strany) + 1)
strany.to_csv(seznam_subjektu_koalice, index=False, encoding='utf-8')

strany_vsechno = pd.read_csv(seznam_subjektu_vsechno, delimiter=",", encoding='utf-8')
kstrana_vstrana2 = len(strany_vsechno) + 1
a = pd.DataFrame([[kstrana_vstrana2, str(kstrana_vstrana2) + "-" + "koala", nazevkoalice, zkratka]], columns=['KSTRANA', 'VSTRANA', 'ZKRATKAK30', 'ZKRATKAK8'])
strany_vsechno = pd.concat([strany_vsechno, a])
strany_vsechno.to_csv(seznam_subjektu_vsechno, index=False, encoding='utf-8')

### aktualizace souboru statistik ###

def statistiky(zpracovani):
    koalice = argumenty.koalice
    koalice = koalice.split(",")

    match zpracovani:
        case "obce":
            statistiky = "statistics-obce.csv"
            statistiky_koalice = "statistics-obce2.csv"
            statistiky_vsechno = "statistics-obce-univerzal.csv"
        case "okrsky":
            statistiky = "statistics.csv"
            statistiky_koalice = "statistics2.csv"
            statistiky_vsechno = "statistics-univerzal.csv"
        case _:
            sys.exit("Neplatná možnost!")

    if os.path.exists(statistiky_koalice):
        data = pd.read_csv(statistiky_koalice, delimiter=",", encoding='utf-8')
    else:
        data = pd.read_csv(statistiky, delimiter=",", encoding='utf-8') # soubor definován druhem zpracování se používá pouze zde

    #kontrola, zda není zadaná koalice mimo rozsah seznamu | nebylo by záhodno to nahradit ověřováním z csv?

    file_data = json.load(open(vysledky, 'r', encoding='utf-8'))
    for g in koalice:
        for element in file_data:
            if element["KSTRANA"] == g:
                break
        else:
            sys.exit(f"Mimo rozsah!")

    POCET_VS = len(strany) # už má v sobě zahrnuté aktualizované počty z parties2.csv

    data[POCET_VS] = data[koalice].sum(axis=1)

    data["POCET_VS"] = POCET_VS

    # uložení do nového souboru
    data.to_csv(statistiky_koalice, index=False)

    ### další věci ###

    universal = pd.read_csv(statistiky_vsechno)

    universal[len(strany_vsechno)] = data[koalice].sum(axis=1) # přebírání součtu shora, možná posunout sloupec
    universal["POCET_VS"] = len(strany_vsechno)
    universal.to_csv(statistiky_vsechno, index=False)

    ### odstranění členů koalice ###
    # odstranit ze statistik
    statistika = pd.read_csv(statistiky_koalice, delimiter=",", encoding='utf-8')
    for f in koalice:
        statistika.pop(f)

    id = statistika.pop('id')
    vol_seznam = statistika.pop("VOL_SEZNAM")
    pl_hl_celk = statistika.pop("PL_HL_CELK")
    pocet_vs = statistika.pop("POCET_VS")

    statistika.rename(columns={x:y for x,y in zip(statistika.columns, range(1, len(statistika.columns) + 1))}, inplace=True) # přečíslování

    statistika.insert(0, id.name, id)
    statistika.insert(len(statistika.columns), vol_seznam.name, vol_seznam)
    statistika.insert(len(statistika.columns), pl_hl_celk.name, pl_hl_celk)
    statistika.insert(len(statistika.columns), pocet_vs.name, pocet_vs)
    statistika.to_csv(statistiky_koalice, index=False)

statistiky("obce")
statistiky("okrsky")

print("ok")