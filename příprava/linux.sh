#!/bin/bash
echo "MarkO - program na vytváření volebních map: instalátor"
echo
pip3 install pandas
pip3 install geopandas
cd "$(dirname "$0")/../public"
npm install
PATH=$PATH:"$(pwd)/node_modules/.bin"
cp ../příprava/volby/MarkO.py ../.MarkO.py
cd ..
echo 'python3 .MarkO.py' > MarkO.sh
chmod +x MarkO.sh