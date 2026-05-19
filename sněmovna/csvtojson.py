import csv
import sys
import json
import argparse

sys.stdout.reconfigure(encoding='utf-8')

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument('--koalice', action="store", dest='koalice', default="ne")
argumenty = parser.parse_args()
koalice = argumenty.koalice
soubor = ""
souborjson = ""
if koalice == "ne":
  soubor = "parties.csv"
  souborjson = "parties.json"
elif koalice == "ano":
  soubor = "parties2.csv"
  souborjson = "parties2.json"
elif koalice == "univerzal":
  soubor = "parties-univerzal.csv"
  souborjson = "parties-univerzal.json"

# Otevření souboru v režimu pro čtení
with open(soubor, 'r', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    parties = {}
    
    for row in reader:
        kstrana = row['KSTRANA']
        parties[kstrana] = {
            'KSTRANA': row['KSTRANA'],
            'VSTRANA': row['VSTRANA'],
            'ZKRATKAK30': row['ZKRATKAK30'],
            'ZKRATKAK8': row['ZKRATKAK8']
        }

# Aktualizace souboru
with open(souborjson, 'w', encoding='utf-8') as jsonfile:
    json.dump(parties, jsonfile, ensure_ascii=False, indent=2)

print("Soubor " + souborjson +  " byl úspěšně vytvořen.")