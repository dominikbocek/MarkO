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

if not os.path.exists("candidates-univerzal.csv"):
    shutil.copyfile("candidates.csv", "candidates-univerzal.csv")
strany = pd.read_csv("candidates-univerzal.csv", delimiter=",", encoding='utf-8')
kstrana_vstrana = int(strany["CKAND"].iloc[-1] + 1)
a = pd.DataFrame([[kstrana_vstrana, nazevkoalice, zkratka]],
                       columns=['CKAND', 'JMENO', 'PRIJMENI'])
a.to_csv('candidates-univerzal.csv', mode='a', index=False, header=False, encoding='utf-8')

if os.path.exists("statistics-univerzal.csv"):
    universal = pd.read_csv("statistics-univerzal.csv")
    vol_seznam_universal = universal.pop("VOL_SEZNAM")
    pl_hl_celk_universal = universal.pop("PL_HL_CELK")
    universal[int(universal.iloc[:,-1:].columns[0]) + 1] = universal[koalice].sum(axis=1)
    universal.insert(len(universal.columns), vol_seznam_universal.name, vol_seznam_universal)
    universal.insert(len(universal.columns), pl_hl_celk_universal.name, pl_hl_celk_universal)
    universal.to_csv("statistics-univerzal.csv", index=False)
    
print(kstrana_vstrana)