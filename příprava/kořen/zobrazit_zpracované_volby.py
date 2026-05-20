import os
path = "volby"
seznam = []
filtr_slozek = [f for f in os.listdir(path) if os.path.isdir(os.path.join(path, f))]
for d in filtr_slozek:
    if(os.path.isfile(path + "/" + d + "/první kolo/volebni_okrsky-simple-data-topo.json")):
        seznam.append(d + "/první kolo")
    if(os.path.isfile(path + "/" + d + "/druhé kolo/volebni_okrsky-simple-data-topo.json")):
        seznam.append(d + "/druhé kolo")
    if(os.path.isfile(path + "/" + d + "/volebni_okrsky-simple-data-topo.json")):
        seznam.append(d)
print(seznam)