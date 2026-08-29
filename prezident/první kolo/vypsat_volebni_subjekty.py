import pandas as pd
import argparse
import sys
import os

parser = argparse.ArgumentParser()
parser.add_argument('--volby', action="store", dest='volby', required=True)
parser.add_argument('--vypsat', action="store", dest='vypsat', required=False, default="základ")
parser.add_argument('--json', action="store", dest='json', required=False, default="ne")
argumenty = parser.parse_args()

volby = argumenty.volby
vypsat = argumenty.vypsat or "základ"
json = argumenty.json or "ne"

os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\..\\public\\volby\\{volby}\\první kolo")

match vypsat:
    case "základ":
        df = pd.read_csv('candidates.csv')
    case "základ+koalice":
        df = pd.read_csv('candidates2.csv')
    case "všechno":
        if os.path.exists("candidates-univerzal.csv"):
            df = pd.read_csv('candidates-univerzal.csv')
        else:
            sys.exit("Soubor candidates-univerzal.csv neexistuje.")
    case _:
        sys.exit("Neplatná možnost!")

if json == "ano":
    print(df.to_json(orient="records"))
else:
    print(df.to_string(index=False))