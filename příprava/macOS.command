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
if [ -e "/Library/Frameworks/Python.framework" ]; then
    echo "Python existuje. Připravte si bambusy, jdeme na pandy."
    osascript -e "do shell script \"pip3 install pandas\" with administrator privileges"
else
    echo "Python neexistuje. Instaluji Python..."
    curl -o python.pkg https://www.python.org/ftp/python/3.14.5/python-3.14.5-macos11.pkg
    osascript -e "do shell script \"installer -pkg python.pkg -target /\" with administrator privileges"
    osascript -e "do shell script \"pip3 install pandas\" with administrator privileges"
fi
cd "$(dirname "$0")/../public"
osascript -e "do shell script \"npm install\" with administrator privileges"
PATH=$PATH:"$(pwd)/node_modules/.bin"
cp ../příprava/volby/MarkO.py ../.MarkO.py
cd ..
echo 'python3 .MarkO.py' > MarkO.command
chmod +x MarkO.command