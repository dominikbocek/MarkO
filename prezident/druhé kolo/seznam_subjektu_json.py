import os
import csv
import json
import argparse

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument('--volby', action="store", dest='volby', required=True)
argumenty = parser.parse_args()
volby = argumenty.volby

os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\..\\public\\volby\\{volby}\\druhé kolo")

# načtení csv souboru
with open("candidates.csv", 'r', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    kandidati = {}
    
    for row in reader:
        ckand = row['CKAND']
        kandidati[ckand] = {
            'CKAND': row['CKAND'],
            'JMENO': row['JMENO'],
            'PRIJMENI': row['PRIJMENI'],
        }

# zápis json souboru
with open('candidates.json', 'w', encoding='utf-8') as jsonfile:
    json.dump(kandidati, jsonfile, ensure_ascii=False, indent=2)

print("Soubor candidates.json byl úspěšně vytvořen.")