import xml.etree.ElementTree as ET
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

XML_FILE = "vysledky.xml"
JSON_FILE = "vysledky_cr.json"

# Namespace podle XML
NS = {"v": "http://www.volby.cz/ps/"}

tree = ET.parse(XML_FILE)
root = tree.getroot()

# Najdeme CR
cr = root.find(".//v:CR", NS)

vysledky = []

for strana in cr.findall(".//v:STRANA", NS):
    nazev = strana.get("NAZ_STR")
    kstrana = strana.get("KSTRANA")

    hodnoty = strana.find("v:HODNOTY_STRANA", NS)
    if hodnoty is not None:
        proc_hlasu = hodnoty.get("PROC_HLASU")

        if proc_hlasu:
            # převod z "34,51" na float 34.51
            proc_hlasu_float = float(proc_hlasu.replace(",", "."))

            vysledky.append({
                "strana": nazev,
                "proc_hlasu": proc_hlasu_float,
                "KSTRANA": kstrana
            })

# Seřazení od největšího po nejmenší
vysledky_sorted = sorted(
    vysledky,
    key=lambda x: x["proc_hlasu"],
    reverse=True
)

# Uložení do JSON
with open(JSON_FILE, "w", encoding="utf-8") as f:
    json.dump(vysledky_sorted, f, ensure_ascii=False, indent=2)

print(f"Hotovo! Uloženo do souboru: {JSON_FILE}")
