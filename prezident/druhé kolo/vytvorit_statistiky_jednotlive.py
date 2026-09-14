import os
import sys
import pandas as pd
import argparse

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument('--volby', action="store", dest='volby', required=True)
parser.add_argument("--zpracovani", action="store", dest="zpracovani", default="obce")
argumenty = parser.parse_args()

volby = argumenty.volby
zpracovani = argumenty.zpracovani

os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\..\\public\\volby\\{volby}\\druhé kolo")

# načtení souborů
if zpracovani == "okrsky":
    popisky_df = pd.read_csv('statistics-popisky.csv')
    strany_df = pd.read_csv('statistics-jenom-strany.csv')
elif zpracovani == "obce":
    popisky_df = pd.read_csv('statistics-obce-popisky.csv', dtype={"id": str})
    strany_df = pd.read_csv('statistics-obce-jenom-strany.csv', dtype={"id": str})

# procházení sloupců v strany_df
for col in strany_df.columns:
    # vytvoření nového dataframu 
    output_df = pd.DataFrame({
        'id': popisky_df['id'].astype(str),
        col: strany_df[col],
        'PL_HL_CELK': popisky_df['PL_HL_CELK'],
        'PROCENTA': (strany_df[col] / popisky_df['PL_HL_CELK']) * 100
    })
    
    # uložení do souboru pojmenovaném podle názvu sloupce
    if zpracovani == "okrsky":
        filename = f'samostatné/{col}.csv'
    if zpracovani == "obce":
        filename = f'samostatné/{col}-obce.csv'
    output_df.to_csv(filename, index=False)
    print(f'Vytvořen soubor {filename}')