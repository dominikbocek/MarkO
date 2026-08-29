import os
import sys
import csv
import json
import argparse
import pandas as pd

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument('--koalice', action="store", dest='koalice', default="ne")
parser.add_argument('--obec', action="store", dest='obec', required=True)
parser.add_argument('--volby', action="store", dest='volby', required=True)
argumenty = parser.parse_args()
koalice = argumenty.koalice
obec = int(argumenty.obec)
volby = argumenty.volby

# jde o místní obvod?
with open(f"{os.path.dirname(os.path.realpath(__file__))}\\obvody.py") as obvody:
    code = obvody.read()
exec(code)

if statut != 0:
    cesta = f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}\\obce\\{statut}\\{obec}"
else:
    cesta = f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}\\obce\\{obec}"

soubor = ""
souborjson = ""
match koalice:
    case "ne":
        soubor = f"{cesta}\\parties-{obec}.csv"
        souborjson = f"{cesta}\\parties-{obec}.json"
        statistiky = f"{cesta}\\{obec}.csv"
    case "ano":
        soubor = f"{cesta}\\parties-{obec}-2.csv"
        souborjson = f"{cesta}\\parties-{obec}-2.json"
        statistiky = f"{cesta}\\{obec}-2.csv"
    case "univerzal":
        soubor = f"{cesta}\\parties-{obec}-univerzal.csv"
        souborjson = f"{cesta}\\parties-{obec}-univerzal.json"
        statistiky = f"{cesta}\\{obec}-univerzal.csv"
    case _:
        sys.exit("Neplatná možnost!")


data = pd.read_csv(statistiky, delimiter=",", encoding='utf-8')
csvfile = open(soubor, 'r', encoding='utf-8')
reader = csv.DictReader(csvfile)
parties_dict = {}

for row in reader:
    if row["POR_STR_HL"] in data.columns:
        POR_STR_HL = row["POR_STR_HL"]

        # uloží se jen jednou (případně přepíše duplicitní)
        parties_dict[POR_STR_HL] = {
            "OSTRANA": row["OSTRANA"],
            "VSTRANA": row["VSTRANA"],
            "ZKRATKAO30": row["ZKRATKAO30"],
            "ZKRATKAO8": row["ZKRATKAO8"],
            "POR_STR_HL": row["POR_STR_HL"]
        }

vysledky_sorted = {
    k: parties_dict[k]
    for k in sorted(parties_dict, key=lambda x: int(x))
}

with open(souborjson, 'w', encoding='utf-8') as jsonfile:
    json.dump(vysledky_sorted, jsonfile, ensure_ascii=False, indent=2)

print("Soubor " + souborjson +  " byl úspěšně vytvořen.")