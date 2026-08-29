"""Prepare data for chart."""

import numpy as np
import pandas as pd

# municipalities names
muni = pd.read_csv("pecoco.csv", delimiter=";", encoding="cp1250")

# statistics + id
statistics = pd.read_csv("pet1.csv", delimiter=";", encoding="cp1250")
statistics['id'] = statistics['OBEC'].astype(str) + '-' + statistics['OKRSEK'].astype(str)

# results
results = pd.read_csv("pet1.csv", delimiter=";", encoding="cp1250")
results['id'] = results['OBEC'].astype(str) + '-' + results['OKRSEK'].astype(str)

# parties
parties = pd.read_csv("perk.csv", delimiter=";", encoding="cp1250")

results = results[results["KOLO"] == 1]

results = results.drop(columns=["OKRES", "OBEC", "OKRSEK", "VYD_OBALKY", "ODEVZ_OBAL", "TYP_FORM", "OPRAVA", "KOLO", "CHYBA", "KC_1", "KC_2", "KC_3", "KC_4", "KC_SUM", "POSL_KAND"])

neplatni_kandidati = parties.index[(parties['PLATNOST'] == "N")].tolist()

for bunka in results.columns:
    if bunka.startswith("HLASY_"):
        results.rename(columns={bunka: str(int(bunka[6:]))}, inplace=True)
for bunka in results.columns:
    if results[bunka].sum() == 0:
        results.pop(bunka)

neplatni_kandidati = [int(i + 1) for i in neplatni_kandidati]
neplatni_kandidati = [str(i) for i in neplatni_kandidati]

results = results.drop(columns=neplatni_kandidati)

col = results.pop('id')
results.insert(0, col.name, col)

col = results.pop("VOL_SEZNAM")
results.insert(len(results.columns), col.name, col)

col = results.pop("PL_HL_CELK")
results.insert(len(results.columns), col.name, col)


results.to_csv("statistics.csv", index=False)









