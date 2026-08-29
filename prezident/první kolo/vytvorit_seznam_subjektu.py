import argparse
import pandas as pd
import shutil
import os

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument('--volby', action="store", dest='volby', required=True)
argumenty = parser.parse_args()
volby = argumenty.volby

f=pd.read_csv(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\..\\sada\\{volby}\\perk.csv", delimiter=";", encoding="cp1250")
f = f[f["PLATNOST"] == "A"]
f["CKAND"] = range(1, len(f.index) + 1)
keep_col = ['CKAND','JMENO','PRIJMENI']
new_f = f[keep_col]

os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\..\\public\\volby\\{volby}\\první kolo")
new_f.to_csv("candidates.csv", index=False)
if not os.path.exists("candidates-univerzal.csv"):
    shutil.copyfile("candidates.csv", "candidates2.csv")
    shutil.copyfile("candidates.csv", "candidates-univerzal.csv")