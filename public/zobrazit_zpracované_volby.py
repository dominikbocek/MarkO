import os
import sys
import argparse

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument('--cesta', action="store", dest='cesta', default="ne")
argumenty = parser.parse_args()
cesta = argumenty.cesta

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')
path = "volby"
seznam = []
if cesta == "ne":
    filtr_slozek = [f for f in os.listdir(path) if os.path.isdir(os.path.join(path, f))]
    for d in filtr_slozek:
        if(os.path.isfile(f"{path}/{d}/první kolo/statistics.csv")):
            seznam.append(f"{d} (první kolo)")
        if(os.path.isfile(f"{path}/{d}/druhé kolo/statistics.csv")):
            seznam.append(f"{d} (druhé kolo)")
        if(os.path.isfile(f"{path}/{d}/statistics.csv")):
            seznam.append(d)
else:
    filtr_slozek = [f for f in os.listdir(path) if os.path.isdir(os.path.join(path, f))]
    for d in filtr_slozek:
        if(os.path.isfile(f"{path}/{d}/první kolo/statistics.csv")):
            seznam.append(f"{d}/první kolo")
        if(os.path.isfile(f"{path}/{d}/druhé kolo/statistics.csv")):
            seznam.append(f"{d}/druhé kolo")
        if(os.path.isfile(f"{path}/{d}/statistics.csv")):
            seznam.append(d)
print(sorted(seznam))