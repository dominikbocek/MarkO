import zipfile
import argparse

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument('--obec', action="store", dest='obec', required=True)
argumenty = parser.parse_args()
obec = argumenty.obec

with zipfile.ZipFile(f"{obec}.zip", 'r') as zip_ref:
    zip_ref.extractall("obce/")