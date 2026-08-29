import os
import sys
import argparse
import pandas as pd

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument('--volby', action="store", dest="volby", required=True)
parser.add_argument('--koalice', action="store", dest='koalice', default="ne")
parser.add_argument('--zpracovani', action="store", dest='zpracovani', default="obce")
argumenty = parser.parse_args()

volby = argumenty.volby
koalice = argumenty.koalice
zpracovani = argumenty.zpracovani

os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}")

soubor = ""
novysoubor = ""

match zpracovani:
  case "okrsky":
    novysoubor = "statistics-jenom-strany.csv"
    match koalice:
      case "ne":
        soubor = "statistics.csv"
      case "ano":
        soubor = "statistics-univerzal.csv"
      case _:
        sys.exit("Neplatná možnost!")
  case "obce":
    novysoubor = "statistics-obce-jenom-strany.csv"
    match koalice:
      case "ne":
        soubor = "statistics-obce.csv"
      case "ano":
        soubor = "statistics-univerzal.csv"
      case _:
        sys.exit("Neplatná možnost!")
  case _:
    sys.exit("Neplatná možnost!")
    

# načtení CSV souboru
data = pd.read_csv(soubor)

# funkce drop(), která slouží k odstranění řádků a sloupců ze souboru
novy = data.drop(columns=["id", "VOL_SEZNAM", "PL_HL_CELK", "POCET_VS"])
novy.to_csv(novysoubor, index=False)