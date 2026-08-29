"""Příprava statistických dat."""

import os
import numpy as np
import pandas as pd
import argparse

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument('--volby', action="store", dest='volby', required=True)
argumenty = parser.parse_args()
volby = argumenty.volby

os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\sada\\{volby}")

# statistiky a id
statistics = pd.read_csv("kzt6.csv", delimiter=";", encoding="cp1250")
statistics['id'] = statistics['OBEC'].astype(str) + '-' + statistics['OKRSEK'].astype(str)

# výsledky
results = pd.read_csv("kzt6p.csv", delimiter=";", encoding="cp1250")
results['id'] = results['OBEC'].astype(str) + '-' + results['OKRSEK'].astype(str)

# strany
parties = pd.read_csv("kzrkl.csv", delimiter=";", encoding="cp1250")
parties = parties[["KSTRANA", "VSTRANA"]]
parties.drop_duplicates(inplace=True)

s = statistics[['id', 'VOL_SEZNAM', 'PL_HL_CELK']]

r = pd.pivot_table(results, values='POC_HLASU', index=['id'], columns=['KSTRANA'], aggfunc=np.sum, fill_value=0)

r["POCET_VS"] = len(parties)

r = r.merge(s, left_on='id', right_on='id')

os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}")

r.to_csv("statistics.csv", index=False)

statistika = pd.read_csv("statistics.csv")

id = statistika.pop('id')

vol_seznam = statistika.pop("VOL_SEZNAM")

pl_hl_celk = statistika.pop("PL_HL_CELK")

pocet_vs = statistika.pop("POCET_VS")

statistika.rename(columns={x:y for x,y in zip(statistika.columns, range(1, len(statistika.columns) + 1))}, inplace=True) # přečíslování

statistika.insert(0, id.name, id)
statistika.insert(len(statistika.columns), vol_seznam.name, vol_seznam)
statistika.insert(len(statistika.columns), pl_hl_celk.name, pl_hl_celk)
statistika.insert(len(statistika.columns), pocet_vs.name, pocet_vs)
statistika.to_csv("statistics.csv", index=False)