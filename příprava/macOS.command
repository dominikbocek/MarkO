#!/bin/bash
echo "MarkO - program na vytváření volebních map: instalátor"
echo
if [ -e "/usr/local/bin/npm" ] || [ -e "$HOME/.nvm/versions/node/" ]; then
    echo "NPM existuje. Program může pokračovat v instalaci balíčků. Budete několikrát vyzváni k zadání hesla."
else
    echo "NPM neexistuje. Instaluji npm..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash
    \. "$HOME/.nvm/nvm.sh"
    nvm install 24
fi
osascript -e "do shell script \"npm install -g ndjson-cli\" with administrator privileges"
osascript -e "do shell script \"npm install -g topojson-server\" with administrator privileges"
osascript -e "do shell script \"npm install -g topojson-simplify\" with administrator privileges"
osascript -e "do shell script \"npm install -g topojson-client\" with administrator privileges"
osascript -e "do shell script \"npm install -g shapefile\" with administrator privileges"
osascript -e "do shell script \"npm install -g d3-dsv\" with administrator privileges"
if [ -e "/Library/Frameworks/Python.framework" ]; then
    echo "Python existuje. Připravte si bambusy, jdeme na pandy."
    osascript -e "do shell script \"pip3 install pandas\" with administrator privileges"
else
    echo "Python neexistuje. Instaluji Python..."
    curl -o python.pkg https://www.python.org/ftp/python/3.14.5/python-3.14.5-macos11.pkg
    osascript -e "do shell script \"installer -pkg python.pkg -target /\" with administrator privileges"
    osascript -e "do shell script \"pip3 install pandas\" with administrator privileges"
fi
cd "$(dirname "$0")/../"
mkdir public
mkdir public/volby
cp -r "příprava/icons" "public/icons"
cp -r "příprava/společné" "public/společné"
cp -r "příprava/kořen/." "public"
cd public
npm init -y
osascript -e "do shell script \"npm install express\" with administrator privileges"
osascript -e "do shell script \"npm install commander\" with administrator privileges"
osascript -e "do shell script \"npm install ejs\" with administrator privileges"
cp ../příprava/volby/MarkO.py ../MarkO.py
