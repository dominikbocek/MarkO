import pandas as pd
f=pd.read_csv("statistics.csv", delimiter=",", encoding="cp1250")
keep_col = ['id','VOL_SEZNAM','PL_HL_CELK']
new_f = f[keep_col]
new_f.to_csv("statistics-popisky.csv", index=False)
