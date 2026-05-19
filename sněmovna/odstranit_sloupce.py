import pandas as pd
import shutil
import os

f=pd.read_csv("psrkl.csv", delimiter=";", encoding="cp1250")
keep_col = ['KSTRANA','VSTRANA','ZKRATKAK30','ZKRATKAK8']
new_f = f[keep_col]
new_f.to_csv("parties.csv", index=False)
if not os.path.exists("parties-univerzal.csv"):
    shutil.copyfile("parties.csv", "parties2.csv")
    shutil.copyfile("parties.csv", "parties-univerzal.csv")