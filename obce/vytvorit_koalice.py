import pandas as pd
import argparse
import shutil
import obvody
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

for argument in argumenty.__dict__:
    if argumenty.__dict__[argument] == "":
        sys.exit(f"Argument {argument} nesmí být prázdný!")

obec = int(argumenty.obec)
koalice = argumenty.koalice
nazevkoalice = argumenty.nazevkoalice
zkratka = argumenty.zkratka
volby = argumenty.volby

koalice = koalice.split(",")

# jde o místní obvod?
infokod = obvody.infokod(volby, obec)

if infokod.statut != 0:
    os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}/../public/volby/{volby}/obce/{infokod.statut}/{obec}")
else:
    os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}/../public/volby/{volby}/obce/{obec}")

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
if os.path.exists(f"{seznam_stran}-2.csv"):

    puvodnisoubor = pd.read_csv(f"{seznam_stran}.csv", encoding='utf-8')
    k_porovnani = pd.read_csv(f"{seznam_stran}-2.csv", encoding='utf-8')

    for g in puvodnisoubor["OSTRANA"].astype(str).to_list():
        if not g in k_porovnani["OSTRANA"].astype(str).to_list():            
            sys.exit(f"{puvodnisoubor[puvodnisoubor["VSTRANA"] == int(g)]["ZKRATKAO30"].to_string(index=False)}")

######################################
# vytvoření nového souboru statistik #
######################################

data.insert(pocet_stran + 1, pocet_stran + 1, data[koalice].sum(axis=1))

data['POCET_VS'] = data['POCET_VS'] + 1
# odstranění ze statistik
cislastran=[int(cislo) for cislo in range(1,data["POCET_VS"].loc[0].tolist() + 1)]
for clen in koalice:
    cislastran.remove(int(clen))
data["POCET_VS"] = data["POCET_VS"] - len(koalice)
for f in koalice:
    data.pop(f) # odstranění členů koalice
for strana in range(len(cislastran)):
    data = data.rename(columns={cislastran[strana]: str(strana + 1)}) # přejmenování sloupců, aby bylo správné číslování

# uložení do nového souboru
data.to_csv(f"{statistiky}-2.csv", index=False)

if os.path.exists(f"{statistiky}-univerzal.csv"):
    universal = pd.read_csv(f"{statistiky}-univerzal.csv")
    universal["POCET_VS"] = universal['POCET_VS'] + 1
    universal[pocet_stran + 1] = universal[koalice].sum(axis=1)
    universal.to_csv(f"{statistiky}-univerzal.csv", index=False)
else:
    data.to_csv(f"{statistiky}-univerzal.csv", index=False)

###########################################################################################
# upravení seznamu subjektů (přidání koalice do seznamu a vytvoření samostatného souboru) #
###########################################################################################

if not os.path.exists(f"{seznam_stran}-2.csv"):
    shutil.copyfile(f"{seznam_stran}.csv", f"{seznam_stran}-2.csv")

if not os.path.exists(f"{seznam_stran}-univerzal.csv"):
    shutil.copyfile(f"{seznam_stran}.csv", f"{seznam_stran}-univerzal.csv")

# seznam subjektů s koalicemi (bez jejich samostatných členů)
strany = pd.read_csv(f"{seznam_stran}-2.csv", delimiter=",", encoding='utf-8')
kstrana_vstrana = len(strany.index) - len(koalice) + 1 # počet stran minus počet koaličních stran plus 1

a = pd.DataFrame([[kstrana_vstrana, nazevkoalice, zkratka, str(kstrana_vstrana) + "-" + "koala", str(kstrana_vstrana) + "-" + "koala"]], columns=['POR_STR_HL', 'ZKRATKAO30', 'ZKRATKAO8', 'OSTRANA', 'VSTRANA'])

# odstranění ze seznamu subjektů
koalice = [int(numeric_string) for numeric_string in koalice]
strany = pd.concat([strany, a])
strany = strany[~strany["POR_STR_HL"].isin(koalice)]
strany.to_csv(f'{seznam_stran}-2.csv', index=False, encoding='utf-8')

# seznam všech subjektů
strany = pd.read_csv(f"{seznam_stran}-univerzal.csv", delimiter=",", encoding='utf-8')
kstrana_vstrana2 = int(strany["POR_STR_HL"].iloc[-1] + 1)

a = pd.DataFrame([[kstrana_vstrana2, nazevkoalice, zkratka, str(kstrana_vstrana2) + "-" + "koala", str(kstrana_vstrana2) + "-" + "koala"]], columns=['POR_STR_HL', 'ZKRATKAO30', 'ZKRATKAO8', 'OSTRANA', 'VSTRANA'])
a.to_csv(f'{seznam_stran}-univerzal.csv', mode='a', index=False, header=False, encoding='utf-8')

###############################################################################
# přidání koalice do souboru sloužícího pro legendu mapy a aktualizace pořadí #
###############################################################################

def write_json(new_data, filename=f'{vysledky}_2.json', koalice=koalice):
    with open(filename, 'r', encoding='utf-8') as file:
        # načtení souboru
        file_data = json.load(file)
        
        # přidání koalice ke stávajícím datům
        file_data.append(new_data)

        # Odstranění z legendy
        nova_data = []

        for element in file_data:
            for f in koalice:
                if element["POR_STR_HL"] != str(f):
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

    with open(f'{vysledky}_2.json', 'w+', encoding='utf-8') as soubor:
        json.dump(seradit, soubor, ensure_ascii=False, indent=2)
        print("ok")

# příprava dat pro zápis

hlasy_pro_subjekt_celkem = int(data[str(kstrana_vstrana)].sum(axis=0))
platne_hlasy_celkem = int(data["PL_HL_CELK"].sum(axis=0))

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