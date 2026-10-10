import os
import sys
import pandas as pd
import argparse

sys.stdout.reconfigure(encoding='utf-8')

parser = argparse.ArgumentParser()
parser.add_argument('--obec', action="store", dest='obec', required=True)
parser.add_argument('--vypsat', action="store", dest='vypsat', required=False, default="kód")
argumenty = parser.parse_args()
obec = argumenty.obec
vypsat = argumenty.vypsat

obce = pd.read_csv(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\společné\\kvcoco.csv", delimiter=";", encoding="cp1250")
obvody_df = obce[obce["NADRZASTUP"] == int(obec)]

if vypsat == "kód":
    print(obvody_df["KODZASTUP"].to_list())
if vypsat == "název":
    print(obvody_df["NAZEVZAST"].to_list())