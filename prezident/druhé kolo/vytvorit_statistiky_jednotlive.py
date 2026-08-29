import os
import sys
import pandas as pd
import argparse

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument('--volby', action="store", dest='volby', required=True)
argumenty = parser.parse_args()
volby = argumenty.volby

os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\..\\public\\volby\\{volby}\\druhé kolo")

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

# načtení souborů
popisky_df = pd.read_csv('statistics-popisky.csv')
strany_df = pd.read_csv('statistics-jenom-strany.csv')

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
    filename = f'samostatné/{col}.csv'
    output_df.to_csv(filename, index=False)
    print(f'Vytvořen soubor {filename}')