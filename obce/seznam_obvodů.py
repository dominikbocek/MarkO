import os
import sys
import json
import pandas as pd
import argparse

sys.stdout.reconfigure(encoding='utf-8')

parser = argparse.ArgumentParser()
parser.add_argument('--obec', action="store", dest='obec', required=True)
parser.add_argument('--volby', action="store", dest='volby', required=True)
parser.add_argument('--vypsat', action="store", dest='vypsat', required=False, default="kód")
argumenty = parser.parse_args()
obec = argumenty.obec
volby = argumenty.volby
vypsat = argumenty.vypsat

obvody = []

datumvoleb = pd.read_csv(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\sada\\{volby}\\datum.csv")["DATUMVOLEB"].to_list()[0]

with open(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}\\kvrzcoco.ndjson") as f:
    for line in f:
        obvod = json.loads(line)
        if str(obvod["KODZASTUP"]) == obec:
            if vypsat == "kód":
                obvody.append(int(obvod["OBEC"]))
            if vypsat == "název":
                obvody.append(obvod["NAZEVOBCE"])


print(obvody)