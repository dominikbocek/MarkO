import os
import sys
import pandas as pd
import argparse

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument('--volby', action="store", dest='volby', required=True)
parser.add_argument('--koalice', action="store", dest='koalice', default="ne")
parser.add_argument('--zpracovani', action="store", dest='zpracovani', required=True)
argumenty = parser.parse_args()

volby = argumenty.volby
koalice = argumenty.koalice
zpracovani = argumenty.zpracovani

os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\..\\public\\volby\\{volby}\\první kolo")

soubor = ""

match zpracovani:
  case "okrsky":
    match koalice:
      case "ne":
        soubor = "statistics.csv"
      case "ano":
        soubor = "statistics-univerzal.csv"
      case _:
        sys.exit("Neplatná možnost!")
  case "obce":
    match koalice:
      case "ne":
        soubor = "statistics-obce.csv"
      case "ano":
        soubor = "statistics-univerzal.csv"
      case _:
        sys.exit("Neplatná možnost!")


# načtení csv souboru
data = pd.read_csv(soubor)

# odstranění řádků a sloupců ze souboru
novy = data.drop(columns=["id", "VOL_SEZNAM", "PL_HL_CELK", "POCET_VS"])
novy.to_csv("statistics-jenom-strany.csv", index=False)