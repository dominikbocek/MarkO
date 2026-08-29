import argparse
import pandas as pd
import shutil
import os

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument('--volby', action="store", dest="volby", required=True)
argumenty = parser.parse_args()
volby = argumenty.volby

f=pd.read_csv(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\sada\\{volby}\\psrkl.csv", delimiter=";", encoding="cp1250", dtype={"STAVREG": str})
f = f[f["STAVREG"].astype('str').str.contains("0")]
f = f.sort_values(['KSTRANA'])
keep_col = ['KSTRANA','VSTRANA','ZKRATKAK30','ZKRATKAK8']
new_f = f[keep_col]
kstrana = new_f.pop("KSTRANA")
new_f.drop_duplicates(inplace = True)
new_f.insert(0, kstrana.name, kstrana)
new_f["KSTRANA"] = range(1, len(new_f.index) + 1)

os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}")
new_f.to_csv("parties.csv", index=False)
if not os.path.exists("parties-univerzal.csv"):
    shutil.copyfile("parties.csv", "parties2.csv")
    shutil.copyfile("parties.csv", "parties-univerzal.csv")