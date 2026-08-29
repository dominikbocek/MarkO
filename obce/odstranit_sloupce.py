import pandas as pd
import argparse
import shutil
import os

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument('--obec', action="store", dest='obec', required=True)
parser.add_argument('--volby', action="store", dest='volby', required=True)
argumenty = parser.parse_args()
obec = int(argumenty.obec)
volby = argumenty.volby

# jde o místní obvod?
with open(f"{os.path.dirname(os.path.realpath(__file__))}\\obvody.py") as obvody:
    code = obvody.read()
exec(code)

# parties
parties = pd.read_csv(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\sada\\{volby}\\kvros.csv", delimiter=";", encoding="cp1250")
obec_info = parties.drop(parties[parties["KODZASTUP"] != obec].index)
obec_info = obec_info[["POR_STR_HL", "ZKRATKAO30", "ZKRATKAO8", "OSTRANA", "VSTRANA"]]

if statut != 0:
    cesta = f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}\\obce\\{statut}\\{obec}"
else:
    cesta = f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}\\obce\\{obec}"

obec_info.to_csv(f"{cesta}\\parties-{obec}.csv", index=False)
if not os.path.exists(f"{cesta}\\parties-{obec}-univerzal.csv"):
    shutil.copyfile(f"{cesta}\\parties-{obec}.csv", f"{cesta}\\parties-{obec}-2.csv")
    shutil.copyfile(f"{cesta}\\parties-{obec}.csv", f"{cesta}\\parties-{obec}-univerzal.csv")