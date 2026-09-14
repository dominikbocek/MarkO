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
cd "$(dirname "$0")/../"
mkdir public
mkdir public/volby
cp -r "příprava/icons" "public/icons"
cp -r "příprava/společné" "public/společné"
cp -r "příprava/kořen/." "public"
cd public
npm install
.windows.bat
cp ../příprava/volby/MarkO.py ../.MarkO.py
cd ..
echo "python3 .MarkO.py" > MarkO.bat