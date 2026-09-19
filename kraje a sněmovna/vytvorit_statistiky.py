"""Příprava statistických dat."""

import os
import json
import numpy as np
import pandas as pd
import argparse
import subprocess

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument('--volby', action="store", dest='volby', required=True)
argumenty = parser.parse_args()
volby = argumenty.volby

soubor = "statistics.csv"

os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\sada\\{volby}")

with open("info.json", encoding="utf-8") as jsonsoubor:
    info = json.load(jsonsoubor)
    if info["druh"] == "sněmovní":
        seznam_id = "pst4.csv"
        seznam_vysledku = "pst4p.csv"
    if info["druh"] == "krajské":
        seznam_id = "kzt6.csv"
        seznam_vysledku = "kzt6p.csv"

# statistiky a id
statistics = pd.read_csv(seznam_id, delimiter=";", encoding="cp1250")
statistics['id'] = statistics['OBEC'].astype(str) + '-' + statistics['OKRSEK'].astype(str)

# výsledky
results = pd.read_csv(seznam_vysledku, delimiter=";", encoding="cp1250")
results['id'] = results['OBEC'].astype(str) + '-' + results['OKRSEK'].astype(str)

os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}")

# strany
parties = pd.read_csv("parties.csv", dtype={"STAVREG": str, "KSTRANA": str})
bezregistrace = subprocess.run(["python3", f"{os.path.dirname(os.path.realpath(__file__))}\\vytvorit_seznam_subjektu.py", "--volby", f"{volby}", "--dosouboru", "False"], capture_output=True, text=True).stdout
bezregistrace = eval(bezregistrace)
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