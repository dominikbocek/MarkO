import json
import csv
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--koalice', action="store", dest='koalice', default="ne")
argumenty = parser.parse_args()
koalice = argumenty.koalice
soubor = ""
if koalice == "ne":
  soubor = "vysledky_cr.json"
elif koalice == "ano":
  soubor = "vysledky_cr2.json"

# Načti barvy z CSV souboru
barvy = []
with open('barvy.csv', 'r') as f:
    reader = csv.reader(f)
    for row in reader:
        barvy = [barva.strip() for barva in row]

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
