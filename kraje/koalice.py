import argparse
import numpy as np
import pandas as pd
import shutil
import json
import os
import sys

# zpracování argumentů a ověřování vstupů
parser = argparse.ArgumentParser()
parser.add_argument('--koalice', action="store", dest='koalice', required=True)
parser.add_argument('--nazevkoalice', action="store", dest='nazevkoalice', required=True)
parser.add_argument('--zkratka', action="store", dest='zkratka', required=True)
argumenty = parser.parse_args()
koalice = argumenty.koalice
nazevkoalice = argumenty.nazevkoalice
zkratka = argumenty.zkratka
if koalice == "":
    sys.exit("Musíte zadat čísla koaličních subjektů oddělená čárkou.")
if nazevkoalice == "":
    sys.exit("Musíte zadat, jak se koalice bude jmenovat.")
if zkratka == "":
    sys.exit("Z důvodu struktury datových sad je potřeba zadat zkratku názvu koalice.")

koalice = koalice.split(",")

if os.path.exists("statistics2.csv"):
    data = pd.read_csv("statistics2.csv", delimiter=",", encoding='utf-8')
else:
    data = pd.read_csv("statistics.csv", delimiter=",", encoding='utf-8')
vol_seznam = data.pop("VOL_SEZNAM")
pl_hl_celk = data.pop("PL_HL_CELK")

if not os.path.exists("vysledky_cr2.json"):
    shutil.copy("vysledky_cr.json", "vysledky_cr2.json")

#kontrola, zda koalice s těmito subjekty již neexistuje
puvodnisoubor = open("parties.json", 'r', encoding='utf-8')
puvodnivysledky = json.load(puvodnisoubor)
file_data = json.load(open("vysledky_cr2.json", 'r', encoding='utf-8'))
for g in koalice:
  for element in file_data:
      if element["KSTRANA"] == g:
        break
  else:
          sys.exit(f"Koalice s tímto subjektem již existuje: {puvodnivysledky[g]['ZKRATKAK30']}")

data[int(data.iloc[:,-1:].columns[0]) + 1] = data[koalice].sum(axis=1)
data.insert(len(data.columns), vol_seznam.name, vol_seznam)
data.insert(len(data.columns), pl_hl_celk.name, pl_hl_celk)

# uložení do nového souboru
data.to_csv("statistics2.csv", index=False)

# upravení seznamu subjektů (přidání koalice do seznamu a vytvoření samostatného souboru)
if not os.path.exists("parties2.csv"):
    shutil.copyfile("parties.csv", "parties2.csv")
strany = pd.read_csv("parties2.csv", delimiter=",", encoding='utf-8')
kstrana_vstrana = int(strany["KSTRANA"].iloc[-1] + 1)
a = pd.DataFrame([[kstrana_vstrana, str(kstrana_vstrana) + "-" + "koala", nazevkoalice, zkratka]],
                       columns=['KSTRANA', 'VSTRANA', 'ZKRATKAK30', 'ZKRATKAK8'])
a.to_csv('parties2.csv', mode='a', index=False, header=False, encoding='utf-8')
if not os.path.exists("parties-univerzal.csv"):
    shutil.copyfile("parties.csv", "parties-univerzal.csv")
strany = pd.read_csv("parties-univerzal.csv", delimiter=",", encoding='utf-8')
kstrana_vstrana2 = int(strany["KSTRANA"].iloc[-1] + 1)
a = pd.DataFrame([[kstrana_vstrana2, str(kstrana_vstrana2) + "-" + "koala", nazevkoalice, zkratka]],
                       columns=['KSTRANA', 'VSTRANA', 'ZKRATKAK30', 'ZKRATKAK8'])
a.to_csv('parties-univerzal.csv', mode='a', index=False, header=False, encoding='utf-8')

# příprava dat pro zápis
    
data2 = pd.read_csv("statistics2.csv", delimiter=",", encoding='utf-8')
hlasy_pro_subjekt_celkem = int(data2[str(kstrana_vstrana)].sum(axis=0))
platne_hlasy_celkem = int(data2["PL_HL_CELK"].sum(axis=0))

# přidání koalice do souboru sloužícího pro legendu mapy a aktualizace pořadí
def write_json(new_data, filename='vysledky_cr2.json', koalice=koalice):
    with open(filename, 'r', encoding='utf-8') as file:
        # načtení souboru
        file_data = json.load(file)
        
        # přidání koalice ke stávajícím datům
        file_data.append(new_data)
    with open('vysledky_cr2.json', 'w+', encoding='utf-8') as soubor:
        json.dump(file_data, soubor, ensure_ascii=False, indent=2)
        print("ok")

# data, která se mají zapsat
novadata = {
    "strana": zkratka,
    "proc_hlasu": (hlasy_pro_subjekt_celkem/platne_hlasy_celkem)*100,
    "KSTRANA": str(kstrana_vstrana),
    "color": ""
}

# volání funkce pro zápis dat
write_json(novadata)

if os.path.exists("statistics-univerzal.csv"):
    universal = pd.read_csv("statistics-univerzal.csv")
    vol_seznam_universal = universal.pop("VOL_SEZNAM")
    pl_hl_celk_universal = universal.pop("PL_HL_CELK")
    universal[int(universal.iloc[:,-1:].columns[0]) + 1] = universal[koalice].sum(axis=1)
    universal.insert(len(universal.columns), vol_seznam_universal.name, vol_seznam_universal)
    universal.insert(len(universal.columns), pl_hl_celk_universal.name, pl_hl_celk_universal)
    universal.to_csv("statistics-univerzal.csv", index=False)
else:
    data.to_csv("statistics-univerzal.csv", index=False)
