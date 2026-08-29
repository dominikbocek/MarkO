import os
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
        data = pd.read_csv('statistics.csv')
    case "obce":
        data = pd.read_csv('statistics-obce.csv')

# filtrování sloupců
novy = data.drop(columns=["id", "VOL_SEZNAM", "PL_HL_CELK", "POCET_VS"])
novy.to_csv("statistics-jenom-strany.csv", index=False)