import os
import sys
import json
import argparse

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument('--soubor', action="store", dest='soubor', required=True)
parser.add_argument('--kodobce', action="store", dest='kodobce', required=True)
argumenty = parser.parse_args()
soubor = argumenty.soubor
kodobce = argumenty.kodobce

if not os.path.exists(soubor):
    sys.exit("Soubor neexistuje.")

noveokrsky = ""

with open(soubor, "r", encoding="utf-8") as okrsky:
    for radek in okrsky:
        jsonradek = json.loads(radek)
        if jsonradek["id"].startswith(kodobce):
            noveokrsky += f"{radek}"
print(noveokrsky)