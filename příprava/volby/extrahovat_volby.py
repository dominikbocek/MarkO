import os
import sys
import array
import shutil
import zipfile
import argparse
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

parser = argparse.ArgumentParser()
parser.add_argument('--volby', action="store", dest='volby', required=False)
argumenty = parser.parse_args()
volby = argumenty.volby

os.chdir("../../")


zf = zipfile.ZipFile("sada.zip", 'r')

druh_voleb = ""

if volby + "/pscoco.csv" in zf.namelist():
    druh_voleb = "sněmovna"
elif volby + "/pecoco.csv" in zf.namelist():
    druh_voleb = "prezident"
elif volby + "/kzcoco.csv" in zf.namelist():
    druh_voleb = "kraje"
else:
    druh_voleb = "žádné"
    sys.exit("druhvoleb = '" + druh_voleb + "'")

with zipfile.ZipFile("okrsky.zip", "r") as zf2:
    if druh_voleb != "prezident":
        if not os.path.exists("public/volby/" + volby + "/volebni_mapy.sh"): # ověření, jestli už nedošlo k extrakci
            zf2.extractall("public/volby/" + volby)
    else:
        if not os.path.exists("public/volby/" + volby + "/první kolo/volebni_mapy.sh"): # ověření, jestli už nedošlo k extrakci
            zf2.extractall("public/volby/" + volby + "/první kolo")
            zf2.extractall("public/volby/" + volby + "/druhé kolo")

for f in zf.namelist():
    if f.startswith(volby + "/") and f != str(volby + "/"):
        if druh_voleb == "prezident":
            if not os.path.exists("public/volby/" + volby + "/první kolo/volebni_mapy.sh"): # ověření, jestli už nedošlo k extrakci
                zf.extract(f, "public/volby/" + volby + "/první kolo")
                zf.extract(f, "public/volby/" + volby + "/druhé kolo")
                shutil.move("public/volby/" + volby + "/první kolo/" + f, "public/volby/" + volby + "/první kolo/" + f.split("/")[1])
                shutil.move("public/volby/" + volby + "/druhé kolo/" + f, "public/volby/" + volby + "/druhé kolo/" + f.split("/")[1])
        else:
            if not os.path.exists("public/volby/" + volby + "/volebni_mapy.sh"): # ověření, jestli už nedošlo k extrakci
                zf.extract(f, "public/volby/" + volby)
                shutil.move("public/volby/" + volby + "/" + f, "public/volby/" + volby + "/" + f.split("/")[1])

with zipfile.ZipFile(druh_voleb + ".zip") as zf3:
    if not os.path.exists("public/volby/" + volby + "/volebni_mapy.sh") and not os.path.exists("public/volby/" + volby + "/první kolo/volebni_mapy.sh"): # ověření, jestli už nedošlo k extrakci
        zf3.extractall("public/volby/" + volby)

print(druh_voleb)