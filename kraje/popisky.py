import os
import sys
import pandas as pd
import argparse

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument('--volby', action="store", dest='volby', required=True)
parser.add_argument('--zpracovani', action="store", dest="zpracovani", default="obce")
argumenty = parser.parse_args()
volby = argumenty.volby
zpracovani = argumenty.zpracovani

os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}")

match zpracovani:
    case "okrsky":
        soubor = "statistics.csv"
        novysoubor = "statistics-popisky.csv"
    case "obce":
        soubor = "statistics-obce.csv"
        novysoubor = "statistics-obce-popisky.csv"
    case _:
        sys.exit("Neplatná možnost!")

# není potřeba varianta pro koalice, popisky jsou v souborech statistics identické

f=pd.read_csv(soubor, delimiter=",", encoding="cp1250")
keep_col = ['id','VOL_SEZNAM','PL_HL_CELK']
new_f = f[keep_col]
new_f.to_csv(novysoubor, index=False)