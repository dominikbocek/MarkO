import glob
soubory = glob.glob("*.csv")
cisla = []
for soubor in soubory:
    cisla.append(soubor.split(".")[0])
print("cisla = " + str(cisla) + "\ncisla = cisla.map(Number)\ncisla.sort(function(a, b) {return a - b;});")