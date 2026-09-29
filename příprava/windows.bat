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
        winget install --source=winget -e --id OpenJS.NodeJS
        if %errorLevel% NEQ 0 (
            echo "Při instalaci nastala chyba."
            pause
            exit
        )
    )
    cd "%~dp0\..\public"
    start cmd /c "%programfiles%\nodejs\npm" install
    cd ..
    curl --location https://github.com/git-for-windows/git/releases/download/v2.55.0.windows.5/Git-2.55.0.5-64-bit.exe --output .\gitbash.exe
    set opravneni=administrator
) else (
    echo Uživatel nemá administrátorská práva.
    cd ..
    mkdir "nodeJS"
    curl https://nodejs.org/dist/v24.21.0/node-v24.21.0-win-x64.zip --output .\node-v24.21.0-win-x64.zip
    powershell.exe -executionpolicy bypass -file ".\příprava\soubory instalátoru\extraktor.ps1" "node-v24.21.0-win-x64.zip" ".\nodeJS">nul
    cd "%~dp0\..\public"
    start cmd /c "%~dp0\..\nodeJS\npm" install
    cd ..
    curl --location https://github.com/git-for-windows/git/releases/download/v2.55.0.windows.5/PortableGit-2.55.0.5-64-bit.7z.exe --output gitbash.exe
    set opravneni=standard
)

gitbash.exe

python3 --version >nul
if %errorLevel% NEQ 0 (
    winget install 9NQ7512CXL7T --accept-package-agreements
    rem Python Installation Manager
)

start cmd /c pip3 install pandas
copy "%cd%\příprava\volby\MarkO.py" "%cd%\.MarkO.py"
echo @echo off >> MarkO.bat
echo cls >> MarkO.bat
if %opravneni% == standard (
    setx Path "%Path%;%cd%\nodeJS;%cd%\PortableGit\usr\bin;%cd%\..\public\node_modules\.bin"
)
echo python3 .MarkO.py >> MarkO.bat
echo Program MarkO byl úspěšně nainstalován.
pause
exit