import os
import sys
import json
import obvody
import argparse

sys.stdout.reconfigure(encoding='utf-8')

parser = argparse.ArgumentParser()
parser.add_argument('--obec', action="store", dest='obec', required=True)
parser.add_argument('--volby', action="store", dest='volby', required=True)
argumenty = parser.parse_args()
obec = int(argumenty.obec)
volby = argumenty.volby

# jde o místní obvod?
infokod = obvody.infokod(volby, obec)

if infokod.statut != 0:
    cesta = f"{os.path.dirname(os.path.realpath(__file__))}/../public/volby/{volby}/obce/{infokod.statut}/{obec}"
else:
    cesta = f"{os.path.dirname(os.path.realpath(__file__))}/../public/volby/{volby}/obce/{obec}"

mapa = open(f"{cesta}/volebni_okrsky.ndjson", "w+", newline="")

with open(f"{os.path.dirname(os.path.realpath(__file__))}/../public/volby/{volby}/volebni_okrsky.ndjson") as f:
    for line in f:
        obvod = json.loads(line)
        if "KOD" in obvod["properties"]:
            if obvod["properties"]["KOD"] == obec:
                mapa.write(line)
        if "Obec" in obvod["properties"]:
            if infokod.statut != 0:
                if obvod["properties"]["Momc"] == obec:
                    mapa.write(line)
            if infokod.statut == 0:
                if obvod["properties"]["Obec"] == obec:
                    mapa.write(line)
    mapa.close()