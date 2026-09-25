import os
import sys
import subprocess

verze = subprocess.check_output(["less", ".verze.txt"]).decode()

os.chdir("public")

def runningtheshow(moznost=""):
    try:
        if moznost != "":
            subprocess.run(["node", "index.js", moznost])
        else:
            subprocess.run(["node", "index.js"])
    except KeyboardInterrupt:
        sys.exit("Nascheanou.")

def switch(action):
    match action:
        case 1:
            print("Očekává se spuštění prohlížeče.")
            runningtheshow("--gui")
        case 2:
            print("Spuštěno ve standardním režimu.")
            runningtheshow()
        case 3:
            print("Spuštěno v režimu ladění.")
            runningtheshow("--debug")
        case 4:
            sys.exit("Nascheanou.")
        case _:
            print("Neplatná možnost. Vyberte jinou.")


print(f"MarkO - program na vytváření volebních map, verze {verze}\n")
print("Výčet možností:")

print("1) spustit s grafickým uživatelským rozhraním (doporučeno)")
print("2) spustit bez grafického uživatelského rozhraní (výchozí)")
print("3) spustit v režimu ladění")
print("4) ukončit program (lze též ukončit zkratkou Ctrl C)")
action=int(input("Vyberte možnost:") or 2)
switch(action)