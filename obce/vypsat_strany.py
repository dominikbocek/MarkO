import pandas as pd
import argparse
import sys
import os

parser = argparse.ArgumentParser()
parser.add_argument('--vypsat', action="store", dest='vypsat', required=False, default="základ")
parser.add_argument('--json', action="store", dest='json', required=False, default="ne")
parser.add_argument('--volby', action="store", dest='volby', required=True)
parser.add_argument('--obec', action="store", dest='obec', required=True)
argumenty = parser.parse_args()
vypsat = argumenty.vypsat or "základ"
json = argumenty.json or "ne"
volby = argumenty.volby
obec = int(argumenty.obec)

# jde o místní obvod?
with open(f"{os.path.dirname(os.path.realpath(__file__))}\\obvody.py") as obvody:
    code = obvody.read()
exec(code)

if statut != 0:
    os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}\\obce\\{statut}\\{obec}")
else:
    os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}\\obce\\{obec}")

match vypsat:
    case "základ":
        df = pd.read_csv(f'parties-{obec}.csv')
    case "základ+koalice":
        df = pd.read_csv(f'parties-{obec}-2.csv')
    case "všechno":
        if os.path.exists(f"parties-{obec}-univerzal.csv"):
            df = pd.read_csv(f'parties-{obec}-univerzal.csv')
        else:
            sys.exit(f"Soubor parties-{obec}-univerzal.csv neexistuje.")
    case _:
        sys.exit()

if json == "ano":
    print(df.to_json(orient="records"))
else:
    print(df.to_string(index=False))