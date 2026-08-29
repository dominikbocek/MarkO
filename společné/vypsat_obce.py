import pandas as pd
import argparse
import sys
import os

parser = argparse.ArgumentParser()
parser.add_argument('--json', action="store", dest='json', required=False, default="ne")
argumenty = parser.parse_args()
json = argumenty.json or "ne"

df = pd.read_csv(f"{os.path.dirname(os.path.realpath(__file__))}\\kvcoco.csv", delimiter=";", encoding="cp1250")

seznam_obci = df[pd.isna(df["NADRZASTUP"]) | (df["NADRZASTUP"] == df["KODZASTUP"])]
seznam_obci = seznam_obci[["NAZEVZAST", "KODZASTUP", "NADRZASTUP"]]
seznam_obci.drop_duplicates(inplace=True)
vystup = seznam_obci

if json == "ano":
    print(vystup.to_json(orient='records', lines=True))
else:
    print(vystup.to_string(index=False))