import argparse
import numpy as np
import pandas as pd
import shutil
import json
import csv
import os
import sys

# zpracování argumentů a ověřování vstupů
parser = argparse.ArgumentParser()
parser.add_argument('--volby', action="store", dest="volby", required=True)
parser.add_argument('--obec', action="store", dest="obec", required=True)
parser.add_argument('--koalice', action="store", dest='koalice', required=True)
parser.add_argument('--nazevkoalice', action="store", dest='nazevkoalice', required=True)
parser.add_argument('--zkratka', action="store", dest='zkratka', required=True)
argumenty = parser.parse_args()
volby = argumenty.volby
obec = int(argumenty.obec)
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

if not os.path.exists(f"{seznam_stran}-univerzal.csv"):
    shutil.copyfile(f"{seznam_stran}.csv", f"{seznam_stran}-univerzal.csv")

data = pd.read_csv(f"{statistiky}-univerzal.csv", delimiter=",", encoding='utf-8')

pocet_stran = data["POCET_VS"].loc[0].tolist()
if pocet_stran < 3:
    sys.exit("Počet volebních subjektů je menší než 3. Vytvoření koalice nedává smysl.")

strany = pd.read_csv(f"{seznam_stran}-univerzal.csv", delimiter=",", encoding='utf-8')
kstrana_vstrana = int(strany["POR_STR_HL"].iloc[-1] + 1)
a = pd.DataFrame([[kstrana_vstrana, nazevkoalice, zkratka, str(kstrana_vstrana) + "-" + "koala", str(kstrana_vstrana) + "-" + "koala"]],
                       columns=['POR_STR_HL', 'ZKRATKAO30', 'ZKRATKAO8', 'OSTRANA', 'VSTRANA'])
a.to_csv(f"{seznam_stran}-univerzal.csv", mode='a', index=False, header=False, encoding='utf-8')


universal = pd.read_csv(f"{statistiky}-univerzal.csv")
universal["POCET_VS"] = universal['POCET_VS'] + 1
universal.insert(pocet_stran + 1, pocet_stran + 1, universal[koalice].sum(axis=1))
universal.to_csv(f"{statistiky}-univerzal.csv", index=False)
    
print(kstrana_vstrana)