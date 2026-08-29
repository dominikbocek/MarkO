#!/bin/bash
echo "MarkO - program na vytváření volebních map: instalátor"
echo
pip3 install pandas
cd "$(dirname "$0")/../public"
npm install
PATH=$PATH:"$(pwd)/node_modules/.bin"
cp ../příprava/volby/MarkO.py ../.MarkO.py
cd ..
echo 'python3 .MarkO.py' > MarkO.command
chmod +x MarkO.sh