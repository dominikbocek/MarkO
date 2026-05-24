import os
import sys
import subprocess

os.chdir("public")

def switch(action):
    if action==1:
        subprocess.run(["node", "index.js", "--gui"])
    elif action==2:
        subprocess.run(["node", "index.js"])
    else:
        sys.exit("Nascheanou.")


print("MarkO - program na vytváření volebních map\n")
print("Výčet možností:")

print("1) spustit s grafickým uživatelským rozhraním (doporučeno)")
print("2) spustit bez grafického uživatelského rozhraní (výchozí)")
print("3) ukončit program (lze též ukončit zkratkou Ctrl C)")
action=int(input("Vyberte možnost:") or 2)
if action not in [1,2,3]:
    print("Neplatná možnost. Vyberte jinou.")
else:
    switch(action)
