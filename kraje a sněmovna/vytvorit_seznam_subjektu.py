import os
import json
import argparse

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument('--volby', action="store", dest="volby", required=True)
parser.add_argument('--dosouboru', action="store", dest="dosouboru", default="True")
argumenty = parser.parse_args()
volby = argumenty.volby
dosouboru = argumenty.dosouboru

with open(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\sada\\{volby}\\info.json", encoding="utf-8") as soubor:
    info = json.load(soubor)
    if info["druh"] == "sněmovní":
        from seznam_subjektu import vytvorit_seznam_subjektu_sněmovna
        print(vytvorit_seznam_subjektu_sněmovna.seznam(volby, eval(dosouboru)))
    if info["druh"] == "krajské":
        from seznam_subjektu import vytvorit_seznam_subjektu_kraje
        print(vytvorit_seznam_subjektu_kraje.seznam(volby, eval(dosouboru)))