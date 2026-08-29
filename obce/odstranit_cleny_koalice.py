import os
import json
import argparse
import pandas as pd

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument('--obec', action="store", dest='obec', required=True)
parser.add_argument('--koalice', action="store", dest='koalice', required=True)
parser.add_argument('--volby', action="store", dest='volby', required=True)
argumenty = parser.parse_args()
obec = int(argumenty.obec)
koalice = argumenty.koalice
volby = argumenty.volby
koalice = koalice.split(",")

# jde o místní obvod?
with open(f"{os.path.dirname(os.path.realpath(__file__))}\\obvody.py") as obvody:
    code = obvody.read()
exec(code)

if statut != 0:
    os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}\\obce\\{statut}\\{obec}")
else:
    os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}\\obce\\{obec}")
    

# odstranit ze seznamu subjektů
data = pd.read_csv(f"parties-{obec}-2.csv", delimiter=",", encoding='utf-8')
koalice = [int(numeric_string) for numeric_string in koalice]
data = data[~data["POR_STR_HL"].isin(koalice)]

# odstranit ze statistik
statistika = pd.read_csv(f"{obec}-2.csv", delimiter=",", encoding='utf-8')
koalice = argumenty.koalice
koalice = koalice.split(",")
cislastran=[int(cislo) for cislo in range(1,statistika["POCET_VS"].loc[0].tolist() + 1)]
for clen in koalice:
    cislastran.remove(int(clen))
print(cislastran)
statistika["POCET_VS"] = statistika["POCET_VS"] - len(koalice)
for f in koalice:
    statistika.pop(f) # odstranění členů koalice
for strana in range(len(cislastran)):
    statistika.rename(columns={str(cislastran[strana]): str(strana + 1)}, inplace=True) # přejmenování sloupců, aby bylo správné číslování

data['POR_STR_HL'] = range(1,statistika["POCET_VS"].loc[0].tolist() + 1)

# odstranit z legendy mapy
soubor = open(f"vysledky_cr_{obec}_2.json", 'r', encoding='utf-8')
jsonsoubor = json.load(soubor)
nova_data = []


for element in jsonsoubor:
  for f in koalice:
      if element["POR_STR_HL"] != f:
        pass
      else:
          break
  else:
      nova_data.append(element)
    
# seřazení podle ID a přiřazení nového
seradit = sorted(
             nova_data,
             key=lambda x: int(x["POR_STR_HL"]) # možná bude nutné změnit i u ostatních verzí
        )

for strana in range(len(cislastran)):
    seradit[strana]["POR_STR_HL"] = str(strana + 1)

# seřazení podle procent hlasů a zápis dat do souboru
seradit = sorted(
             seradit,
             key=lambda x: x["proc_hlasu"],
             reverse=True
        )

# Uložení
data.to_csv(f"parties-{obec}-2.csv", index=False, encoding='utf-8')
statistika.to_csv(f"{obec}-2.csv", index=False)
with open(f'vysledky_cr_{obec}_2.json', 'w+', encoding='utf-8') as soubor:
    json.dump(seradit, soubor, ensure_ascii=False, indent=2)