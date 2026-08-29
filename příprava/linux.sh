#!/bin/bash
echo "MarkO - program na vytváření volebních map: instalátor"
echo
pip3 install pandas
cd "$(dirname "$0")/../"
mkdir public
mkdir public/volby
cp -r "příprava/icons" "public/icons"
cp -r "příprava/společné" "public/společné"
cp -r "příprava/kořen/." "public/"
cd public
npm install
PATH=$PATH:"$(pwd)/node_modules/.bin"
cp ../příprava/volby/MarkO.py ../.MarkO.py
cd ..
echo 'cd "$(dirname "$(realpath "$0")")"
python3 .MarkO.py' > MarkO.command
chmod +x MarkO.sh