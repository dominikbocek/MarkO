import os
import csv
import argparse
import numpy as np
import pandas as pd

# pro možné budoucí zpracování pro jednotlivá zastupitelstva zvlášť

# zpracování argumentů
# parser = argparse.ArgumentParser()
# parser.add_argument('--obec', action="store", dest='obec', required=True)
# argumenty = parser.parse_args()
# obec = int(argumenty.obec)

os.chdir(os.path.dirname(os.path.realpath(__file__)))

# statistics + id
statistics = pd.read_csv("kvt3.csv", delimiter=";", encoding="cp1250")
statistics['id'] = statistics['OBEC'].astype(str) + '-' + statistics['OKRSEK'].astype(str)


ucast_obce = statistics.drop(statistics[statistics["TYPZASTUP"] != 1].index)
ucast_obvody = statistics.drop(statistics[statistics["TYPZASTUP"] != 2].index)
# odfiltrování statutárních měst
statutarni_mesta = []
with open('kvcoco.csv', 'r') as csvfile:
    csvreader = csv.reader(csvfile, delimiter=";")
    for row in csvreader:
        if not row[13]: # pokud nemá hodnotu NADRZASTUP, jde o statutární město
            statutarni_mesta.append(row[5])

for mesto in statutarni_mesta:
    ucast_obce = ucast_obce[ucast_obce["KODZASTUP"] != int(mesto)]

ucast_obce["ucast"] = (ucast_obce["ODEVZ_OBAL"].astype(int) / ucast_obce["VOL_SEZNAM"].astype(int)) * 100
ucast_obce = ucast_obce[["id", "KODZASTUP", "ucast"]]

ucast_obvody["ucast"] = (ucast_obvody["ODEVZ_OBAL"].astype(int) / ucast_obvody["VOL_SEZNAM"].astype(int)) * 100
ucast_obvody = ucast_obvody[["id", "KODZASTUP", "ucast"]]

# Uložení

ucast_obce.to_csv("účast.csv", index=False)
ucast_obvody.to_csv("účast.csv", mode='a', index=False, header=not os.path.exists("účast.csv"))