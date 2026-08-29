import csv
import json

# Read CSV file
with open('candidates.csv', 'r', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    kandidati = {}
    
    for row in reader:
        ckand = row['CKAND']
        kandidati[ckand] = {
            'CKAND': row['CKAND'],
            'JMENO': row['JMENO'],
            'PRIJMENI': row['PRIJMENI'],
        }

# Write JSON file
with open('candidates.json', 'w', encoding='utf-8') as jsonfile:
    json.dump(kandidati, jsonfile, ensure_ascii=False, indent=2)

print("Převod dokončen! Soubor 'candidates.json' byl vytvořen.")
