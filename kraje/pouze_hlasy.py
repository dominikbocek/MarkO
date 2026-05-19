import pandas as pd
import argparse

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument('--koalice', action="store", dest='koalice', default="ne")
argumenty = parser.parse_args()
koalice = argumenty.koalice
soubor = ""
if koalice == "ne":
  soubor = "statistics.csv"
elif koalice == "ano":
  soubor = "statistics-univerzal.csv"

# načtení CSV souboru
data = pd.read_csv(soubor)

# funkce drop(), která slouží k odstranění řádků a sloupců ze souboru
novy = data.drop(columns=["id", "VOL_SEZNAM", "PL_HL_CELK"])
novy.to_csv("statistics-jenom-strany.csv", index=False)
