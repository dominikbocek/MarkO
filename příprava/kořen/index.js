const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { Command } = require('commander');
const program = new Command();
const app = express();

program
  .name('MarkO - program na vytváření volebních map')
  .description('Tato část slouží pouze ke spuštění lokálního serveru. Hlavní program najdete ve složkách pro jednotlivé volby.')
  .version('1.0.0');

program
  .option('-p, --port <type>', 'port, na kterém server poběží, ve výchozím stavu je použit port 80', '80')
  .option('-g, --gui', 'spustí grafickou verzi v prohlížeči')
  .action((options) => {
    global.port = `${options.port}`;
  });

program.parse(process.argv);
global.options = program.opts();

function prohlizec() {
        if(global.options.gui) {
        console.log("Program se spustí ve vašem výchozím prohlížeči. Pokud se tak nestane, zadejte do prohlížeče RUČNĚ adresu 127.0.0.1")
        exec(`python3 -m webbrowser http://127.0.0.1:${port}/`)
        }
}

program.parse();

var bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(express.static(__dirname))

// endpoint, který spustí bash script
app.post('/vypsat-volby', (req, res) => {
    exec('cd ../příprava/volby && python3 zobrazit_volby.py', (error, stdout, stderr) => {
        if (error) {
            console.error(`MarkO: program na vytváření volebních map\nVýpis posledního chybového hlášení (${Date()}):\n${error.message}`);
            return res.status(500).send('chyba při spuštění skriptu');
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
        }
        res.send(`${stdout}`);
    });
});

app.post('/extrahovat', (req, res) => {
    req.body;
    volby = req.body.volby;
    exec(`cd ../příprava/volby && python3 extrahovat_volby.py --volby="${volby}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`MarkO: program na vytváření volebních map\nVýpis posledního chybového hlášení (${Date()}):\n${error.message}`);
            return res.status(500).send('chyba při spuštění skriptu');
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
        }
        var bezenteru = stdout.replace("\r", "")
        var bezenteru = bezenteru.replace("\n", "")
        if(bezenteru == "druh_voleb = 'žádné'") {
            return res.status(500).send('žádná volební data nebyla detekována');
        }
        res.send(`${bezenteru}`);
    });
});

app.post('/okrskove-mapy', (req, res) => {
    req.body;
    volby = req.body.volby;
    kolo = req.body.kolo //pouze pro prezidentské volby
    prezident = kolo //pouze pro prezidentské volby
    if (kolo == "1") {prezident = "první kolo"} else if (kolo == "2") {prezident = "druhé kolo"}
    if(!fs.existsSync(`${__dirname}/volby/${volby}/${prezident}/volebni_okrsky-simple-data-topo.json`)) {
        exec(`cd "volby/${volby}/${prezident}" && bash ./volebni_mapy.sh -n`, (error, stdout, stderr) => {
            if (error) {
                console.error(`MarkO: program na vytváření volebních map\nVýpis posledního chybového hlášení (${Date()}):\n${error.message}`);
                return res.status(500).send('chyba při spuštění skriptu');
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
            res.send(`Vytvoření mapy dokončeno. Pro zobrazení klikněte <a href="volby/${volby}/${prezident}/" target="_blank">sem</a>.`);
        });
    } else {
        res.send(`Mapa okrskových vítězů pro tyto volby už existuje. Pro zobrazení klikněte <a href="volby/${volby}/${prezident}/" target="_blank">sem</a>.`)
    }
});

app.post('/kandidujici-subjekty', (req, res) => {
    req.body;
    volby = req.body.volby;
    druh_voleb = req.body.druh_voleb
    seznam = req.body.seznam
    druh_map = req.body.druh_map
    kolo = req.body.kolo
    prezident = "."
    if (kolo == "1") {prezident = "první kolo"} else if (kolo == "2") {prezident = "druhé kolo"}
    if(druh_map == "vítězné") {
        command = `cd "volby/${volby}/${prezident}" && bash ./volebni_mapy.sh -s "základ+koalice" ano`
    } else if(druh_map == "samostatné") {
        command = `cd "volby/${volby}/${prezident}" && bash ./volebni_mapy.sh -s "všechno" ano`
    }
    if (druh_voleb == "prezident") {prezident = "první kolo"}
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`MarkO: program na vytváření volebních map\nVýpis posledního chybového hlášení (${Date()}):\n${error.message}`);
            return res.status(500).send('chyba při spuštění skriptu');
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
        }
        res.send(`${stdout}`);
    });
});

app.post('/samostatne-mapy', (req, res) => {
    req.body;
    volby = req.body.volby;
    cisla = req.body.cisla
    druh_voleb = req.body.druh_voleb
    kolo = req.body.kolo
    prezident = "."
    if (kolo == "1") {prezident = "první kolo"} else if (kolo == "2") {prezident = "druhé kolo"}
    // opatření pro druhé kolo, protože verze programu je osekaná až na kost
    if (kolo == "2") {command = `cd "volby/${volby}/${prezident}" && bash ./samostatne.sh -n`}
    else {command = `cd "volby/${volby}/${prezident}" && bash ./samostatne.sh -k "${cisla}" ano`}
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`MarkO: program na vytváření volebních map\nVýpis posledního chybového hlášení (${Date()}):\n${error.message}`);
            return res.status(500).send('chyba při spuštění skriptu');
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
        }
        res.send(`Vytvoření map dokončeno. Pro zobrazení klikněte <a href="volby/${volby}/${prezident}/samostatné/" target="_blank">sem</a>.`);
    });
});

app.post('/koalice', (req, res) => {
    req.body;
    druh_voleb = req.body.druh_voleb;
    cisla = req.body.cisla
    druh_map = req.body.druh_map
    volby = req.body.volby
    nazev_koalice = req.body.nazev_koalice
    zkratka_koalice = req.body.zkratka_koalice
    prezident = "."
    if (druh_voleb == "prezident") {prezident = "první kolo"}
    if (druh_map == "vítězné") {
        command = `cd "volby/${volby}/${prezident}" && bash ./volebni_mapy.sh -k "${cisla}" "${nazev_koalice}" "${zkratka_koalice}"`
        odpoved = `Vytvoření mapy dokončeno. Pro zobrazení klikněte <a href="volby/${volby}/${prezident}/?koalice" target="_blank">sem</a>.`
    } else if (druh_map == "samostatné") {
        command = `cd "volby/${volby}/${prezident}" && bash ./volebni_mapy.sh -koalice-samostatne "${cisla}" "${nazev_koalice}" "${zkratka_koalice}"`
        odpoved = `Vytvoření mapy dokončeno. Pro zobrazení klikněte <a href="volby/${volby}/${prezident}/samostatné/" target="_blank">sem</a>.`
    }
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`MarkO: program na vytváření volebních map\nVýpis posledního chybového hlášení (${Date()}):\n${error.message}`);
            return res.status(500).send('chyba při spuštění skriptu');
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
        }
        res.send(odpoved);
    });
});

app.engine('html', require('ejs').renderFile);
app.get("/seznam_voleb", (req, res) => {
    exec(`python3 zobrazit_zpracované_volby.py`, (error, stdout, stderr) => {
        if (error) {
            console.error(`MarkO: program na vytváření volebních map\nVýpis posledního chybového hlášení (${Date()}):\n${error.message}`);
            return res.status(500).send('chyba při spuštění skriptu');
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
        }
        const seznam = stdout
        res.render(__dirname + "/seznam.html", {seznam:seznam});
    })
})


app.get('/volby/:volby/:kolo/', (req, res) => {
    req.acceptsCharsets('utf-8')
    if (fs.existsSync(`${__dirname}/volby/${req.params.volby}/první kolo/`)) {
        res.sendFile(path.join(__dirname, '../public/společné', 'index.html'));
    } else {
        res.sendFile(path.join(__dirname, '../public/společné', 'index-samostatne.html'));
    }
});

app.get('/volby/:volby/:kolo/samostatn%C3%A9/', (req, res) => {
    req.acceptsCharsets('utf-8')
    res.sendFile(path.join(__dirname, '../public/společné', 'index-samostatne.html'));
});

app.get('/volby/:volby/', (req, res) => {
    req.acceptsCharsets('utf-8')
    if (!fs.existsSync(`${__dirname}/volby/${req.params.volby}/první kolo/`)) {
        res.sendFile(path.join(__dirname, '../public/společné', 'index.html'));
    } else {res.status(404).sendFile(path.join(__dirname, '../public/společné', '404.html'))}
})

app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, '../public/společné', '404.html'))
})


app.listen(port, () => {
    console.log(`Server běží na http://localhost:${port}`);
    prohlizec()
});
