#!/bin/bash
echo "MarkO - program na vytváření volebních map: instalátor"
echo
npm install -g ndjson-cli
npm install -g topojson-server
npm install -g topojson-simplify
npm install -g topojson-client
npm install -g shapefile
npm install -g d3-dsv
pip3 install pandas
cd "$(dirname "$0")/../"
mkdir public
mkdir public/volby
cp -r "příprava/icons" "public/icons"
cp -r "příprava/společné" "public/společné"
cp -r "příprava/kořen/." "public/"
cd public
npm init -y
npm install express
npm install commander
npm install ejs
cp ../příprava/volby/MarkO.py ../MarkO.py
