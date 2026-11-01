import argparse
import obvody
import os

# zpracování argumentů
parser = argparse.ArgumentParser()
parser.add_argument('--obec', action="store", dest='obec', required=True)
parser.add_argument('--volby', action="store", dest='volby', required=True)
parser.add_argument('--vratit', action="store", dest='vratit', required=True)
argumenty = parser.parse_args()
obec = int(argumenty.obec)
volby = argumenty.volby
vratit = argumenty.vratit

# jde o místní obvod?
infokod = obvody.infokod(volby, obec)

match vratit:
    case "jestatut":
        if infokod.jestatut:
            print("true")
        else:
            print("false")
    case "kodstatut":
        print(infokod.statut)
    case "jesamospravny":
        if infokod.jesamospravnyobvod:
            print("true")
        else:
            print("false")