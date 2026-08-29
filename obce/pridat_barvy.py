import os
import sys
import csv
import json
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--koalice', action="store", dest='koalice', default="ne")
parser.add_argument('--obec', action="store", dest='obec', required=True)
parser.add_argument('--volby', action="store", dest='volby', required=True)
argumenty = parser.parse_args()
koalice = argumenty.koalice
volby = argumenty.volby
obec = int(argumenty.obec)

# Načti barvy z CSV souboru
barvy = []
with open(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\společné\\barvy.csv", 'r') as f:
    reader = csv.reader(f)
    for row in reader:
        barvy = [barva.strip() for barva in row]

# jde o místní obvod?
with open(f"{os.path.dirname(os.path.realpath(__file__))}\\obvody.py") as obvody:
    code = obvody.read()
exec(code)

if statut != 0:
    cesta = f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}\\obce\\{statut}\\{obec}"
else:
    cesta = f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}\\obce\\{obec}"

soubor = ""
match koalice:
    case "ne":
        soubor = f"{cesta}\\vysledky_cr_{obec}.json"
    case "ano":
        soubor = f"{cesta}\\vysledky_cr_{obec}_2.json"
    case _:
        sys.exit("Neplatná možnost!")

# Načti JSON soubor
with open(soubor, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Přidej barvy do prvních 10 objektů
for i in range(min(10, len(data))):
    data[i]['color'] = barvy[i]

# Uložit zpět do JSON souboru
with open(soubor, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Barvy byly přidány do prvních 10 objektů!")