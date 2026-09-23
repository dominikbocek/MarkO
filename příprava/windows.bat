@echo off
title "MarkO - program na vytváření volebních map: instalátor"
echo "MarkO - program na vytváření volebních map: instalátor"
echo
echo "Kontrola administrátorských oprávnění."
net session >nul 2>&1
if %errorLevel% == 0 (
    echo "Uživatel má administrátorská práva."
    if exist "C:\Program Files\nodejs\node_modules\npm" (
        echo "NPM existuje. Program může pokračovat v instalaci balíčků."
    ) else (
        echo "Instaluji npm..."
        winget install -e --id OpenJS.NodeJS
        if %errorLevel% NEQ 0 (
            echo "Při instalaci nastala chyba."
            pause
            exit
        )
    )
    cd "../public"
    npm install
    cd ..
    powershell -Command "Invoke-WebRequest https://github.com/git-for-windows/git/releases/download/v2.55.0.windows.5/Git-2.55.0.5-64-bit.exe gitbash.exe
) else (
    echo "Uživatel nemá administrátorská práva."
    cd ..
    mkdir "nodeJS"
    powershell -Command "Invoke-WebRequest https://nodejs.org/dist/v24.21.0/node-v24.21.0-win-x64.zip gitbash.exe
    powershell -Command "Expand-Archive -Force nodeJS.zip nodeJS"
    SET PATH=%PATH%;%cd%/nodeJS
    cd public
    npm install
    cd ..
    powershell -Command "Invoke-WebRequest https://github.com/git-for-windows/git/releases/download/v2.55.0.windows.5/PortableGit-2.55.0.5-64-bit.7z.exe gitbash.exe
    gitbash.exe
)

python3 --version >nul
if %errorLevel% NEQ 0 (
    winget install -e --id Python.Python.3.13
)

pip3 install pandas
SET PATH=%PATH%;%~dp0..\public\node_modules\.bin
rem ani nevím, jestli je to vůbec k něčemu dobré a zda to funguje
copy "příprava/volby/MarkO.py" ".MarkO.py"
cd ..
echo "python3 .MarkO.py" > MarkO.bat
echo "Program MarkO byl úspěšně nainstalován."
pause
exit