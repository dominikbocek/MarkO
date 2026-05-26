import os
import json

os.chdir("../../")
seznam = os.listdir("sada")
dirs = sorted(seznam)
if ".DS_Store" in dirs:
    dirs.remove(".DS_Store")
print(json.dumps(dirs))
