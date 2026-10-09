
# MarkO - program na vytváření volebních map

Jednoduchý program, který zpracovává výsledky voleb v ČR a vytváří z nich mapy.

## O programu

Tento program si klade za cíl zpřístupnit možnosti zpracování otevřených statistických dat o volbách v ČR. Jeho hlavní funkcí je graficky znázornit výsledky voleb pomocí map. Napodobuje tak grafiku užívanou v médiích. Původním záměrem bylo znázornění fantomové hranice Protektorátu Čechy a Morava, v průběhu vývoje se však ukázalo, že možných neviditelných hranic je pravděpodobně více.

## Co program umí:
- zpracovává výsledky komunálních, krajských, sněmovních a prezidentských voleb
- vytváří mapy celostátních výsledků s barevným značením vítězů v obcích (sněmovní, krajské a prezidentské volby)
  - umožňuje také zobrazit výsledky na úrovni okrsků v jednotlivých obcích
- vytváří mapy volební účasti
- vytváří mapy voličské podpory pro jednotlivé kandidující subjekty
- umožňuje slučovat výsledky kandidujících subjektů (vytvářet neformální koalice)

#### Jak to vlastně funguje?

Práci se statistikami má na starosti python knihovna pandas. NodeJS se pak stará o propojení statistických dat a informacích o okrscích a lokální serverové pozadí. A všechno je to dohromady slepeno pomocí Bashe.
## Varování

Tak jako u jiných aplikací je i tento výplod dodáván tak, jak leží a běží bez záruky na cokoliv. I přesto, že byl testován nespočetněkrát, není vyloučeno, že obsahuje chyby.

Autor tohoto projektu neví o programování o nic víc než běžný smrtelník (proto ten zdrojový kód vypadá, jak vypadá), takže zřeknutí se odpovědnosti berte dvojnásob vážně.

## Instalace

### Požadavky
OS:
- Windows 8.1 a novější
- podporované verze macOS
- jakákoliv použitelná linuxová distribuce

Python:
- testováno na verzích 3.9 a novějších

NodeJS
- verze 16 a novější

Prohlížeč
- jakákoliv podporovaná verze kteréhokoliv internetového prohlížeče

Pro Windows:
- emuleční vrstva [Cygwin](https://cygwin.com/setup-x86_64.exe) nebo [GitforWindows](https://gitforwindows.org/)

### Automatizovaná instalace (doporučeno)

Ve složce ```příprava``` najdete instalační soubory pro váš systém. Pro Windows a macOS jsou výše zmíněné požadované nástroje zahrnuté do instalačních souborů. U uživatelů linuxových distribucí se předpokládá ruční instalace.

<i>Pozn. instalátor <b>nevyžaduje</b> oprávnění správce (platí pouze pro Windows). Pokud chcete instalaci s oprávněním správce, musíte je vynutit při spuštění instalátoru.</i>

### Ruční instalace

Stáhněte požadovaný software uvedený výše. Přejděte do složky public a spusťte příkazy:
```
npm install
pip install -r requirements.txt
```
Pokud používáte Windows, nainstalujte emulátor Bashe, viz výše.
Přidejte složku node_modules/.bin do systémové proměnné PATH.

## Použití

Program lze používat buď z příkazového řádku nebo z prohlížeče. Zobrazení map je možné pouze v prohlížeči, odkud je možné mapy stahovat.

V kořenové složce poté rozklikněte soubor MarkO.py. Případně v terminálu přejděte do složky public a zadejte příkaz:

```bash
  node index.js
```
Ve výchozím nastavení je server spuštěn na portu 80. Lze změnit takto:
```bash
  node index.js --port <port>
  node index.js -p <port>
```

Můžete případně přidat možnost ```-g``` nebo ```--gui```, čímž automaticky spustíte program v prohlížeči. GUI verze je intuitivní a sama vás navede.

CLI verze:
1.  extrahujte vybrané satistiky z archivu sada.zip nebo si stáhněte data z webu [volby.cz](https://volby.cz) (viz manuál)
2.  do stejné složky extrahujte data o rozložení okrsků z archivu okrsky.zip
3. do stejné složky extrahujte verzi programu pro dané volby
4. přejděte v terminálu do dané složky a zadejte

```bash
  ./volebni_mapy.sh -n
```
Nezapomeňte předtím zadat
```bash
  chmod +x volebni_mapy.sh
```
Poté, co se volby zpracují, se automaticky otevře výsledná mapa ve vašem výchozím prohlížeči.

Ostatní možnosti použití naleznete v manuálu.

## Známé problémy

### Volby před rokem 2006 nejsou kompatibilní
Data k těmto volbám používají jinou strukturu, kterou současná verze programu nedokáže zpracovat

### Chybějící data
Nejsou zveřejněná data k volbám před rokem 2000 do obecních zastupitelstev, Poslanecké sněmovny, České národní rady a Federálního shromáždění. Chybí data k výsledkům refereda o vstupu do Evropské unie. Do roku 2022 ČSÚ nezveřejňoval k výsledkům voleb hranice volebních okrsků, z toho důvodu jsou některé mapy voleb staršího data (zejména před rokem 2017) zkreslené nebo neúplné. Zejména u statutárních měst se samosprávnými městskými částmi může být zobrazení map částečně nebo zcela nefunkční (týká se měst, která svůj statut získala po květnu 2006.)

Pro komunální volby se používají data z roku 2022, pro všechny ostatní z roku 2025. Program počítá do budoucna s rozšířením sady hranic okrsků, pokud se podaří získat příslušná data.