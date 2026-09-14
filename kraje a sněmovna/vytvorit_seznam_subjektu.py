import os
import json
import shutil
import pandas as pd
import argparse

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument('--volby', action="store", dest="volby", required=True)
argumenty = parser.parse_args()
volby = argumenty.volby

with open(f"{os.path.dirname(os.path.realpath(__file__))}\\sada\\{volby}\\info.json") as soubor:
    info = json.load(soubor)
    if info["druh"] == "sněmovní":
        from vytvorit_seznam_subjektu import vytvorit_seznam_subjektu_sněmovna
        vytvorit_seznam_subjektu_sněmovna.seznam(True)
    if info["druh"] == "krajské":
        from vytvorit_seznam_subjektu import vytvorit_seznam_subjektu_kraje
        vytvorit_seznam_subjektu_kraje.seznam(True)