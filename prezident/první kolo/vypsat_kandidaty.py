import pandas as pd
import argparse
import sys
import os

parser = argparse.ArgumentParser()
parser.add_argument('--vypsat', action="store", dest='vypsat', required=False, default="základ")
parser.add_argument('--json', action="store", dest='json', required=False, default="ne")
argumenty = parser.parse_args()
vypsat = argumenty.vypsat or "základ"
json = argumenty.json or "ne"

if vypsat == "základ":
    df = pd.read_csv('candidates.csv')
if vypsat == "základ+koalice":
    df = pd.read_csv('candidates2.csv')
elif vypsat == "všechno":
    if os.path.exists("candidates-univerzal.csv"):
      df = pd.read_csv('candidates-univerzal.csv')
    else:
      sys.exit("Soubor candidates-univerzal.csv neexistuje.")
else:
    sys.exit()

if json == "ano":
    print(df.to_json(orient="records"))
else:
    print(df.to_string(index=False))