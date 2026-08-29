"""Příprava statistických dat."""
# POZOR: NENÍ KOMPATIBILNÍ S KOMUNÁLNÍMI VOLBAMI 2010 A STARŠÍMI

import os
import sys
import argparse
import pandas as pd

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument('--obec', action="store", dest='obec', required=True)
parser.add_argument('--volby', action="store", dest='volby', required=True)
argumenty = parser.parse_args()
obec = int(argumenty.obec)
volby = argumenty.volby

# jde o místní obvod?
with open(f"{os.path.dirname(os.path.realpath(__file__))}\\obvody.py") as obvody:
    code = obvody.read()
exec(code)
if jestatut:
    sys.exit("Statistiky pro statutární města se samosprávnými obvody se zpracovávájí výhradně přes příkaz volebni_mapy.sh, nikdy ne přímo!")

doprovodne_statistiky = pd.read_csv(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}\\účast.csv", encoding="cp1250")

ucast_vybrana_obec = doprovodne_statistiky[doprovodne_statistiky["KODZASTUP"] == obec]

# výsledky
results = pd.read_csv(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\sada\\{volby}\\kvhl.csv", delimiter=";", encoding="cp1250")

results = results.drop(results[results["OBEC"] != obec].index)
results['id'] = results['OBEC'].astype(str) + '-' + results['OKRSEK'].astype(str)
results = results[["id", "POR_STR_HL", "POC_HLASU", "TYPZASTUP", "DATUMVOLEB"]]

if statut != 0 and jesamospravnyobvod:
    vysledky_obce = results[(results["TYPZASTUP"] == 1) & (results["DATUMVOLEB"] == datumvoleb)]
    vysledky_obvodu = results[(results["TYPZASTUP"] == 2) & (results["DATUMVOLEB"] == datumvoleb)]

    # Převod dat
    vysledky_obvodu_reorganizovano = vysledky_obvodu.pivot(
        index="id",
        columns="POR_STR_HL",
        values="POC_HLASU"
    ).reset_index()

    vysledky_obvodu_reorganizovano = pd.merge(vysledky_obvodu_reorganizovano, ucast_vybrana_obec, on="id")
    vysledky_obvodu_reorganizovano.to_csv(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}\\obce\\{statut}\\{obec}\\{obec}.csv", index=False)

elif statut != 0 and not jesamospravnyobvod:
    vysledky_obce = results[(results["TYPZASTUP"] == 1) & (results["DATUMVOLEB"] == datumvoleb)]
else:
    vysledky_obce = results

# Převod dat
vysledek_reorganizovano = vysledky_obce.pivot(# pokud jde o statutární město, sčítají se výsledky z místních samosprávných obvodů pro volby do statutárních zastupitelstev
    index="id",
    columns="POR_STR_HL",
    values="POC_HLASU"
).reset_index()

# Uložení do nového CSV
if statut != 0 and jesamospravnyobvod:
    doprovodne_statistiky_statutarni_mesto = pd.read_csv(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}\\účast-statutární-města.csv", encoding="cp1250")
    ucast_statutarni_mesto = doprovodne_statistiky_statutarni_mesto[doprovodne_statistiky_statutarni_mesto["KODZASTUP"] == statut]
    vysledek_reorganizovano = pd.merge(vysledek_reorganizovano, ucast_statutarni_mesto, on="id")
    vysledek_reorganizovano.to_csv(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}\\obce\\{statut}\\{obec}\\{statut}-statutární_zastupitelstvo.csv", mode='w', index=False)
elif statut == 0:
    vysledek_reorganizovano = pd.merge(vysledek_reorganizovano, ucast_vybrana_obec, on="id")
    vysledek_reorganizovano.to_csv(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}\\obce\\{obec}\\{obec}.csv", index=False)
else:
    doprovodne_statistiky_statutarni_mesto = pd.read_csv(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}\\účast-statutární-města.csv", encoding="cp1250")
    ucast_statutarni_mesto = doprovodne_statistiky_statutarni_mesto[doprovodne_statistiky_statutarni_mesto["KODZASTUP"] == statut]
    vysledek_reorganizovano = pd.merge(vysledek_reorganizovano, ucast_statutarni_mesto, on="id")
    #print(vysledek_reorganizovano)
    if os.path.exists(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}\\obce\\{statut}\\{statut}.csv"):
        hlava = False
    else:
        hlava = True
    vysledek_reorganizovano.to_csv(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}\\obce\\{statut}\\{statut}.csv", mode="a", index=False, header=hlava)