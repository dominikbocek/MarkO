import json
import csv

# Načti barvy z CSV souboru
barvy = []
with open('barvy.csv', 'r') as f:
    reader = csv.reader(f)
    for row in reader:
        barvy = [barva.strip() for barva in row]

# Načti JSON soubor
with open('vysledky_cr.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Přidej barvy do prvních 10 objektů
for i in range(min(10, len(data))):
    data[i]['color'] = barvy[i]

# Uložit zpět do JSON souboru
with open('vysledky_cr.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Barvy byly přidány.")
