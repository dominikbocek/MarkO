import pandas as pd
import shutil
import os

f=pd.read_csv("perk.csv", delimiter=";", encoding="cp1250")
keep_col = ['CKAND','JMENO','PRIJMENI']
new_f = f[keep_col]
new_f.to_csv("candidates.csv", index=False)
if not os.path.exists("candidates-univerzal.csv"):
    shutil.copyfile("candidates.csv", "candidates2.csv")
    shutil.copyfile("candidates.csv", "candidates-univerzal.csv")