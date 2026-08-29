import argparse
import pandas as pd
import shutil
import sys
import os

# zpracování argumentů a ověřování vstupů
parser = argparse.ArgumentParser()
parser.add_argument('--volby', action="store", dest="volby", required=True)
parser.add_argument('--koalice', action="store", dest='koalice', required=True)
parser.add_argument('--nazevkoalice', action="store", dest='nazevkoalice', required=True)
parser.add_argument('--zkratka', action="store", dest='zkratka', required=True)
argumenty = parser.parse_args()

for argument in argumenty.__dict__:
    if argumenty.__dict__[argument] == "":
        sys.exit(f"Argument {argument} nesmí být prázdný!")

volby = argumenty.volby
koalice = argumenty.koalice
nazevkoalice = argumenty.nazevkoalice
zkratka = argumenty.zkratka

os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}")

statistiky_vsechno = "statistics-univerzal.csv"
    
koalice = koalice.split(",")

if not os.path.exists("parties-univerzal.csv"):
    shutil.copyfile("parties.csv", "parties-univerzal.csv")
strany = pd.read_csv("parties-univerzal.csv", delimiter=",", encoding='utf-8')
kstrana_vstrana = int(len(strany) + 1)
a = pd.DataFrame([[kstrana_vstrana, str(kstrana_vstrana) + "-" + "koala", nazevkoalice, zkratka]],
                       columns=['KSTRANA', 'VSTRANA', 'ZKRATKAK30', 'ZKRATKAK8'])
a.to_csv('parties-univerzal.csv', mode='a', index=False, header=False, encoding='utf-8')

if os.path.exists(statistiky_vsechno):
    universal = pd.read_csv(statistiky_vsechno)
    id_universal = universal.pop('id')
    vol_seznam_universal = universal.pop("VOL_SEZNAM")
    pl_hl_celk_universal = universal.pop("PL_HL_CELK")
    pocet_vs_universal = universal.pop("POCET_VS")
    universal[len(universal.columns) + 1] = universal[koalice].sum(axis=1)
    universal.insert(0, id_universal.name, id_universal)
    universal.insert(len(universal.columns), vol_seznam_universal.name, vol_seznam_universal)
    universal.insert(len(universal.columns), pl_hl_celk_universal.name, pl_hl_celk_universal)
    universal.insert(len(universal.columns), pocet_vs_universal.name, pocet_vs_universal)
    universal["POCET_VS"] = universal["POCET_VS"] + 1
    universal.to_csv(statistiky_vsechno, index=False)
    
print(kstrana_vstrana)