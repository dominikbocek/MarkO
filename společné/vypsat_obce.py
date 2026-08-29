import pandas as pd
import argparse
import sys
import os

parser = argparse.ArgumentParser()
parser.add_argument('--json', action="store", dest='json', required=False, default="ne")
parser.add_argument('--kodobec', action="store", dest="kodobec", required=False, type=int, default=0)
argumenty = parser.parse_args()
json = argumenty.json or "ne"
kodobec = argumenty.kodobec

df = pd.read_csv(f"{os.path.dirname(os.path.realpath(__file__))}\\kvcoco.csv", delimiter=";", encoding="cp1250")

seznam_obci = df[pd.isna(df["NADRZASTUP"]) | (df["NADRZASTUP"] == df["KODZASTUP"])]
seznam_obci = seznam_obci[["NAZEVZAST", "KODZASTUP", "NADRZASTUP"]]
seznam_obci.drop_duplicates(inplace=True)

if kodobec == 0:
    vystup = seznam_obci
else:
    vystup = seznam_obci[seznam_obci["KODZASTUP"] == kodobec]

if json == "ano":
    print(vystup.to_json(orient='records', lines=True))
else:
    print(vystup.to_string(index=False))