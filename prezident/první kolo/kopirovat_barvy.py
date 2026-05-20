import json
import argparse

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument('--koalice', action="store", dest='koalice', default="ne")
argumenty = parser.parse_args()
koalice = argumenty.koalice
soubor = ""
vysledky = ""
if koalice == "ne":
  soubor = "candidates.json"
  vysledky = "vysledky_cr.json"
elif koalice == "ano":
  soubor = "candidates2.json"
  vysledky = "vysledky_cr2.json"

# načtení obou souborů JSON
with open(vysledky, 'r', encoding='utf-8') as f:
    vysledky = json.load(f)

with open(soubor, 'r', encoding='utf-8') as f:
    parties = json.load(f)

# seznam prvních deseti položek ze souboru vysledky_cr.json
first_10 = vysledky[:10]

# spárování vlastností CKAND a barva
color_map = {item['CKAND']: item['color'] for item in first_10}

# aktualizace souboru přidáním barev podle shody vlastnosti CKAND
for key, party in parties.items():
    ckand = party.get('CKAND')
    if ckand in color_map:
        party['color'] = color_map[ckand]

# uložení aktualizovaného souboru
with open(soubor, 'w', encoding='utf-8') as f:
    json.dump(parties, f, ensure_ascii=False, indent=2)

print("Barvy byly úspěšně překopírovány!")
