import os
import sys
import csv
import json
import shutil
import pandas as pd
import argparse

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

# zpracování argumentů a ověřování vstupů
parser = argparse.ArgumentParser()
parser.add_argument('--volby', action="store", dest="volby", required=True)
parser.add_argument('--kodobec', action="store", dest="kodobec", type=int, default=0)
parser.add_argument('--dosouboru', action="store", dest="dosouboru", default=False)
parser.add_argument('--koalice', action="store", dest="koalice", default="ne")

argumenty = parser.parse_args()
volby = argumenty.volby
kodobec = argumenty.kodobec
dosouboru = argumenty.dosouboru
koalice = argumenty.koalice

os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\..\\public\\volby\\{volby}\\první kolo")

soubor = "candidates.csv"
souborjson = "vysledky_cr.json"

match koalice:
    case "ano":
        statistiky = "statistics-obce2.csv" # kvůli dynamickému generování legendy (celkové výsledky pro obec)
    case "ne":
        statistiky = "statistics-obce.csv" # kvůli dynamickému generování legendy (celkové výsledky pro obec)
    case _:
        sys.exit("Neplatná možnost!")

data = pd.read_csv(statistiky, delimiter=",", encoding='utf-8')
if kodobec > 0:
    data = data[data["id"] == kodobec]
platne_hlasy_celkem = int(data["PL_HL_CELK"].sum(axis=0))

# Otevření souboru v režimu pro čtení
csvfile = open(soubor, 'r', encoding='utf-8')
reader = csv.DictReader(csvfile)
parties_dict = {}

for row in reader:
    if row["CKAND"] in data.columns:
        ckand = row["CKAND"]
        proc_hlasu = (int(data[ckand].sum(axis=0)) / platne_hlasy_celkem) * 100

        if proc_hlasu > 0: # kvůli odstranění subjektů, které v daném místě nekandidovaly
            # uloží se jen jednou (případně přepíše duplicitní)
            parties_dict[ckand] = {
                "kandidat": row["JMENO"] + " " + row["PRIJMENI"],
                "CKAND": ckand,
                "proc_hlasu": proc_hlasu
            }

# převedení zpět na list
parties = list(parties_dict.values())

# Seřazení od největšího po nejmenší
vysledky_sorted = sorted(
    parties,
    key=lambda x: x["proc_hlasu"],
    reverse=True
)

# Načtení barev ze souboru csv
barvy = []
with open(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\..\\společné\\barvy.csv", 'r') as f:
    reader = csv.reader(f)
    for row in reader:
        barvy = [barva.strip() for barva in row]

# přidání barev do (maximálně) prvních deseti objektů
for i in range(min(10, len(vysledky_sorted))):
    vysledky_sorted[i]['color'] = barvy[i]

# Uložení do souboru
if dosouboru:
    with open(souborjson, 'w', encoding='utf-8') as jsonfile:
        json.dump(vysledky_sorted, jsonfile, ensure_ascii=False, indent=2)

    if not os.path.exists("vysledky_cr2.json"):
        shutil.copy(souborjson, "vysledky_cr2.json")

    print("Soubor " + souborjson +  " byl úspěšně vytvořen.")
else:
    print(json.dumps(vysledky_sorted, ensure_ascii=False, indent=2))