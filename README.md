
# MarkO - program na vytváření volebních map

Jednoduchý program, který zpracovává okrskové výsledky voleb a vytváří z nich mapy.


## Požadavky
OS:
- Windows 8.1 a novější
- podporované verze macOS
- jakákoliv použitelná linuxová distribuce

Python:
- testováno na verzích 3.9 a novějších

NodeJS
- verze 16 a novější

Prohlížeč
- nejnovější verze kteréhokoliv běžného prohlížeče

Pro Windows:
- emuleční vrstva [Cygwin](https://cygwin.com/setup-x86_64.exe) nebo [GitforWindows](https://gitforwindows.org/)

## Instalace

Pokud používáte Windows, nejprve nainstalujte Gygwin nebo GitforWindows.

Extrahujte zip archiv. Ve složce příprava použijte instalační soubor podle vašeho operačního systému.
## Použití

Program lze používat buď z příkazového řádku nebo z prohlížeče. Zobrazení map je možné pouze v prohlížeči, odkud je možné mapy stahovat.

V kořenové složce po instalaci rozklikněte soubor MarkO.py. Případně v terminálu přejděte do složky public a zadejte příkaz:

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
1. extrahujte vybrané satistiky z archivu sada.zip nebo si stáhněte data z webu [volby.cz](https://volby.cz) (viz manuál)
2. do stejné složky extrahujte data o rozložení okrsků z archivu okrsky.zip
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
## FAQ
Aneb otázky, na které se nikdo neptal.

#### Proč mají každé volby svou vlastní verzi programu?

U jednotlivých druhů voleb jsou rozdílné konvence ve členění dat. Přestože samotné zpracování do map funguje stejně, volby mají odlišnou sadu souborů. Program jejich formát nesjednocuje a zpracovává je v jejich původní podobě. Nejodlišnější jsou prezidentské volby.

Asi by bylo možné sjednotit všechny verze do jedné, ale bylo by to zdlouhavé, náročné a složité, pokud by to bylo vůbec možné.

#### Proč neexistuje samostatná aplikace a je nutné používat prohlížeč?

Nejsem blázen, abych se trápil vytvářeném plnohodnotné aplikace a platil stovky dolarů kvůli certifikátu.

#### Jak to vlastně funguje?

Práci se statistikami má na starosti python knihovna pandas. NodeJS se pak stará o propojení statistických dat a informacích o okrscích a lokální serverové pozadí. A všechno je to dohromady slepeno pomocí Bashe.
## Varování

Tak jako u jiných aplikací je i tento výplod dodáván tak, jak leží a běží bez záruky na cokoliv. I přesto, že byl testován nespočetněkrát, není vyloučeno, že obsahuje chyby.

Autor tohoto projektu neví o programování o nic víc než běžný smrtelník (proto ten zdrojový kód vypadá, jak vypadá), takže zřeknutí se odpovědnosti berte dvojnásob vážně.
