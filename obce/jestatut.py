import argparse
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
with open(f"{os.path.dirname(os.path.realpath(__file__))}\\obvody.py") as obvody:
    code = obvody.read()
exec(code)

match vratit:
    case "jestatut":
        if jestatut:
            print("true")
        else:
            print("false")
    case "kodstatut":
        print(statut)
    case "jesamospravny":
        if jesamospravnyobvod:
            print("true")
        else:
            print("false")