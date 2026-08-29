import os
import sys
import json
import argparse

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument('--obec', action="store", dest='obec', required=True)
parser.add_argument('--volby', action="store", dest='volby', required=True)
argumenty = parser.parse_args()
obec = int(argumenty.obec)
volby = argumenty.volby

# jde o místní obvod?
with open(f"{os.path.dirname(os.path.realpath(__file__))}\\obvody.py") as obvody:
    code = obvody.read()
exec(code)

if statut != 0 and jesamospravnyobvod:
    os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}\\obce\\{statut}\\{obec}")
elif statut == 0:
    os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}\\obce\\{obec}")
else:
    sys.exit()

with open("volebni_okrsky.ndjson", "r") as okrsky:
    for radek in okrsky:
        jsonradek = json.loads(radek)
        if str(int(jsonradek["properties"]["CISLO"])) != jsonradek["properties"]["CISLO"]:
            jsonradek["properties"]["CISLO"] = str(int(jsonradek["properties"]["CISLO"]))
        with open("volebni_okrsky_nove.ndjson", "a") as noveokrsky:
            json.dump(jsonradek, noveokrsky, ensure_ascii=False)
            noveokrsky.write("\n")