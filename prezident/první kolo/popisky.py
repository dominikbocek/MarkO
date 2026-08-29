import pandas as pd

# není potřeba varianta pro koalice, popisky jsou v souborech statistics identické

f=pd.read_csv("statistics.csv", delimiter=",", encoding="cp1250")
keep_col = ['id','VOL_SEZNAM','PL_HL_CELK']
new_f = f[keep_col]
new_f.to_csv("statistics-popisky.csv", index=False)
