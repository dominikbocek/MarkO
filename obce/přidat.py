import os
import obvody
import argparse
import pandas as pd

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument('--volby', action="store", dest='volby', required=True)
parser.add_argument('--obec', action="store", dest='obec', required=True)
argumenty = parser.parse_args()
obec = int(argumenty.obec)
volby = argumenty.volby

# jde o místní obvod?
infokod = obvody.infokod(volby, obec)

if infokod.statut != 0 and infokod.jesamospravnyobvod:
    kousek = pd.read_csv(f"{os.path.dirname(os.path.realpath(__file__))}/../public/volby/{volby}/obce/{infokod.statut}/{obec}/{infokod.statut}-statutární_zastupitelstvo.csv")
    if os.path.exists(f"{os.path.dirname(os.path.realpath(__file__))}/../public/volby/{volby}/obce/{infokod.statut}/{infokod.statut}.csv"):
        hlava = False
    else:
        hlava = True
    kousek.to_csv(f"{os.path.dirname(os.path.realpath(__file__))}/../public/volby/{volby}/obce/{infokod.statut}/{infokod.statut}.csv", mode='a', index=False, header=hlava)