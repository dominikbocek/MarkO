import pandas as pd
import argparse
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument("--kstrana", action="store", dest="kstrana", default="")
parser.add_argument('--volby', action="store", dest='volby', required=True)
parser.add_argument('--obec', action="store", dest='obec', required=True)
argumenty = parser.parse_args()
kstrana = argumenty.kstrana
kstrana = kstrana.split(",")
volby = argumenty.volby
obec = int(argumenty.obec)

# jde o místní obvod?
with open(f"{os.path.dirname(os.path.realpath(__file__))}\\obvody.py") as obvody:
    code = obvody.read()
exec(code)

if statut != 0:
    os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}\\obce\\{statut}\\{obec}")
else:
    os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\public\\volby\\{volby}\\obce\\{obec}")

# načtení souborů
popisky_df = pd.read_csv(f'{obec}-popisky.csv')
strany_df = pd.read_csv(f'{obec}-jenom-strany.csv')

pocet_stran = strany_df["POCET_VS"].loc[0].tolist()

if kstrana == "0" or kstrana == [""]:
    strany = [str(x) for x in range(1,pocet_stran + 1)]
    print(strany)
else:
    strany = kstrana

# procházení sloupců ze souhrnného souboru statistik
for col in strany:
    # vytvoření datové struktury zahrnující id, okrskové výsledky, celkový počet platných hlasů a procentuální výsledek, uzpůsobit počtu stran
    output_df = pd.DataFrame({
        'id': popisky_df['id'],
        'PROCENTA': (strany_df[col].astype(int) / popisky_df['PL_HL_CELK'].astype(int))*100,
        'ucast': strany_df['ucast']
    })
    
    # každá strana má přidělený svůj vlastní soubor se statistikou
    filename = f'samostatné/{col}.csv'
    output_df.to_csv(filename, index=False)
    print(f'Vytvořen soubor {filename}')
