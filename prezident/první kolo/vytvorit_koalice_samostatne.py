import argparse
import pandas as pd
import sys
import os

# zpracování argumentů a ověřování vstupů
parser = argparse.ArgumentParser()
parser.add_argument('--volby', action="store", dest='volby', required=True)
parser.add_argument('--koalice', action="store", dest='koalice', required=True)
parser.add_argument('--nazevkoalice', action="store", dest='nazevkoalice', required=True)
parser.add_argument('--zkratka', action="store", dest='zkratka', required=True)
argumenty = parser.parse_args()

for argument in argumenty.__dict__:
    if argumenty.__dict__[argument] == "":
        sys.exit(f"Argument {argument} nesmí být prázdný!")

volby = argumenty.volby
koalice = argumenty.koalice
nazevkoalice = argumenty.nazevkoalice
zkratka = argumenty.zkratka

os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\..\\public\\volby\\{volby}\\první kolo")

seznam_stran = "candidates-univerzal.csv"
    
koalice = koalice.split(",")

strany = pd.read_csv(seznam_stran, delimiter=",", encoding='utf-8')
kstrana_vstrana = int(len(strany) + 1)
a = pd.DataFrame([[kstrana_vstrana, nazevkoalice, zkratka]], columns=['CKAND', 'JMENO', 'PRIJMENI'])
strany = pd.concat([strany, a])
strany.to_csv(seznam_stran, index=False, encoding='utf-8')

def statistiky(zpracovani):
    match zpracovani:
        case "obce":
            statistiky_vsechno = "statistikcs-univerzal-obce.csv"
        case "okrsky":
            statistiky_vsechno = "statistics-univerzal.csv"
        case _:
            sys.exit("Neplatná možnost!")

    universal = pd.read_csv(statistiky_vsechno)
    universal[len(strany)] = universal[koalice].sum(axis=1)
    universal["POCET_VS"] = len(strany)
    universal.to_csv(statistiky_vsechno, index=False)
    
print(kstrana_vstrana)