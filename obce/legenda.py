import os
import csv
import json
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

if statut != 0:
    cesta = f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}\\obce\\{statut}\\{obec}"
else:
    cesta = f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}\\obce\\{obec}"

soubor = f"{cesta}\\parties-{obec}.csv"
statistiky = f"{cesta}\\{obec}.csv"
souborjson = f"{cesta}\\vysledky_cr_{obec}.json"

data = pd.read_csv(statistiky, delimiter=",", encoding='utf-8')
platne_hlasy_celkem = int(data["PL_HL_CELK"].sum(axis=0))

# Otevření souboru v režimu pro čtení
csvfile = open(soubor, 'r', encoding='utf-8')
reader = csv.DictReader(csvfile)
parties_dict = {}

for row in reader:
    if row["POR_STR_HL"] in data.columns:
        POR_STR_HL = row["POR_STR_HL"]
        OSTRANA = row["OSTRANA"]
        VSTRANA = row["VSTRANA"]

        # uloží se jen jednou (případně přepíše duplicitní)
        parties_dict[POR_STR_HL] = {
            "strana": row["ZKRATKAO30"],
            "proc_hlasu": (int(data[POR_STR_HL].sum(axis=0)) / platne_hlasy_celkem) * 100,
            "POR_STR_HL": POR_STR_HL,
            "OSTRANA": OSTRANA,
            "VSTRANA": VSTRANA
        }

# převedení zpět na list
parties = list(parties_dict.values())

# Seřazení od největšího po nejmenší
vysledky_sorted = sorted(
    parties,
    key=lambda x: x["proc_hlasu"],
    reverse=True
)

# Aktualizace souboru
with open(souborjson, 'w', encoding='utf-8') as jsonfile:
    json.dump(vysledky_sorted, jsonfile, ensure_ascii=False, indent=2)

print("Soubor " + souborjson +  " byl úspěšně vytvořen.")