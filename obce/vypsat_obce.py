import pandas as pd
import argparse
import sys
import os

parser = argparse.ArgumentParser()
parser.add_argument('--vyhledat', action="store", dest='vyhledat', required=True)
parser.add_argument('--hledanahodnota', action="store", dest='hodnota', required=True)
parser.add_argument('--json', action="store", dest='json', required=False, default="ne")
argumenty = parser.parse_args()
vyhledat = argumenty.vyhledat
hodnota = argumenty.hodnota
json = argumenty.json or "ne"

if vyhledat == "obec":
    hodnota = int(hodnota)
elif vyhledat == "kód":
    hodnota = str(hodnota)
elif vyhledat != "":
    sys.exit(f"Neplatná možnost: {vyhledat}")

df = pd.read_csv(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\společné\\coco.csv", delimiter=";", encoding="cp1250")

seznam_obci = df[["OBEC", "NAZEVOBCE"]]
seznam_obci.drop_duplicates(inplace=True)
if vyhledat == "kód":
    vystup = seznam_obci[seznam_obci["NAZEVOBCE"] == hodnota]
elif vyhledat == "obec":
    vystup = seznam_obci[seznam_obci["OBEC"] == hodnota]
else:
    vystup = seznam_obci

if json == "ano":
    print(vystup.to_json(orient='records', lines=True))
else:
    print(vystup.to_string(index=False))

    # vlastnost obvody musí být 1 nebo 0