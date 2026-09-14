"""Příprava statistických dat."""

import os
import json
import numpy as np
import pandas as pd
import argparse
import vytvorit_seznam_subjektu

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument('--volby', action="store", dest='volby', required=True)
argumenty = parser.parse_args()
volby = argumenty.volby

soubor = "statistics-obce.csv"

os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\sada\\{volby}")

with open("info.json") as soubor:
    info = json.load(soubor)
    if info["druh"] == "sněmovní":
        seznam_id = "pst4.csv"
        seznam_vysledku = "pst4p.csv"
    if info["druh"] == "krajské":
        seznam_id = "kzt6.csv"
        seznam_vysledku = "kzt6p.csv"

# 1. fáze: vytvožení statistik (stejné jako v souboru transform.py, jen bez čísel okrsků)

# statistiky a id
statistics = pd.read_csv(seznam_id, delimiter=";", encoding="cp1250")
statistics['id'] = statistics['OBEC'].astype(str)

# výsledky
results = pd.read_csv(seznam_vysledku, delimiter=";", encoding="cp1250")
results['id'] = results['OBEC'].astype(str)

os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}")

# strany
parties = pd.read_csv("parties.csv", dtype={"STAVREG": str, "KSTRANA": str})
bezregistrace = vytvorit_seznam_subjektu.seznam()
parties = parties[["KSTRANA", "VSTRANA"]]

s = statistics[['id', 'VOL_SEZNAM', 'PL_HL_CELK']]

r = pd.pivot_table(results, values='POC_HLASU', index=['id'], columns=['KSTRANA'], aggfunc=np.sum, fill_value=0)

POCET_VS = len(parties)

r["POCET_VS"] = POCET_VS

r = r.merge(s, left_on='id', right_on='id')

r.to_csv(soubor, index=False)

statistika = pd.read_csv(soubor)

id = statistika.pop('id')

vol_seznam = statistika.pop("VOL_SEZNAM")

pl_hl_celk = statistika.pop("PL_HL_CELK")

pocet_vs = statistika.pop("POCET_VS")

statistika.drop(columns=bezregistrace, inplace=True)

statistika.rename(columns={x:y for x,y in zip(statistika.columns, range(1, len(statistika.columns) + 1))}, inplace=True) # přečíslování

statistika.insert(0, id.name, id)
statistika.insert(len(statistika.columns), vol_seznam.name, vol_seznam)
statistika.insert(len(statistika.columns), pl_hl_celk.name, pl_hl_celk)
statistika.insert(len(statistika.columns), pocet_vs.name, pocet_vs)
statistika.to_csv(soubor, index=False)

# 2. fáze: první součet

druhafaze = pd.read_csv(soubor)
prvnisoucet = (
    druhafaze
    .groupby('id', as_index=False)[['VOL_SEZNAM', 'PL_HL_CELK']]
    .sum()
)

print(prvnisoucet['VOL_SEZNAM'])

druhafaze.drop(columns=['VOL_SEZNAM', 'PL_HL_CELK'], inplace=True)
druhafaze.drop_duplicates(inplace=True)
druhafaze.insert(len(druhafaze.columns), 'VOL_SEZNAM', prvnisoucet["VOL_SEZNAM"].values)
druhafaze.insert(len(druhafaze.columns), 'PL_HL_CELK', prvnisoucet["PL_HL_CELK"].values)

druhafaze["POCET_VS"] = POCET_VS

druhafaze.to_csv(soubor, index=False)

# 3. fáze: druhý součet (přiřazení id statutárních obcí k jejich samosprávným částem a součet statistik)

tretifaze = pd.read_csv(soubor)

# obce
obce = pd.read_csv(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\společné\\coco.csv", delimiter=";", encoding="cp1250")

for i, row in tretifaze.iterrows():
    #print(tretifaze.index(i))
    nove_id = obce[obce["OBEC"] == row["id"]]
    if len(nove_id) < 1:
        continue
    tretifaze.at[i, "id"] = nove_id["OBEC_PREZ"].to_list()[0]

druhysoucet = (
    tretifaze
    .groupby('id', as_index=False)
    .sum()
)

druhysoucet["POCET_VS"] = POCET_VS

druhysoucet.to_csv(soubor, index=False)