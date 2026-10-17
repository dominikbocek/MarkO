import pandas as pd
import argparse
import json
import sys
import os

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument('--volby', action="store", dest="volby", required=True)
argumenty = parser.parse_args()

volby = argumenty.volby
os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\sada\\{volby}\\")
info = open("info.json", encoding="utf8")
data = json.load(info)

print(data["druh"])

match data["druh"]:
    case "komunální":
        mesta = pd.read_csv("kvcoco.csv", encoding="cp1250", delimiter=";")
    case "prezidentské":
        mesta = pd.read_csv("pecoco.csv", encoding="cp1250", delimiter=";")
    case "sněmovní":
        mesta = pd.read_csv("pscoco.csv", encoding="cp1250", delimiter=";")
    case "krajské":
        mesta = pd.read_csv("kzcoco.csv", encoding="cp1250", delimiter=";")
    case _:
        sys.exit("Neplatná možnost!")

statutarni_mesta = pd.read_csv(f"{os.path.dirname(os.path.realpath(__file__))}\\statutární města.csv")

match data["druh"]:
    case "krajské"|"prezidentské"|"sněmovní":
        mesta = mesta[["OBEC","NAZEVOBCE","OBEC_PREZ"]]
        OBEC = mesta["OBEC"].to_json()
        OBEC_PREZ = mesta["OBEC_PREZ"].to_json()
        OBEC_PREZ_json = json.loads(OBEC_PREZ)
        print(OBEC_PREZ)
        #mesta.to_csv()
        for mesto in OBEC_PREZ_json:
            if len(mesta[mesta["OBEC"] == mesto]) == 0:
                statutarni_mesto = statutarni_mesta[statutarni_mesta["KODMESTA"] == mesto]["KODMESTA"].to_string()
                novemesto = pd.DataFrame([[mesto, statutarni_mesto, ""]], columns=["OBEC","NAZEVOBCE","OBEC_PREZ"])
                mesta = pd.concat([mesta, novemesto])
        mesta.to_csv(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\sada\\{volby}\\města.csv", index=False, encoding="utf8")


# komunální volby - ověřovat názvy statutárních měst přímo z nově vytvořeného souboru, u ostatních voleb