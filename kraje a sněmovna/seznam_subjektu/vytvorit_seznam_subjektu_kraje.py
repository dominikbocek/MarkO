import os
import shutil
import pandas as pd

def seznam(volby, dosouboru = False):
    f=pd.read_csv(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\..\\sada\\{volby}\\kzrkl.csv", delimiter=";", encoding="cp1250")
    f = f.sort_values(['KSTRANA']) # seřazení podle hodnoty KSTRANA od nejmenšího po největší
    f["STAVREG"] = f["STAVREG"].astype(str) # převedení na řetězec, abychom mohli spojovat hodnoty
    stavregcelk = f.groupby("KSTRANA").agg({'STAVREG': ''.join}) # spojení hodnot STAVREG
    keep_col = ['KSTRANA','VSTRANA','ZKRATKAK30','ZKRATKAK8'] # filtrování sloupců, vytvoření seznamu kandidujících subjektů
    new_f = f[keep_col]
    new_f.drop_duplicates(inplace = True)
    new_f = new_f.set_index("KSTRANA") # přeindexování podle vlastnosti KSTRANA
    new_f["STAVREG"] = stavregcelk["STAVREG"].astype(str) # přidání sloučených STAVREG
    bezregistrace = new_f[~new_f["STAVREG"].astype('str').str.contains("0")].index.astype(str).to_list()
    new_f = new_f[new_f["STAVREG"].astype('str').str.contains("0")] # odstranění všech subjektů, které nemají platnou registraci ani v jednom kraji
    new_f.index = range(1, len(new_f.index) + 1)
    new_f.index.name = "KSTRANA"

    if not dosouboru:
        return bezregistrace

    os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\..\\public\\volby\\{volby}")
    new_f.to_csv("parties.csv")
    if not os.path.exists("parties-univerzal.csv"):
        shutil.copyfile("parties.csv", "parties2.csv")
        shutil.copyfile("parties.csv", "parties-univerzal.csv")

    return "ok"