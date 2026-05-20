import argparse
import json
import pandas as pd

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument('--koalice', action="store", dest='koalice', required=True)
argumenty = parser.parse_args()
koalice = argumenty.koalice
koalice = koalice.split(",")

# odstranit z legendy mapy
soubor = open("vysledky_cr2.json", 'r', encoding='utf-8')
jsonsoubor = json.load(soubor)
nova_data = []

for element in jsonsoubor:
  for f in koalice:
      if element["CKAND"] != f:
        pass
      else:
          break
  else:
      nova_data.append(element)
    
# seřazení podle procent hlasů a zápis dat do souboru
seradit = sorted(
             nova_data,
             key=lambda x: x["proc_hlasu"],
             reverse=True
        )
with open('vysledky_cr2.json', 'w+', encoding='utf-8') as soubor:
    json.dump(seradit, soubor, ensure_ascii=False, indent=2)
    

# odstranit ze seznamu subjektů
data = pd.read_csv("candidates2.csv", delimiter=",", encoding='utf-8')
koalice = [int(numeric_string) for numeric_string in koalice]
data = data[~data["CKAND"].isin(koalice)]
data.to_csv("candidates2.csv", index=False, encoding='utf-8')

# odstranit ze statistik
statistika = pd.read_csv("statistics2.csv", delimiter=",", encoding='utf-8')
koalice = argumenty.koalice
koalice = koalice.split(",")
for f in koalice:
    statistika.pop(f)
statistika.to_csv("statistics2.csv", index=False)
