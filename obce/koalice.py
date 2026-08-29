import pandas as pd
import argparse
import shutil
import json
import sys
import os

# zpracování argumentů a ověřování vstupů
parser = argparse.ArgumentParser()
parser.add_argument('--obec', action="store", dest='obec', required=True)
parser.add_argument('--koalice', action="store", dest='koalice', required=True)
parser.add_argument('--nazevkoalice', action="store", dest='nazevkoalice', required=True)
parser.add_argument('--zkratka', action="store", dest='zkratka', required=True)
parser.add_argument('--volby', action="store", dest='volby', required=True)
argumenty = parser.parse_args()
obec = int(argumenty.obec)
koalice = argumenty.koalice
nazevkoalice = argumenty.nazevkoalice
zkratka = argumenty.zkratka
volby = argumenty.volby

if obec == "":
    sys.exit("Musíte zadat kód obce.")
if koalice == "":
    sys.exit("Musíte zadat čísla koaličních subjektů oddělená čárkou.")
if nazevkoalice == "":
    sys.exit("Musíte zadat, jak se koalice bude jmenovat.")
if zkratka == "":
    sys.exit("Z důvodu struktury datových sad je potřeba zadat zkratku názvu koalice.")

koalice = koalice.split(",")

# jde o místní obvod?
with open(f"{os.path.dirname(os.path.realpath(__file__))}\\obvody.py") as obvody:
    code = obvody.read()
exec(code)

if statut != 0:
    os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}\\obce\\{statut}\\{obec}")
else:
    os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}\\obce\\{obec}")

statistiky = f"{obec}"
vysledky = f"vysledky_cr_{obec}"
seznam_stran = f"parties-{obec}"

if os.path.exists(f"{statistiky}-2.csv"):
    data = pd.read_csv(f"{statistiky}-2.csv", delimiter=",", encoding='utf-8')
else:
    data = pd.read_csv(f"{statistiky}.csv", delimiter=",", encoding='utf-8')

pocet_stran = data["POCET_VS"].loc[0].tolist()
if pocet_stran < 3:
    sys.exit("Počet volebních subjektů je menší než 3. Vytvoření koalice nedává smysl.")

if not os.path.exists(f"{vysledky}_2.json"):
    shutil.copy(f"{vysledky}.json", f"{vysledky}_2.json")

#kontrola, zda koalice s těmito subjekty již neexistuje
puvodnisoubor = open(f"{seznam_stran}.json", 'r', encoding='utf-8')
puvodnivysledky = json.load(puvodnisoubor)
file_data = json.load(open(f"{vysledky}_2.json", 'r', encoding='utf-8'))
for g in koalice:
    for element in file_data:
        if element["OSTRANA"] == puvodnivysledky[g]["OSTRANA"]:
            break
    else:
        sys.exit(f"Koalice s tímto subjektem již existuje: {puvodnivysledky[g]['ZKRATKAO30']}")

data.insert(pocet_stran + 1, pocet_stran + 1, data[koalice].sum(axis=1))

data['POCET_VS'] = data['POCET_VS'] + 1
# uložení do nového souboru
data.to_csv(f"{statistiky}-2.csv", index=False)

# upravení seznamu subjektů (přidání koalice do seznamu a vytvoření samostatného souboru)
if not os.path.exists(f"{seznam_stran}-2.csv"):
    shutil.copyfile(f"{seznam_stran}.csv", f"{seznam_stran}-2.csv")

strany = pd.read_csv(f"{seznam_stran}-2.csv", delimiter=",", encoding='utf-8')
kstrana_vstrana = int(strany["POR_STR_HL"].iloc[-1] + 1)

a = pd.DataFrame([[kstrana_vstrana, nazevkoalice, zkratka, str(kstrana_vstrana) + "-" + "koala", str(kstrana_vstrana) + "-" + "koala"]],
                       columns=['POR_STR_HL', 'ZKRATKAO30', 'ZKRATKAO8', 'OSTRANA', 'VSTRANA'])
a.to_csv(f'{seznam_stran}-2.csv', mode='a', index=False, header=False, encoding='utf-8')

if not os.path.exists(f"{seznam_stran}-univerzal.csv"):
    shutil.copyfile(f"{seznam_stran}.csv", f"{seznam_stran}-univerzal.csv")

strany = pd.read_csv(f"{seznam_stran}-univerzal.csv", delimiter=",", encoding='utf-8')
kstrana_vstrana2 = int(strany["POR_STR_HL"].iloc[-1] + 1)

a = pd.DataFrame([[kstrana_vstrana2, nazevkoalice, zkratka, str(kstrana_vstrana2) + "-" + "koala", str(kstrana_vstrana2) + "-" + "koala"]],
                       columns=['POR_STR_HL', 'ZKRATKAO30', 'ZKRATKAO8', 'OSTRANA', 'VSTRANA'])
a.to_csv(f'{seznam_stran}-univerzal.csv', mode='a', index=False, header=False, encoding='utf-8')

# příprava dat pro zápis
    
data2 = pd.read_csv(f"{statistiky}-2.csv", delimiter=",", encoding='utf-8')
hlasy_pro_subjekt_celkem = int(data2[str(kstrana_vstrana)].sum(axis=0))
platne_hlasy_celkem = int(data2["PL_HL_CELK"].sum(axis=0))

# přidání koalice do souboru sloužícího pro legendu mapy a aktualizace pořadí
def write_json(new_data, filename=f'{vysledky}_2.json', koalice=koalice):
    with open(filename, 'r', encoding='utf-8') as file:
        # načtení souboru
        file_data = json.load(file)
        
        # přidání koalice ke stávajícím datům
        file_data.append(new_data)
    with open(f'{vysledky}_2.json', 'w+', encoding='utf-8') as soubor:
        json.dump(file_data, soubor, ensure_ascii=False, indent=2)
        print("ok")

# data, která se mají zapsat
novadata = {
    "strana": zkratka,
    "proc_hlasu": (hlasy_pro_subjekt_celkem/platne_hlasy_celkem)*100,
    "POR_STR_HL": str(pocet_stran + 1),
    "OSTRANA": str(kstrana_vstrana) + "-" + "koala",
    "VSTRANA": str(kstrana_vstrana) + "-" + "koala",
    "color": ""
}

# volání funkce pro zápis dat
write_json(novadata)

if os.path.exists(f"{statistiky}-univerzal.csv"):
    universal = pd.read_csv(f"{statistiky}-univerzal.csv")
    universal["POCET_VS"] = universal['POCET_VS'] + 1
    universal.insert(pocet_stran + 1, pocet_stran + 1, universal[koalice].sum(axis=1))
    universal.to_csv(f"{statistiky}-univerzal.csv", index=False)
else:
    data.to_csv(f"{statistiky}-univerzal.csv", index=False)