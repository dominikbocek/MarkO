import os
import csv
import json
import pandas as pd
import argparse

# zpracování argumentů a ověřování vstupů
parser = argparse.ArgumentParser()
parser.add_argument('--volby', action="store", dest="volby", required=True)
parser.add_argument('--kodobec', action="store", dest="kodobec", default="")
parser.add_argument('--dosouboru', action="store", dest="dosouboru", default=False)
argumenty = parser.parse_args()
volby = argumenty.volby
kodobec = argumenty.kodobec
dosouboru = argumenty.dosouboru

os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}")

soubor = "parties.csv"
statistiky = "statistics-obce.csv" # kvůli dynamickému generování legendy (celkové výsledky pro obec)
souborjson = "vysledky_cr.json"

data = pd.read_csv(statistiky, delimiter=",", encoding='utf-8')
data = data[data["id"] == int(kodobec)]
platne_hlasy_celkem = int(data["PL_HL_CELK"].sum(axis=0))

# Otevření souboru v režimu pro čtení
csvfile = open(soubor, 'r', encoding='utf-8')
reader = csv.DictReader(csvfile)
parties_dict = {}

for row in reader:
    if row["KSTRANA"] in data.columns:
        kstrana = row["KSTRANA"]

        # uloží se jen jednou (případně přepíše duplicitní)
        parties_dict[kstrana] = {
            "strana": row["ZKRATKAK30"],
            "zkratka": row["ZKRATKAK8"],
            "proc_hlasu": (int(data[kstrana].sum(axis=0)) / platne_hlasy_celkem) * 100,
            "KSTRANA": kstrana,
            "VSTRANA": row["VSTRANA"]
        }

# převedení zpět na list
parties = list(parties_dict.values())

# Seřazení od největšího po nejmenší
vysledky_sorted = sorted(
    parties,
    key=lambda x: x["proc_hlasu"],
    reverse=True
)

# Uložení do souboru
if dosouboru:
    with open(souborjson, 'w', encoding='utf-8') as jsonfile:
        json.dump(vysledky_sorted, jsonfile, ensure_ascii=False, indent=2)

    print("Soubor " + souborjson +  " byl úspěšně vytvořen.")
else:
    print(json.dumps(vysledky_sorted, ensure_ascii=False, indent=2))