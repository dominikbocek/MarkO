import os
import sys
import json
import argparse

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument('--volby', action="store", dest="volby", required=True)
parser.add_argument('--koalice', action="store", dest='koalice', default="ne")
argumenty = parser.parse_args()
volby = argumenty.volby
koalice = argumenty.koalice
soubor = ""
vysledky = ""

os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}")

match koalice:
    case "ne":
        soubor = "parties.json"
        vysledky = "vysledky_cr.json"
    case "ano":
        soubor = "parties2.json"
        vysledky = "vysledky_cr2.json"
    case _:
        sys.exit("Neplatná možnost!")

# načtení obou souborů JSON
with open(vysledky, 'r', encoding='utf-8') as f:
    vysledky = json.load(f)

with open(soubor, 'r', encoding='utf-8') as f:
    parties = json.load(f)

# seznam prvních deseti položek ze souboru vysledky_cr.json
first_10 = vysledky[:10]

# spárování vlastností KSTRANA a barva
color_map = {item['KSTRANA']: item['color'] for item in first_10}

# aktualizace souboru přidáním barev podle shody vlastnosti KSTRANA
for key, party in parties.items():
    kstrana = party.get('KSTRANA')
    if kstrana in color_map:
        party['color'] = color_map[kstrana]

# uložení aktualizovaného souboru
with open(soubor, 'w', encoding='utf-8') as f:
    json.dump(parties, f, ensure_ascii=False, indent=2)

print("Barvy byly úspěšně překopírovány!")