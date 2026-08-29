import os
import sys
import csv
import json
import argparse

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument('--volby', action="store", dest='volby', required=True)
parser.add_argument('--koalice', action="store", dest='koalice', default="ne")
argumenty = parser.parse_args()
volby = argumenty.volby
koalice = argumenty.koalice

soubor = ""
souborjson = ""

os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\..\\public\\volby\\{volby}\\první kolo")

match koalice:
  case "ne":
    soubor = "candidates.csv"
    souborjson = "candidates.json"
  case "ano":
    soubor = "candidates2.csv"
    souborjson = "candidates2.json"
  case "univerzal":
    soubor = "candidates-univerzal.csv"
    souborjson = "candidates-univerzal.json"
  case _:
      sys.exit("Neplatná možnost!")

# Otevření souboru v režimu pro čtení
with open(soubor, 'r', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    parties = {}
    
    for row in reader:
        ckand = row['CKAND']
        parties[ckand] = {
            'CKAND': row['CKAND'],
            'JMENO': row['JMENO'],
            'PRIJMENI': row['PRIJMENI']
        }

# Aktualizace souboru
with open(souborjson, 'w', encoding='utf-8') as jsonfile:
    json.dump(parties, jsonfile, ensure_ascii=False, indent=2)

print("Soubor " + souborjson +  " byl úspěšně vytvořen.")