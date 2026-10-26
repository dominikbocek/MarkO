#!/bin/bash
echo "MarkO - program na vytváření volebních map: instalátor"
echo
if [ -e "/usr/local/bin/npm" ] || [ -e "$HOME/.nvm/versions/node/" ]; then
    echo "NPM existuje. Program může pokraÄŤovat v instalaci balíčků. Budete několikrát vyzváni k zadání hesla."
else
    echo "NPM neexistuje. Instaluji npm..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash
    \. "$HOME/.nvm/nvm.sh"
    nvm install 24
fi
if ! [ -e "/Library/Frameworks/Python.framework" ]; then
    echo "Python neexistuje. Instaluji Python..."
    curl -o "$HOME/python.pkg" https://www.python.org/ftp/python/3.14.5/python-3.14.5-macos11.pkg
    osascript -e "do shell script \"installer -pkg python.pkg -target /\" with administrator privileges"
fi
cd "/Applications/MarkO/public"
"pip3" install -r requirements.txt
sudo "npm" install
PATH=$PATH:"$(pwd)/node_modules/.bin"
cd ..
echo 'cd $(dirname $0) && node "public/index.js" menu' > "MarkO.command"
chmod +x