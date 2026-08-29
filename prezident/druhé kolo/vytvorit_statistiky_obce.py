"""Příprava statistických dat."""

import os
import pandas as pd
import argparse

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument('--volby', action="store", dest='volby', required=True)
argumenty = parser.parse_args()
volby = argumenty.volby

soubor = "statistics-obce.csv"

# 1. fáze: vytvožení statistik (stejné jako v souboru transform.py, jen bez čísel okrsků)

os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\..\\sada\\{volby}\\")

# statistiky a přidání id
statistics = pd.read_csv("pet1.csv", delimiter=";", encoding="cp1250")
statistics['id'] = statistics['OBEC'].astype(str)

# výsledky
results = pd.read_csv("pet1.csv", delimiter=";", encoding="cp1250")
results['id'] = results['OBEC'].astype(str)

# strany
parties = pd.read_csv("perk.csv", delimiter=";", encoding="cp1250")

results = results[results["KOLO"] == 2]

results = results.drop(columns=["OKRES", "OBEC", "OKRSEK", "VYD_OBALKY", "ODEVZ_OBAL", "TYP_FORM", "OPRAVA", "KOLO", "CHYBA", "KC_1", "KC_2", "KC_3", "KC_4", "KC_SUM", "POSL_KAND"])

neplatni_kandidati = parties.index[(parties['PLATNOST'] == "N")].tolist()

for bunka in results.columns:
    if bunka.startswith("HLASY_"): # HLASY_  je šest písmen, která budou odstraněna
        results.rename(columns={bunka: str(int(bunka[6:]))}, inplace=True)

for bunka in results.columns: # smazání přebytečných sloupečků, které byly navíc
    if results[bunka].sum() == 0:
        results.pop(bunka)

col = results.pop('id')
results.insert(0, col.name, col)

results["POCET_VS"] = 2

col = results.pop("VOL_SEZNAM")
results.insert(len(results.columns), col.name, col)

col = results.pop("PL_HL_CELK")
results.insert(len(results.columns), col.name, col)

results.rename(columns={results.columns[1]: "1", results.columns[2]: "2"}, inplace=True) # přečíslování

os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\..\\public\\volby\\{volby}\\druhé kolo")
results.to_csv(soubor, index=False)

# 2. fáze: první součet

druhafaze = pd.read_csv(soubor)
prvnisoucet = (
    druhafaze
    .groupby('id', as_index=False)
    .sum()
)

POCET_VS = 2
prvnisoucet["POCET_VS"] = POCET_VS

prvnisoucet.to_csv(soubor, index=False)

# 3. fáze: druhý součet (přiřazení id statutárních obcí k jejich samosprávným částem a součet statistik)

tretifaze = pd.read_csv(soubor)

#print(tretifaze["id"].drop_duplicates())
#sys.exit()

# obce
obce = pd.read_csv(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\..\\společné\\coco.csv", delimiter=";", encoding="cp1250")

for i, row in tretifaze.iterrows():
    #print(tretifaze.index(i))
    nove_id = obce[obce["OBEC"] == row["id"]]["OBEC_PREZ"].to_list()[0]
    tretifaze.at[i, "id"] = nove_id

#print(tretifaze[tretifaze["id"] == 555134])
#print(tretifaze)
#sys.exit()

# tretifaze["id"] = obce["OBEC_PREZ"] # jelikož v této fázi jsou obce seřazené jak v souboru coco.csv, tak v souboru statistics-obce.csv, není potřeba nic dalšího řešit

druhysoucet = (
    tretifaze
    .groupby('id', as_index=False)
    .sum()
)

POCET_VS = 2
druhysoucet["POCET_VS"] = POCET_VS

druhysoucet.to_csv(soubor, index=False)