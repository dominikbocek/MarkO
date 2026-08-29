import argparse
import pandas as pd
import shutil
import json
import sys
import os

# zpracování argumentů a ověřování vstupů
parser = argparse.ArgumentParser()
parser.add_argument('--volby', action="store", dest='volby', required=True)
parser.add_argument('--koalice', action="store", dest='koalice', required=True)
parser.add_argument('--nazevkoalice', action="store", dest='nazevkoalice', required=True)
parser.add_argument('--zkratka', action="store", dest='zkratka', required=True)
parser.add_argument('--zpracovani', action="store", dest='zpracovani', required=True)
argumenty = parser.parse_args()

for argument in argumenty.__dict__:
    if argumenty.__dict__[argument] == "":
        sys.exit(f"Argument {argument} nesmí být prázdný!")

volby = argumenty.volby
koalice = argumenty.koalice
nazevkoalice = argumenty.nazevkoalice
zkratka = argumenty.zkratka
zpracovani = argumenty.zpracovani

koalice = koalice.split(",")

match zpracovani:
    case "obce":
        statistiky = "statistics-obce.csv"
    case "okrsky":
        statistiky = "statistics.csv"
    case _:
        sys.exit("Neplatná možnost!")

statistiky_koalice = "statistics2.csv"
statistiky_vsechno = "statistics-univerzal.csv"

seznam_subjektu = "parties.csv"
seznam_subjektu_koalice = "parties2.csv"
seznam_subjektu_vsechno = "parties-univerzal.csv"

os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}")

if os.path.exists(statistiky_koalice):
    data = pd.read_csv(statistiky_koalice, delimiter=",", encoding='utf-8')
else:
    data = pd.read_csv(statistiky, delimiter=",", encoding='utf-8')

if not os.path.exists("vysledky_cr2.json"):
    shutil.copy("vysledky_cr.json", "vysledky_cr2.json")

#kontrola, zda není zadaná koalice mimo rozsah seznamu
puvodnisoubor = open("parties.json", 'r', encoding='utf-8')
puvodnivysledky = json.load(puvodnisoubor)
file_data = json.load(open("vysledky_cr2.json", 'r', encoding='utf-8'))
for g in koalice:
    for element in file_data:
        if element["KSTRANA"] == g:
            break
    else:
        sys.exit(f"Mimo rozsah!")

POCET_VS = int(data["POCET_VS"].to_list()[0])

data[POCET_VS + 1] = data[koalice].sum(axis=1)

data["POCET_VS"] = POCET_VS - len(koalice) + 1

# uložení do nového souboru
data.to_csv(statistiky_koalice, index=False)

# upravení seznamu subjektů (přidání koalice do seznamu a vytvoření samostatného souboru)
if not os.path.exists(seznam_subjektu_koalice):
    shutil.copyfile(seznam_subjektu, seznam_subjektu_koalice)
strany = pd.read_csv(seznam_subjektu_koalice, delimiter=",", encoding='utf-8')
kstrana_vstrana = int(POCET_VS + 1)
a = pd.DataFrame([[kstrana_vstrana, str(kstrana_vstrana) + "-" + "koala", nazevkoalice, zkratka]],
                       columns=['KSTRANA', 'VSTRANA', 'ZKRATKAK30', 'ZKRATKAK8'])
a.to_csv(seznam_subjektu_koalice, mode='a', index=False, header=False, encoding='utf-8')
if not os.path.exists(seznam_subjektu_vsechno):
    shutil.copyfile(seznam_subjektu, seznam_subjektu_vsechno)
strany = pd.read_csv(seznam_subjektu_vsechno, delimiter=",", encoding='utf-8')
kstrana_vstrana2 = len(strany) + 1
a = pd.DataFrame([[kstrana_vstrana2, str(kstrana_vstrana2) + "-" + "koala", nazevkoalice, zkratka]],
                       columns=['KSTRANA', 'VSTRANA', 'ZKRATKAK30', 'ZKRATKAK8'])
a.to_csv(seznam_subjektu_vsechno, mode='a', index=False, header=False, encoding='utf-8')

# příprava dat pro zápis
    
data2 = pd.read_csv(statistiky_koalice, delimiter=",", encoding='utf-8')
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
    "strana": nazevkoalice,
    "zkratka": zkratka,
    "proc_hlasu": (hlasy_pro_subjekt_celkem/platne_hlasy_celkem)*100,
    "KSTRANA": str(kstrana_vstrana),
    "color": ""
}

# volání funkce pro zápis dat
write_json(novadata)

if os.path.exists(statistiky_vsechno):
    universal = pd.read_csv(statistiky_vsechno)
    id_universal = universal.pop('id')
    vol_seznam_universal = universal.pop("VOL_SEZNAM")
    pl_hl_celk_universal = universal.pop("PL_HL_CELK")
    pocet_vs_universal = universal.pop("POCET_VS")
    universal[len(universal.columns) + 1] = data[koalice].sum(axis=1) # přebírání součtu shora
    universal.insert(0, id_universal.name, id_universal)
    universal.insert(len(universal.columns), vol_seznam_universal.name, vol_seznam_universal)
    universal.insert(len(universal.columns), pl_hl_celk_universal.name, pl_hl_celk_universal)
    universal.insert(len(universal.columns), pocet_vs_universal.name, pocet_vs_universal)
    universal["POCET_VS"] = universal["POCET_VS"] + 1
    universal.to_csv(statistiky_vsechno, index=False)
else:
    data.to_csv(statistiky_vsechno, index=False)

# pozn přečíslování v transform.py a transform obce.py