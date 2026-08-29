import os
import sys
import argparse
import numpy as np
import pandas as pd

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument('--volby', action="store", dest='volby', required=True)
parser.add_argument('--obec', action="store", dest='obec', required=True)
argumenty = parser.parse_args()
obec = int(argumenty.obec)
volby = argumenty.volby

# jde o místní obvod?
with open(f"{os.path.dirname(os.path.realpath(__file__))}\\obvody.py") as obvody:
    code = obvody.read()
exec(code)

if statut != 0 and jesamospravnyobvod:
    kousek = pd.read_csv(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}\\obce\\{statut}\\{obec}\\{statut}-statutární_zastupitelstvo.csv")
    if os.path.exists(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}\\obce\\{statut}\\{statut}.csv"):
        hlava = False
    else:
        hlava = True
    kousek.to_csv(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}\\obce\\{statut}\\{statut}.csv", mode='a', index=False, header=hlava)