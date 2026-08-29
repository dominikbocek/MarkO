import os
import sys
import json
import argparse

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument('--koalice', action="store", dest='koalice', default="ne")
parser.add_argument('--obec', action="store", dest='obec', required=True)
parser.add_argument('--volby', action="store", dest='volby', required=True)
argumenty = parser.parse_args()
koalice = argumenty.koalice
volby = argumenty.volby
obec = int(argumenty.obec)

# jde o místní obvod?
with open(f"{os.path.dirname(os.path.realpath(__file__))}\\obvody.py") as obvody:
    code = obvody.read()
exec(code)

if statut != 0:
    cesta = f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}\\obce\\{statut}\\{obec}"
else:
    cesta = f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}\\obce\\{obec}"

soubor = ""
vysledky = ""
match koalice:
    case "ne":
        soubor = f"{cesta}\\parties-{obec}.json"
        vysledky = f"{cesta}\\vysledky_cr_{obec}.json"
    case "ano":
        soubor = f"{cesta}\\parties-{obec}-2.json"
        vysledky = f"{cesta}\\vysledky_cr_{obec}_2.json"
    case _:
        sys.exit("Neplatná možnost!")

# načtení obou souborů JSON
with open(vysledky, 'r', encoding='utf-8') as f:
    vysledky = json.load(f)

with open(soubor, 'r', encoding='utf-8') as f:
    parties = json.load(f)

# seznam prvních deseti položek ze souboru vysledky_cr.json
first_10 = vysledky[:10]

# spárování vlastností POR_STR_HL a barva
color_map = {item['POR_STR_HL']: item['color'] for item in first_10}

# aktualizace souboru přidáním barev podle shody vlastnosti POR_STR_HL
for key, party in parties.items():
    POR_STR_HL = party.get('POR_STR_HL')
    if POR_STR_HL in color_map:
        party['color'] = color_map[POR_STR_HL]

# uložení aktualizovaného souboru
with open(soubor, 'w', encoding='utf-8') as f:
    json.dump(parties, f, ensure_ascii=False, indent=2)

print("Barvy byly úspěšně překopírovány!")
