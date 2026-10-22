#!/bin/bash
echo "MarkO - program na vytváření volebních map: instalátor"
echo
cd "$(dirname "$0")/../public"
pip install -r requirements.txt
npm install
PATH=$PATH:"$(pwd)/node_modules/.bin"
cd ..
echo 'python3 příprava/volby/MarkO.py' > MarkO.sh
chmod +x MarkO.sh