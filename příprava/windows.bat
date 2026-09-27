@echo off
chcp 65001 >nul
rem ps1 musí být v utf-8 BOM
title MarkO - program na vytváření volebních map: instalátor
echo MarkO - program na vytváření volebních map: instalátor
powershell.exe -executionpolicy bypass -file ".\soubory instalátoru\instalátor.ps1"
if %errorLevel% NEQ 0 (
    exit 1
)
echo
echo Probíhá instalace. Nezavírejte okno, dokud se instalace nedokončí.
echo
echo Kontrola administrátorských oprávnění.
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Uživatel má administrátorská práva.
    if exist "C:\Program Files\nodejs\node_modules\npm" (
        echo NPM existuje. Program může pokračovat v instalaci balíčků.
    ) else (
        echo "Instaluji npm..."
        winget install -e --id OpenJS.NodeJS
        if %errorLevel% NEQ 0 (
            echo "Při instalaci nastala chyba."
            pause
            exit
        )
    )
    cd "%~dp0\..\public"
    powershell -Command "& '%programfiles%\nodejs\npm' install"
    cd ..
    powershell -Command "Invoke-WebRequest https://github.com/git-for-windows/git/releases/download/v2.55.0.windows.5/Git-2.55.0.5-64-bit.exe -OutFile gitbash.exe"
    set opravneni=administrator
) else (
    echo Uživatel nemá administrátorská práva.
    cd ..
    mkdir "nodeJS"
    powershell -Command "Invoke-WebRequest https://nodejs.org/dist/v24.21.0/node-v24.21.0-win-x64.zip -OutFile nodeJS.zip
    powershell -Command "Expand-Archive -Force nodeJS.zip nodeJS"
    cd "%~dp0\..\public"
    powershell -Command "& '..\nodeJS\node-v24.21.0-win-x64\npm'" install
    cd ..
    powershell -Command "Invoke-WebRequest https://github.com/git-for-windows/git/releases/download/v2.55.0.windows.5/PortableGit-2.55.0.5-64-bit.7z.exe -OutFile gitbash.exe"
    set opravneni=standard
)

gitbash.exe

python3 --version >nul
if %errorLevel% NEQ 0 (
    winget install -e --id Python.Python.3.13
)

pip3 install pandas
rem SET PATH=%PATH%;%~dp0\..\public\node_modules\.bin
rem ani nevím, jestli je to vůbec k něčemu dobré a zda to funguje
copy "%cd%\příprava\volby\MarkO.py" "%cd%\.MarkO.py"
echo @echo off >> MarkO.bat
if %opravneni% == standard (echo SET PATH=%PATH%;%cd%\nodeJS\node-v24.21.0-win-x64\ >> MarkO.bat)
echo python3 .MarkO.py >> MarkO.bat
echo Program MarkO byl úspěšně nainstalován.
pause
exit