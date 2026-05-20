import pandas as pd
f=pd.read_csv("perk.csv", delimiter=";", encoding="cp1250")
keep_col = ['CKAND','JMENO','PRIJMENI']
new_f = f[keep_col]
new_f.to_csv("candidates.csv", index=False)
