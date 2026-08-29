import os
import csv
import argparse
import numpy as np
import pandas as pd

parser = argparse.ArgumentParser()
parser.add_argument('--volby', action="store", dest='volby', required=True)
argumenty = parser.parse_args()
volby = argumenty.volby

datumvoleb = pd.read_csv(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\sada\\{volby}\\datum.csv")["DATUMVOLEB"].to_list()[0]

# import z kvt3.csv
statistics = pd.read_csv(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\sada\\{volby}\\kvt3.csv", delimiter=";", encoding="cp1250")
statistics['id'] = statistics['OBEC'].astype(str) + '-' + statistics['OKRSEK'].astype(str)

# pouze, pokud neexistují soubory účast.csv a účast-statutární-města.csv
if not os.path.isfile(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}\\účast.csv") or not os.path.isfile(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}\\účast-statutární-města.csv"):
    obce = statistics[(statistics["OBEC"] != statistics["KODZASTUP"]) & (statistics["DATUMVOLEB"] == datumvoleb)] # běžné obce + statutární zastupitelstva
    obvody = statistics[(statistics["OBEC"] == statistics["KODZASTUP"]) & (statistics["DATUMVOLEB"] == datumvoleb)] # místní samosprávné obvody
    # odfiltrování statutárních měst
    statutarni_mesta = []
    with open(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\sada\\{volby}\\kvcoco.csv", 'r') as csvfile:
        csvreader = csv.reader(csvfile, delimiter=";")
        for row in csvreader:
            if not row[13] and str(row[0]) == str(datumvoleb): # pokud nemá hodnotu NADRZASTUP, jde o statutární město
                statutarni_mesta.append(row[5])

    statutarni_mesta_csv = open(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}\\účast-statutární-města.csv", mode="w+", newline="")
    writer = csv.writer(statutarni_mesta_csv)
    writer.writerow(["DATUMVOLEB","ID_OKRSKY","KRAJ","OKRES","OBEC","OKRSEK","TYPZASTUP","COBVODU","VOL_SEZNAM","VYD_OBALKY","ODEVZ_OBAL","PL_HL_CELK","POCET_VS","POC_VS_HL","KODZASTUP","id"])
    statutarni_mesta_csv.close()

    for mesto in statutarni_mesta:
        ucast_obce = obce[obce["KODZASTUP"] != int(mesto)] # běžné obce bez statutárních zastupitelstev + statutární města bez samosprávných místních obvodů (Olomouc)
        statutarni_mesta_df = obce[obce["KODZASTUP"] == int(mesto)]
        statutarni_mesta_df.to_csv(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}\\účast-statutární-města.csv", mode="a", index=False, header=False)

    ucast_obce["ucast"] = (ucast_obce["ODEVZ_OBAL"].astype(int) / ucast_obce["VOL_SEZNAM"].astype(int)) * 100
    ucast_obce = ucast_obce[["id", "KODZASTUP", "POCET_VS", "ODEVZ_OBAL", "VOL_SEZNAM", "PL_HL_CELK", "ucast"]]

    ucast_obvody = obvody[["id", "KODZASTUP", "POCET_VS", "ODEVZ_OBAL", "VOL_SEZNAM", "PL_HL_CELK"]]
    ucast_obvody["ucast"] = (obvody["ODEVZ_OBAL"].astype(int) / obvody["VOL_SEZNAM"].astype(int)) * 100

    statutarni_mesta_df = pd.read_csv(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}\\účast-statutární-města.csv", encoding="cp1250")
    statutarni_mesta_df["ucast"] = (statutarni_mesta_df["ODEVZ_OBAL"].astype(int) / statutarni_mesta_df["VOL_SEZNAM"].astype(int)) * 100
    statutarni_mesta_df = statutarni_mesta_df[["id", "KODZASTUP", "POCET_VS", "ODEVZ_OBAL", "VOL_SEZNAM", "PL_HL_CELK", "ucast"]]

    # Uložení
    ucast_obce.to_csv(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}\\účast.csv", mode='w+', index=False)
    ucast_obvody.to_csv(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}\\účast.csv", mode='a', index=False, header=not os.path.exists(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}\\účast.csv")) # uložení běžných zastupitelstev + samosprávných obvodů

    statutarni_mesta_df.to_csv(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}\\účast-statutární-města.csv", index=False) # uložení statutárních zastupitelstev