import pandas as pd
import argparse
import sys
import os

parser = argparse.ArgumentParser()
parser.add_argument('--volby', action="store", dest='volby', required=True)
parser.add_argument('--json', action="store", dest='json', required=False, default="ne")
argumenty = parser.parse_args()

volby = argumenty.volby
json = argumenty.json or "ne"

os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\..\\public\\volby\\{volby}\\druhé kolo")

df = pd.read_csv('candidates.csv')

if json == "ano":
    print(df.to_json(orient="records"))
else:
    print(df.to_string(index=False))