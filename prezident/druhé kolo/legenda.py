import os
import json
import argparse
import xml.etree.ElementTree as ET

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument('--volby', action="store", dest='volby', required=True)
argumenty = parser.parse_args()
volby = argumenty.volby

os.chdir(f"{os.path.dirname(os.path.realpath(__file__))}\\..\\..\\public\\volby\\{volby}\\druhé kolo")

XML_FILE = f"{os.path.dirname(os.path.realpath(__file__))}\\..\\..\\sada\\{volby}\\vysledky.xml"
JSON_FILE = f"{os.path.dirname(os.path.realpath(__file__))}\\..\\..\\public\\volby\\{volby}\\druhé kolo\\vysledky_cr.json"

# Namespace podle XML
NS = {"v": "http://www.volby.cz/prezident/"}

tree = ET.parse(XML_FILE)
root = tree.getroot()

# ČR
cr = root.find(".//v:CR", NS)

vysledky = []

cislo = 1

for strana in cr.findall(".//v:KANDIDAT", NS):
    hodnoty = strana.get("HLASY_PROC_2KOLO")
    if hodnoty is not None:
        jmeno = strana.get("JMENO")
        prijmeni = strana.get("PRIJMENI")
        ckand = strana.get("PORADOVE_CISLO")
        proc_hlasu = hodnoty

        # převod desetinné čárky na desetinnou tečku
        proc_hlasu_float = float(proc_hlasu.replace(",", "."))

        vysledky.append({
            "kandidat": jmeno + " " + prijmeni,
            "proc_hlasu": proc_hlasu_float,
            "CKAND": str(cislo)
        })

        cislo+=1

# seřazení od největšího po nejmenší
vysledky_sorted = sorted(
    vysledky,
    key=lambda x: x["proc_hlasu"],
    reverse=True
)

# uložení do souboru json
with open(JSON_FILE, "w", encoding="utf-8") as f:
    json.dump(vysledky_sorted, f, ensure_ascii=False, indent=2)

print(f"Uloženo do souboru: {JSON_FILE}")