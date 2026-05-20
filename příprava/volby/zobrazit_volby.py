import zipfile
import json
import os

os.chdir("../../")
with zipfile.ZipFile("sada.zip", 'r') as zf: # případné opravení do utf-8: zipu -f
    seznam = zf.namelist()
    dirs = list(set([os.path.dirname(x) for x in seznam]))
    dirs = sorted(dirs)
    print(json.dumps(dirs))