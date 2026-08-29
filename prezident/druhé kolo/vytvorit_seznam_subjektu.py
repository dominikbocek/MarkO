import os
import pandas as pd
import argparse

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument('--volby', action="store", dest='volby', required=True)
argumenty = parser.parse_args()
volby = argumenty.volby

f=pd.read_csv(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\..\\sada\\{volby}\\perk.csv", delimiter=";", encoding="cp1250")
f = f[f["ZVOLEN_K1"] == 2]
keep_col = ['CKAND','JMENO','PRIJMENI']
new_f = f[keep_col].reset_index()
new_f["CKAND"] = new_f.index + 1
new_f.pop("index")
new_f.to_csv(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\..\\public\\volby\\{volby}\\druhé kolo\\candidates.csv", index=False)