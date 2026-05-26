import os
import sys
import array
import shutil
import argparse
import subprocess
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

parser = argparse.ArgumentParser()
parser.add_argument('--volby', action="store", dest='volby', required=False)
argumenty = parser.parse_args()
volby = argumenty.volby

os.chdir("../../")

cwd = os.getcwd()

druh_voleb = ""

if "pscoco.csv" in os.listdir(f"sada/{volby}"):
    druh_voleb = "sněmovna"
elif "pecoco.csv" in os.listdir(f"sada/{volby}"):
    druh_voleb = "prezident"
elif "kzcoco.csv" in os.listdir(f"sada/{volby}"):
    druh_voleb = "kraje"
else:
    druh_voleb = "žádné"
    sys.exit("druhvoleb = '" + druh_voleb + "'")


# symbolické odkazy pro program a volební data

os.mkdir(f"public/volby/{volby}")

if druh_voleb == "prezident":
    os.mkdir(f"public/volby/{volby}/první kolo")
    os.mkdir(f"public/volby/{volby}/druhé kolo")
    if not os.path.exists(f"public/volby/{volby}/volebni_mapy.sh") and not os.path.exists(f"public/volby/{volby}/první kolo/volebni_mapy.sh"): # ověření, jestli už nedošlo k extrakci
        for soubor in os.listdir(f"{druh_voleb}/první kolo"): # kopírování programu
            subprocess.run(["ln", f"{cwd}/{druh_voleb}/první kolo/{soubor}", f"{cwd}/public/volby/{volby}/první kolo/{soubor}"])
        for soubor in os.listdir(f"{druh_voleb}/druhé kolo"): # kopírování programu
            subprocess.run(["ln", f"{cwd}/{druh_voleb}/druhé kolo/{soubor}", f"{cwd}/public/volby/{volby}/druhé kolo/{soubor}"])
        for soubor in os.listdir("okrsky"): # kopírování okrsků
            subprocess.run(["ln", f"{cwd}/okrsky/{soubor}", f"{cwd}/public/volby/{volby}/první kolo/{soubor}"])
            subprocess.run(["ln", f"{cwd}/okrsky/{soubor}", f"{cwd}/public/volby/{volby}/druhé kolo/{soubor}"])
        for soubor in os.listdir(f"sada/{volby}"): # kopírování volebních dat
            subprocess.run(["ln", f"{cwd}/sada/{volby}/{soubor}", f"{cwd}/public/volby/{volby}/první kolo/{soubor}"])
            subprocess.run(["ln", f"{cwd}/sada/{volby}/{soubor}", f"{cwd}/public/volby/{volby}/druhé kolo/{soubor}"])
else:
    if not os.path.exists(f"public/volby/{volby}/volebni_mapy.sh") and not os.path.exists(f"public/volby/{volby}/první kolo/volebni_mapy.sh"): # ověření, jestli už nedošlo k extrakci
        for soubor in os.listdir(druh_voleb): # kopírování programu
            subprocess.run(["ln", f"{cwd}/{druh_voleb}/{soubor}", f"{cwd}/public/volby/{volby}/{soubor}"])
        for soubor in os.listdir("okrsky"): # kopírování okrsků
            subprocess.run(["ln", f"{cwd}/okrsky/{soubor}", f"{cwd}/public/volby/{volby}/{soubor}"])
        for soubor in os.listdir(f"sada/{volby}"): # kopírování volebních dat
            subprocess.run(["ln", f"{cwd}/sada/{volby}/{soubor}", f"{cwd}/public/volby/{volby}/{soubor}"])

print(druh_voleb)
