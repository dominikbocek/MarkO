import csv
import json
import pandas as pd

soubor = "parties.csv"
statistiky = "statistics.csv"
souborjson = "vysledky_cr.json"

data = pd.read_csv("statistics.csv", delimiter=",", encoding='utf-8')
platne_hlasy_celkem = int(data["PL_HL_CELK"].sum(axis=0))

# Otevření souboru v režimu pro čtení
csvfile = open(soubor, 'r', encoding='utf-8')
reader = csv.DictReader(csvfile)
parties_dict = {}

for row in reader:
    if row["KSTRANA"] in data.columns:
        kstrana = row["KSTRANA"]

        # uloží se jen jednou (případně přepíše duplicitní)
        parties_dict[kstrana] = {
            "strana": row["ZKRATKAK30"],
            "proc_hlasu": (int(data[kstrana].sum(axis=0)) / platne_hlasy_celkem) * 100,
            "KSTRANA": kstrana,
        }

# převedení zpět na list
parties = list(parties_dict.values())

# Seřazení od největšího po nejmenší
vysledky_sorted = sorted(
    parties,
    key=lambda x: x["proc_hlasu"],
    reverse=True
)

# Aktualizace souboru
with open(souborjson, 'w', encoding='utf-8') as jsonfile:
    json.dump(vysledky_sorted, jsonfile, ensure_ascii=False, indent=2)

print("Soubor " + souborjson +  " byl úspěšně vytvořen.")