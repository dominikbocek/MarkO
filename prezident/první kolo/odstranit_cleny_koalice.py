import os
import json
import pandas as pd
import argparse

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument('--volby', action="store", dest='volby', required=True)
parser.add_argument('--koalice', action="store", dest='koalice', required=True)
argumenty = parser.parse_args()

volby = argumenty.volby
koalice = argumenty.koalice
koalice = koalice.split(",")

os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\..\\public\\volby\\{volby}\\první kolo")

# odstranit z legendy mapy
soubor = open("vysledky_cr2.json", 'r', encoding='utf-8')
jsonsoubor = json.load(soubor)
nova_data = []

for element in jsonsoubor:
    for f in koalice:
        if element["CKAND"] != f:
            pass
        else:
            break
    else:
        nova_data.append(element)
    
# seřazení podle CKAND a přečíslení

seradit = sorted(
             nova_data,
             key=lambda x: int(x["CKAND"]),
             reverse=False
        )

cislo = 1

for element in seradit:
    element["CKAND"] = str(cislo)
    cislo += 1

# seřazení podle procent hlasů a zápis dat do souboru

seradit = sorted(
             nova_data,
             key=lambda x: x["proc_hlasu"],
             reverse=True
        )

with open('vysledky_cr2.json', 'w+', encoding='utf-8') as soubor:
    json.dump(seradit, soubor, ensure_ascii=False, indent=2)
    

# odstranit ze seznamu subjektů
data = pd.read_csv("candidates2.csv", delimiter=",", encoding='utf-8')
koalice = [int(numeric_string) for numeric_string in koalice]
data = data[~data["CKAND"].isin(koalice)]
data["CKAND"] = range(1, len(data.index) + 1)
data.to_csv("candidates2.csv", index=False, encoding='utf-8')

# odstranit ze statistik
statistika = pd.read_csv("statistics2.csv", delimiter=",", encoding='utf-8')
koalice = argumenty.koalice
koalice = koalice.split(",")
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
statistika.to_csv("statistics2.csv", index=False)