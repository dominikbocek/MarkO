import os
import sys
import csv
import json
import pandas as pd
import argparse

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument('--volby', action="store", dest="volby", required=True)
parser.add_argument('--koalice', action="store", dest='koalice', default="ne")
argumenty = parser.parse_args()
volby = argumenty.volby
koalice = argumenty.koalice
soubor = ""
souborjson = ""

os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}")

match koalice:
  case "ne":
    soubor = "parties.csv"
    souborjson = "parties.json"
    statistiky = "statistics.csv"
  case "ano":
    soubor = "parties2.csv"
    souborjson = "parties2.json"
    statistiky = "statistics2.csv"
  case "univerzal":
    soubor = "parties-univerzal.csv"
    souborjson = "parties-univerzal.json"
    statistiky = "statistics-univerzal.csv"
  case _:
    sys.exit("Neplatná možnost!")

data = pd.read_csv(statistiky, delimiter=",", encoding='utf-8')
platne_hlasy_celkem = int(data["PL_HL_CELK"].sum(axis=0))
csvfile = open(soubor, 'r', encoding='utf-8')
reader = csv.DictReader(csvfile)
parties_dict = {}

for row in reader:
    if row["KSTRANA"] in data.columns:
        kstrana = row["KSTRANA"]

        # uloží se jen jednou (případně přepíše duplicitní)
        parties_dict[kstrana] = {
            "KSTRANA": row["KSTRANA"],
            "VSTRANA": row["VSTRANA"],
            "ZKRATKAK30": row["ZKRATKAK30"],
            "ZKRATKAK8": row["ZKRATKAK8"]
        }

vysledky_sorted = {
    k: parties_dict[k]
    for k in sorted(parties_dict, key=lambda x: int(x))
}

with open(souborjson, 'w', encoding='utf-8') as jsonfile:
    json.dump(vysledky_sorted, jsonfile, ensure_ascii=False, indent=2)

print("Soubor " + souborjson +  " byl úspěšně vytvořen.")