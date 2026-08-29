#!/bin/bash
echo "MarkO - program na vytváření volebních map: instalátor"
echo
if [ -e  "C:\Program Files\nodejs\node_modules\npm" ]; then
    echo "NPM existuje. Program může pokračovat v instalaci balíčků."
else
    echo "Instaluji npm..."
    winget install -e --id OpenJS.NodeJS
    exit
fi
winget install -e --id python
pip3 install pandas
cd "$(dirname "$0")/../public"
npm install
cd "../příprava"
.windows.bat # není potřeba zaplevelovat proměnnou PATH, stačí, když se to nastrká do základních bash souborů; možná bude potřeba vytvořit konfigurační soubor, v němž by bylo napsáno, zda se používá python3 nebo python, na aliasy bych se moc nespoléhal
cp volby/MarkO.py ../.MarkO.py
cd ..
echo "python3 .MarkO.py" > MarkO.bat