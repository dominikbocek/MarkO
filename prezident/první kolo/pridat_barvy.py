import os
import sys
import csv
import json
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--volby', action="store", dest='volby', required=True)
parser.add_argument('--koalice', action="store", dest='koalice', default="ne")
argumenty = parser.parse_args()

volby = argumenty.volby
koalice = argumenty.koalice
soubor = ""

os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\..\\public\\volby\\{volby}\\první kolo")

match koalice:
    case "ne":
        soubor = "vysledky_cr.json"
    case "ano":
        soubor = "vysledky_cr2.json"
    case _:
        sys.exit("Neplatná možnost!")

# načtení barev z csv souboru
barvy = []
with open(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\..\\společné\\barvy.csv", 'r') as f:
    reader = csv.reader(f)
    for row in reader:
        barvy = [barva.strip() for barva in row]

# načtení json souboru
with open(soubor, 'r', encoding='utf-8') as f:
    data = json.load(f)

# přidání barev do prvních 10 objektů
for i in range(min(10, len(data))):
    data[i]['color'] = barvy[i]

# uložení zpět do json souboru
with open(soubor, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Barvy byly úspěšně přidány.")