
# MarkO - program na vytváření volebních map

Jednoduchý program, který zpracovává výsledky voleb v ČR a vytváří z nich mapy.

## O programu

Tento program si klade za cíl zpřístupnit možnosti zpracování otevřených statistických dat o volbách v ČR. Jeho hlavní funkcí je graficky znázornit výsledky voleb pomocí map. Napodobuje tak grafiku užívanou v médiích. Původním záměrem bylo znázornění fantomové hranice Protektorátu Čechy a Morava, v průběhu vývoje se však ukázalo, že možných neviditelných hranic je pravděpodobně více. Program není nijak spjat s Českým statistickým úřadem ani jinou státní a veřejnou institucí. Výstupy si VŽDY ověřte s výsledky na stránkách [volby.cz](https://volby.cz)

## Co program umí:
- zpracovává výsledky komunálních, krajských, sněmovních a prezidentských voleb
- vytváří mapy celostátních výsledků s barevným značením vítězů v obcích (sněmovní, krajské a prezidentské volby)
  - umožňuje také zobrazit výsledky na úrovni okrsků v jednotlivých obcích
- vytváří mapy volební účasti
- vytváří mapy voličské podpory pro jednotlivé kandidující subjekty
- umožňuje slučovat výsledky kandidujících subjektů (vytvářet neformální koalice)

#### Jak to vlastně funguje?

Z otevřených dat výsledků voleb se vytvoří soubor souhrnných statistik o hlasech pro kandidující subjekty. Každý subjekt má vlastní identifikátor uvedený v seznamu kandidujících subjektů. Souhrnné statistiky obsahují výsledky jednak na úrovni volebních okrsků a jednak na úrovni obcí. Statistiky jsou pak přiřazeny k souřadnicím polohy daných okrsků/obcí. V případě map vítězů každý volební subjekt získá vlastní barvu na základě svého umístění podle počtu hlasů v dané obci/okrsku. Okrsek/obec se zbarví podle subjektu, který na daném území získal nejvíce hlasů.

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

### Instalace
Instalátory pro Windows a macOS [zde](https://github.com/dominikbocek/MarkO/releases). Linux: viz ruční instalace.

### Ruční instalace
Pro případ, že instalátor selže.

Stáhněte zdrojový kód a požadovaný software uvedený výše. Přejděte do složky public a spusťte příkazy:
```
npm install
pip install -r requirements.txt
```
Pokud používáte Windows, nainstalujte emulátor Bashe, viz výše. Nezapomeňte v případě přenosné (portable) verze přidat cestu do systémové proměnné PATH.
<b style="color: red">NEPOUŽÍVEJTE</b> WSL (Windows Subsystem for Linux).

## Použití

Program lze používat buď z příkazového řádku nebo z prohlížeče. Zobrazení map je možné pouze v prohlížeči, odkud je možné mapy stahovat.

### Grafická verze

V kořenovém adresáři (ve složce, v níž se program nachází) rozklikněte soubor MarkO (v závislosti na systému bude mít různou příponu). Vyberte možnost z nabídky zmáčknutím čísla a stiskněte enter. Poté přejděte na adresu [localhost](http://localhost). Pokud jste ppostupovali správně, objeví se uvítací obrazovka. Po stisknutí tlačíka Začít si z rozbalovacího seznamu vyberete volby, jejichž mapu chcete vytvořit. Jakmile bude zpracování dokončeno, program vás odkáže na stránku s mapou.

### CLI verze

```bash
  node public/index.js
```
Ve výchozím nastavení je server spuštěn na portu 80. Lze změnit takto:
```bash
  node public/index.js --port <port>
  node public/index.js -p <port>
```

Můžete případně přidat možnost ```-g``` nebo ```--gui```, čímž automaticky spustíte program v prohlížeči. GUI verze je intuitivní a sama vás navede.

CLI verze:
1. Extrahujte vybrané satistiky z archivu sada.zip (ke stažení [zde](https://github.com/dominikbocek/MarkO/releases/tag/2.0.0-beta.5)) do složky sada v kořenovém adresáři nebo si stáhněte data z webu [volby.cz](https://volby.cz)
2. Do stejné složky extrahujte data o rozložení okrsků z archivu okrsky.zip (ke stažení [zde](https://github.com/dominikbocek/MarkO/releases/tag/2.0.0-beta.5)) do složky okrsky v kořenovém adresáři
3. Každý druh voleb má dedikovanou vlastní verzi programu. Přejděte do složky podle vybraného druhu voleb a pro zobrazení nápovědy zadejte:

```bash
  ./volebni_mapy.sh
```

## Známé problémy

### Chybějící data
Aktuálně chybí otevřená data k volbám před rokem 2000. Toto omezení se týká voleb do obecních zastupitelstev, Poslanecké sněmovny, České národní rady a Federálního shromáždění. Chybí data k výsledkům referenda o vstupu do Evropské unie. Český statistický úřad nemá v dohledné době v plánu jejich zveřejnění. Do roku 2022 ČSÚ nezveřejňoval k výsledkům voleb hranice volebních okrsků, z toho důvodu jsou některé mapy voleb staršího data (zejména před rokem 2017) zkreslené nebo neúplné. Český úřad zeměměřičský a katastrální poskytuje veřejně pouze nejnovější údaje. V případě stažení dat RÚIANu proto může být zkreslení výraznější. Zejména u statutárních měst se samosprávnými městskými částmi může být zobrazení map částečně nebo zcela nefunkční. Pro komunální volby se používají data z roku 2022, pro všechny ostatní z roku 2025.

### Různé
U komunálních voleb se ve výchozím stavu zpracovávají výsledky voleb z řádného termínu.

Volby před rokem 2006 nejsou kompatibilní s verzí programu 1.0.0 až 1.0.3.
