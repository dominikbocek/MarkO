import pandas as pd
import argparse
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument('--volby', action="store", dest='volby', required=True)
parser.add_argument("--zpracovani", action="store", dest="zpracovani", default="obce")
parser.add_argument("--kstrana", action="store", dest="kstrana", default="0")
argumenty = parser.parse_args()

volby = argumenty.volby
zpracovani = argumenty.zpracovani
kstrana = argumenty.kstrana
kstrana = kstrana.split(",")

os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\..\\public\\volby\\{volby}\\první kolo")

# načtení souborů
if zpracovani == "okrsky":
    popisky_df = pd.read_csv('statistics-popisky.csv')
    strany_df = pd.read_csv('statistics-jenom-strany.csv')
elif zpracovani == "obce":
    popisky_df = pd.read_csv('statistics-obce-popisky.csv')
    strany_df = pd.read_csv('statistics-obce-jenom-strany.csv')

if kstrana == "0" or kstrana == [""]:
    strany = strany_df.columns
else:
    strany = kstrana

# procházení sloupců ze souhrnného souboru statistik
for col in strany:
    # vytvoření datové struktury zahrnující id, okrskové výsledky, celkový počet platných hlasů a procentuální výsledek
    output_df = pd.DataFrame({
        'id': popisky_df['id'].astype(str),
        col: strany_df[col],
        'PL_HL_CELK': popisky_df['PL_HL_CELK'],
        'PROCENTA': (strany_df[col] / popisky_df['PL_HL_CELK']) * 100
    })
    
    # každá strana má přidělený svůj vlastní soubor se statistikou
    if zpracovani == "okrsky":
        filename = f'samostatné/{col}.csv'
    if zpracovani == "obce":
        filename = f'samostatné/{col}-obce.csv'
    output_df.to_csv(filename, index=False)
    print(f'Vytvořen soubor {filename}')
