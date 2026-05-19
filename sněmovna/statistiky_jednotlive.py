import pandas as pd
import argparse
import sys

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument("--kstrana", action="store", dest="kstrana", default="0")
argumenty = parser.parse_args()
kstrana = argumenty.kstrana
kstrana = kstrana.split(",")


# načtení souborů
popisky_df = pd.read_csv('statistics-popisky.csv')
strany_df = pd.read_csv('statistics-jenom-strany.csv')

if kstrana == "0" or kstrana == [""]:
    strany = strany_df.columns
else:
    strany = kstrana

# procházení sloupců ze souhrnného souboru statistik
for col in strany:
    # vytvoření datové struktury zahrnující id, okrskové výsledky, celkový počet platných hlasů a procentuální výsledek
    output_df = pd.DataFrame({
        'id': popisky_df['id'],
        col: strany_df[col],
        'PL_HL_CELK': popisky_df['PL_HL_CELK'],
        'PROCENTA': (strany_df[col] / popisky_df['PL_HL_CELK']) * 100
    })
    
    # každá strana má přidělený svůj vlastní soubor se statistikou
    filename = f'samostatné/{col}.csv'
    output_df.to_csv(filename, index=False)
    print(f'Vytvořen soubor {filename}')
