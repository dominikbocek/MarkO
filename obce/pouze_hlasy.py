import pandas as pd
import argparse
import sys
import os

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument('--koalice', action="store", dest='koalice', default="ne")
parser.add_argument('--volby', action="store", dest='volby', required=True)
parser.add_argument('--obec', action="store", dest='obec', required=True)
argumenty = parser.parse_args()
koalice = argumenty.koalice
volby = argumenty.volby
obec = int(argumenty.obec)

soubor = ""
match koalice:
  case "ne":
    soubor = f"{obec}.csv"
  case "ano":
    soubor = f"{obec}-univerzal.csv"
  case _:
    sys.exit("Neplatná možnost!")

# jde o místní obvod?
with open(f"{os.path.dirname(os.path.realpath(__file__))}\\obvody.py") as obvody:
    code = obvody.read()
exec(code)

if statut != 0:
    os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}\\obce\\{statut}\\{obec}")
else:
    os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}\\obce\\{obec}")

# načtení CSV souboru
data = pd.read_csv(soubor)

# funkce drop(), která slouží k odstranění řádků a sloupců ze souboru
novy = data.drop(columns=["id", "VOL_SEZNAM", "PL_HL_CELK"])
novy.to_csv(f"{obec}-jenom-strany.csv", mode="w", index=False)

# přesunuto ze souboru popisky.py, akorát by to zbytečně bobtnalo
# není potřeba varianta pro koalice, popisky jsou v souborech statistics identické

f=pd.read_csv(f"{obec}.csv", delimiter=",", encoding="cp1250")
keep_col = ['id','VOL_SEZNAM','PL_HL_CELK','POCET_VS']
new_f = f[keep_col]
new_f.to_csv(f"{obec}-popisky.csv", index=False)