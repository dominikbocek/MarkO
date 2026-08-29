import csv
import json

with open("info.csv", "r", encoding='utf-8') as info:
    ctecka = csv.DictReader(info)

    for radek in ctecka:
        slovnik = {
            "název": radek["NÁZEV"],
            "datum": radek["datum"],
            "druh": radek["druh"]
        }

        with open(f"../sada/{radek["NÁZEV"]}/info.json", "w+", encoding='utf-8') as jsonsoubor:
            json.dump(slovnik, jsonsoubor, ensure_ascii=False, indent=2)