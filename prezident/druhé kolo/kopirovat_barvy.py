import os
import json
import argparse

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument('--volby', action="store", dest='volby', required=True)
argumenty = parser.parse_args()
volby = argumenty.volby

os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\..\\public\\volby\\{volby}\\druhé kolo")

# načtení json souborů
with open('vysledky_cr.json', 'r', encoding='utf-8') as f:
    vysledky = json.load(f)

with open('candidates.json', 'r', encoding='utf-8') as f:
    parties = json.load(f)

# dvě položky ze souboru vysledky_cr.json
dve = vysledky[:2]

# spojení vlastnosti CKAND a barev
color_map = {item['CKAND']: item['color'] for item in dve}

# aktualizace dat
for key, party in parties.items():
    ckand = party.get('CKAND')
    if ckand in color_map:
        party['color'] = color_map[ckand]

# uložení aktualizovaných dat do souboru parties.json
with open('candidates.json', 'w', encoding='utf-8') as f:
    json.dump(parties, f, ensure_ascii=False, indent=2)

print("Barvy byly úspěšně překopírovány!")