import json

# Load both JSON files
with open('vysledky_cr.json', 'r', encoding='utf-8') as f:
    vysledky = json.load(f)

with open('candidates.json', 'r', encoding='utf-8') as f:
    parties = json.load(f)

# Get first 10 items from vysledky_cr.json
first_10 = vysledky[:9]

# Create a mapping of VSTRANA to color
color_map = {item['CKAND']: item['color'] for item in first_10}

# Update parties.json with colors based on VSTRANA match
for key, party in parties.items():
    ckand = party.get('CKAND')
    if ckand in color_map:
        party['color'] = color_map[ckand]

# Save updated parties.json
with open('candidates.json', 'w', encoding='utf-8') as f:
    json.dump(parties, f, ensure_ascii=False, indent=2)

print("Barvy byly úspěšně překopírovány!")
