import pandas as pd
import numpy as np
import sys
import os

datumvoleb = pd.read_csv(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\sada\\{volby}\\datum.csv")["DATUMVOLEB"].to_list()[0]

mo = pd.read_csv(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\sada\\{volby}\\kvrzcoco.csv", encoding="cp1250", delimiter=";")
mo_vyhledat = mo.iloc[mo[(mo["KODZASTUP"] == obec) & (mo["DATUMVOLEB"] == datumvoleb)].index]
if not mo_vyhledat.empty:
    if mo_vyhledat["OBEC"].to_list()[0] == mo_vyhledat["KODZASTUP"].to_list()[0] and mo_vyhledat["TYPZASTUP"].to_list()[0] == 1:
        statut = 0 # ne
        jestatut = False
        jesamospravnyobvod = False
    elif mo_vyhledat["OBEC"].to_list()[0] == mo_vyhledat["KODZASTUP"].to_list()[0] and mo_vyhledat["TYPZASTUP"].to_list()[0] == 2:
        statut = int(mo.iloc[mo[(mo["OBEC"] == obec) & (mo["KODZASTUP"] != obec) & (mo["DATUMVOLEB"] == datumvoleb)].index]["KODZASTUP"].to_list()[0]) # ano
        jestatut = False
        jesamospravnyobvod = True
    else:
        statut = 0
        jestatut = True
        jesamospravnyobvod = False
else:
    mo_vyhledat = mo.iloc[mo[(mo["OBEC"] == obec) & (mo["OBEC"] != mo["KODZASTUP"]) & (mo["DATUMVOLEB"] == datumvoleb)].index]
    statut = mo_vyhledat["KODZASTUP"].to_list()[0]
    jestatut = False
    jesamospravnyobvod = False # pro případ, že by část města byla samosprávná a část spadala přímo pod magistrát (jako např. Liberec)