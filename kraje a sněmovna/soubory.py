import os
import sys
import json
import argparse

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument('--volby', action="store", dest='volby', required=True)
argumenty = parser.parse_args()
volby = argumenty.volby

os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\sada\\{volby}")

with open("info.json", encoding="utf-8") as soubor:
    info = json.load(soubor)
    if info["druh"] == "sněmovní":
        print('("pscoco.csv" "psrkl.csv" "pst4.csv" "pst4p.csv")')
    if info["druh"] == "krajské":
        print('("kzcoco.csv" "kzrkl.csv" "kzt6.csv" "kzt6p.csv")')