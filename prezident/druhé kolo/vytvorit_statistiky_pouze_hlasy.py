import os
import sys
import pandas as pd
import argparse

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument('--volby', action="store", dest='volby', required=True)
parser.add_argument('--zpracovani', action="store", dest='zpracovani', default="obce")
argumenty = parser.parse_args()

volby = argumenty.volby
zpracovani = argumenty.zpracovani

os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\..\\public\\volby\\{volby}\\druhé kolo")

# základní statistiky
match zpracovani:
    case "okrsky":
        soubor = 'statistics.csv'
        novysoubor = "statistics-jenom-strany.csv"
    case "obce":
        soubor = 'statistics-obce.csv'
        novysoubor = "statistics-obce-jenom-strany.csv"
    case _:
        sys.exit("Neplatná možnost!")

data = pd.read_csv(soubor)

# filtrování sloupců
novy = data.drop(columns=["id", "VOL_SEZNAM", "PL_HL_CELK", "POCET_VS"])
novy.to_csv(novysoubor, index=False)