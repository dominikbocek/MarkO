#!/bin/bash
export PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
echo "MarkO - program na vytváření volebních map: instalátor"
echo
if [ -e "/usr/local/bin/npm" ]; then
    echo "NPM existuje. Program může pokračovat v instalaci balíčků."
else
    echo "NPM neexistuje. Instaluji npm..."
    curl -o "$HOME/nodejs.pkg" https://nodejs.org/dist/v26.13.0/node-v26.13.0.pkg
    cd "$HOME"
    sudo installer -pkg nodejs.pkg -target /
fi
if ! [ -e "/Library/Frameworks/Python.framework" ]; then
    echo "Python neexistuje. Instaluji Python..."
    curl -o "$HOME/python.pkg" https://www.python.org/ftp/python/3.14.5/python-3.14.5-macos11.pkg
    cd "$HOME"
    sudo installer -pkg python.pkg -target /
fi
cd "/Applications/MarkO/"
chmod -R 664 .
find . -name "*.sh" -exec chmod +x \{\} \;
find . -type d -exec chmod 775 \{\} \;
cd "/Applications/MarkO/public"
pip3 install -r requirements.txt
npm install
cd ..
echo 'cd $(dirname $0) && node "public/index.js" menu' > "MarkO.command"
chmod +x "MarkO.command"