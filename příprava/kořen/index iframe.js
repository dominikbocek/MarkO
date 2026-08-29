const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec, execSync } = require('child_process');
const { Command } = require('commander');
const program = new Command();
const app = express();
app.engine('html', require('ejs').renderFile);

program
  .name('MarkO - program na vytváření volebních map')
  .description('Tato část slouží pouze ke spuštění lokálního serveru. Hlavní program najdete ve složkách pro jednotlivé volby.')
  .version('2.0.0');

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

// zachytávání url adres

app.get("/", (req, res, next) => {
    res.render(`${__dirname}/index.html`)
})

app.get("/info", (req, res, next) => {
    res.render(`${__dirname}/info.html`)
})

app.use(express.static(__dirname))

function nacistJSON(volby) {
    return (JSON.parse(fs.readFileSync(`${__dirname}/../sada/${volby}/info.json`).toString()))
}

app.post('/vypsat-volby', (req, res, next) => {
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


/////////////////////////////////////
// SEKCE ZRACOVÁNÍ VÝSLEDKŮ VOLEB //
///////////////////////////////////

// lockfile: https://stackoverflow.com/a/185473

app.post('/okrskove-mapy', (req, res, next) => {
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

app.post('/kandidujici-subjekty', (req, res, next) => {
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

app.post('/samostatne-mapy', (req, res, next) => {
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

app.post('/koalice', (req, res, next) => {
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

app.get("/seznam_voleb", (req, res, next) => {
    var seznam = execSync(`python3 zobrazit_zpracované_volby.py`, (error, stdout, stderr) => {
            if (error) {
                console.error(`MarkO: program na vytváření volebních map\nVýpis posledního chybového hlášení (${Date()}):\n${error.message}`);
                return res.status(500).send('chyba při spuštění skriptu');
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
        })
    var cesty = execSync(`python3 zobrazit_zpracované_volby.py --cesta ano`, (error, stdout, stderr) => {
        if (error) {
            console.error(`MarkO: program na vytváření volebních map\nVýpis posledního chybového hlášení (${Date()}):\n${error.message}`);
            return res.status(500).send('chyba při spuštění skriptu');
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
        }
    })
    var mapy_koalic = []
    var samostatne_mapy = []

    seznam = eval(seznam.toString())
    cesty = eval(cesty.toString())

    cesty.forEach(element => {
        if(fs.existsSync(`${__dirname}/volby/${element}/samostatné/`)) {
            samostatne_mapy.push("mapy voličské podpory")
        } else {
            samostatne_mapy.push("")
        }

        if(fs.existsSync(`${__dirname}/volby/${element}/volebni_okrsky-simple-data-topo2.json`)) {
            mapy_koalic.push("koalice")
        } else {
            mapy_koalic.push("")
        }
    });

    res.render(__dirname + "/seznam.html", {seznam:seznam, mapy_koalic:mapy_koalic, samostatne_mapy:samostatne_mapy});
})


/////////////////////////////////////
// SEKCE ZOBRAZENÍ VÝSLEDKŮ VOLEB //
///////////////////////////////////


/////////////////////////
// prezidentské volby //
///////////////////////

app.get('/volby/:volby/:kolo/vitez', (req, res, next) => {
    req.acceptsCharsets('utf-8')
    if ((req.params.kolo == "první kolo" || req.params.kolo == "druhé kolo") && (fs.existsSync(`${__dirname}/volby/${req.params.volby}/${req.params.kolo}/`))) {
        const info = nacistJSON(req.params.volby)
        return res.render(`${__dirname}/společné/mapy/prohlížeč.ejs`, {volby:req.params.volby, info:info, typzobrazeni:"normální"});
    } else if(req.params.dalsi == "samostatné") {
        const info = nacistJSON(req.params.volby)
        return res.render(`${__dirname}/společné/mapy/prohlížeč.ejs`, {volby:req.params.volby, info:info, typzobrazeni:"samostatné"});
    }

    return next();
});

app.get('/volby/:volby/:kolo/samostatn%C3%A9/', (req, res, next) => {
    req.acceptsCharsets('utf-8')
    const info = nacistJSON(req.params.volby)
    return res.render(`${__dirname}/společné/mapy/prohlížeč.ejs`, {volby:req.params.volby, info:info, typzobrazeni:"samostatné"});
});

app.get('/volby/:volby/:kolo/ucast', (req, res, next) => {
    req.acceptsCharsets('utf-8')
    const info = nacistJSON(req.params.volby)
    return res.render(`${__dirname}/společné/mapy/prohlížeč.ejs`, {volby:req.params.volby, info:info, typzobrazeni:"účast"});
});

app.get('/volby/:volby/:kolo/mapy/:druhmapy', (req, res, next) => {
    req.acceptsCharsets('utf-8')
    const info = nacistJSON(req.params.volby)
    return res.render(`${__dirname}/společné/mapa.html`, {volby:req.params.volby, kolo:req.params.kolo, info:info, druhmapy:req.params.druhmapy});
})

//////////////////////
// komunální volby //
////////////////////

// bežná/statutární zastupitelstva

app.get('/volby/:volby/obce/:obec/', (req, res, next) => {
    req.acceptsCharsets('utf-8')
    if(fs.existsSync(`${__dirname}/volby/${req.params.volby}/obce/${req.params.obec}/${req.params.obec}.csv`)) {
        let info = nacistJSON(req.params.volby)

        let info_obec = execSync(`python3 "${__dirname}/../obce/vypsat_obce.py" --volby "${req.params.volby}" --vyhledatobec "${req.params.obec}" --json ano`, (error, stdout, stderr) => {
            if (error) {
                console.error(`MarkO: program na vytváření volebních map\nVýpis posledního chybového hlášení (${Date()}):\n${error.message}`);
                return res.status(500).send('chyba při spuštění skriptu');
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
        })

        info_obec = JSON.parse(info_obec.toString())

        info.lokalita = info_obec
        info.lokalita.druh = "obec"

        return res.render(`${__dirname}/společné/mapa.html`, {volby:req.params.volby, info:info, typzobrazeni:"normální"});
    }
    
    return next();
})

app.get('/volby/:volby/obce/:obec/mapy', (req, res, next) => {
    req.acceptsCharsets('utf-8')
    if(fs.existsSync(`${__dirname}/volby/${req.params.volby}/obce/${req.params.obec}/${req.params.obec}.csv`)) {
        const seznam_obvodu = execSync(`python3 "../obce/seznam_obvodů.py" --volby "${req.params.volby}" --obec "${req.params.obec}"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`MarkO: program na vytváření volebních map\nVýpis posledního chybového hlášení (${Date()}):\n${error.message}`);
                return res.status(500).send('chyba při spuštění skriptu');
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
        })

        let info_obec = execSync(`python3 "${__dirname}/../obce/vypsat_obce.py" --volby "${req.params.volby}" --vyhledatobec "${req.params.obec}" --json ano`, (error, stdout, stderr) => {
            if (error) {
                console.error(`MarkO: program na vytváření volebních map\nVýpis posledního chybového hlášení (${Date()}):\n${error.message}`);
                return res.status(500).send('chyba při spuštění skriptu');
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
        })

        let info = nacistJSON(req.params.volby)

        seznam_nazvu_obvodu = execSync(`python3 "../obce/seznam_obvodů.py" --volby "${req.params.volby}" --obec "${req.params.obec}" --vypsat "název"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`MarkO: program na vytváření volebních map\nVýpis posledního chybového hlášení (${Date()}):\n${error.message}`);
                return res.status(500).send('chyba při spuštění skriptu');
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
        })

        seznam_obvodu = eval(seznam_obvodu.toString())

        seznam_nazvu_obvodu = eval(seznam_nazvu_obvodu.toString())

        info_obec = JSON.parse(info_obec.toString())

        info.lokalita = info_obec
        info.lokalita.druh = "obec"

        return res.render(path.join(__dirname, '../public/společné', 'rozcestník-map.html'), {obvody:seznam_obvodu, nazvy:seznam_nazvu_obvodu, info:info});
    
    }
    
    return next();
})

app.get('/volby/:volby/obce/:obec/ucast', (req, res, next) => {
    req.acceptsCharsets('utf-8')
    if(fs.existsSync(`${__dirname}/volby/${req.params.volby}/obce/${req.params.obec}/${req.params.obec}.csv`)) {
        
        //title a popisek mapy
        let info_obec = execSync(`python3 "${__dirname}/../obce/vypsat_obce.py" --volby "${req.params.volby}" --vyhledatobec "${req.params.obec}" --json ano`, (error, stdout, stderr) => {
            if (error) {
                console.error(`MarkO: program na vytváření volebních map\nVýpis posledního chybového hlášení (${Date()}):\n${error.message}`);
                return res.status(500).send('chyba při spuštění skriptu');
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
        })

        let info = nacistJSON(req.params.volby)

        info_obec = JSON.parse(info_obec.toString())

        info.lokalita = info_obec
        info.lokalita.druh = "obec"

        return res.render(`${__dirname}/společné/mapa.html`, {volby:req.params.volby, info:info, typzobrazeni:"účast"});
    }
    
    return next();
})

app.get('/volby/:volby/obce/:obec/samostatn%C3%A9/', (req, res, next) => {
    req.acceptsCharsets('utf-8')
    if(fs.existsSync(`${__dirname}/volby/${req.params.volby}/obce/${req.params.obec}/${req.params.obec}.csv`)) {
        let info = nacistJSON(req.params.volby)

        //title a popisek mapy
        let info_obec = execSync(`python3 "${__dirname}/../obce/vypsat_obce.py" --volby "${req.params.volby}" --vyhledatobec "${req.params.obec}" --json ano`, (error, stdout, stderr) => {
            if (error) {
                console.error(`MarkO: program na vytváření volebních map\nVýpis posledního chybového hlášení (${Date()}):\n${error.message}`);
                return res.status(500).send('chyba při spuštění skriptu');
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
        })

        info_obec = JSON.parse(info_obec.toString())

        info.lokalita = info_obec
        info.lokalita.druh = "obec"

        return res.render(`${__dirname}/společné/mapa.html`, {volby:req.params.volby, info:info, typzobrazeni:"samostatné"});
    
    }
    
    return next();
})

//komunální zastupitelstva - samosprávné obvody/městské části

app.get('/volby/:volby/obce/:obec/:obvod/', (req, res, next) => {
    req.acceptsCharsets('utf-8')
    if(fs.existsSync(`${__dirname}/volby/${req.params.volby}/obce/${req.params.obec}/${req.params.obvod}/${req.params.obvod}.csv`)) {
        let info = nacistJSON(req.params.volby)

        //title a popisek mapy
        let info_obec = execSync(`python3 "${__dirname}/../obce/vypsat_obce.py" --volby "${req.params.volby}" --vyhledatobec "${req.params.obvod}" --json ano`, (error, stdout, stderr) => {
            if (error) {
                console.error(`MarkO: program na vytváření volebních map\nVýpis posledního chybového hlášení (${Date()}):\n${error.message}`);
                return res.status(500).send('chyba při spuštění skriptu');
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
        })

        info_obec = JSON.parse(info_obec.toString())

        info.lokalita = info_obec
        info.lokalita.druh = "obvod"

        return res.render(`${__dirname}/společné/mapa.html`, {volby:req.params.volby, info:info, typzobrazeni:"normální"});
    }
    
    return next();
})

app.get('/volby/:volby/obce/:obec/:obvod/mapy', (req, res, next) => {
    req.acceptsCharsets('utf-8')
    if(fs.existsSync(`${__dirname}/volby/${req.params.volby}/obce/${req.params.obec}/${req.params.obvod}/${req.params.obvod}.csv`)) {
        let seznam_obvodu = execSync(`python3 "../obce/seznam_obvodů.py" --volby "${req.params.volby}" --obec "${req.params.obvod}"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`MarkO: program na vytváření volebních map\nVýpis posledního chybového hlášení (${Date()}):\n${error.message}`);
                return res.status(500).send('chyba při spuštění skriptu');
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
        })

        let info_obec = execSync(`python3 "${__dirname}/../obce/vypsat_obce.py" --volby "${req.params.volby}" --vyhledatobec "${req.params.obvod}" --json ano`, (error, stdout, stderr) => {
            if (error) {
                console.error(`MarkO: program na vytváření volebních map\nVýpis posledního chybového hlášení (${Date()}):\n${error.message}`);
                return res.status(500).send('chyba při spuštění skriptu');
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
        })

        let info = nacistJSON(req.params.volby)

        info_obec = JSON.parse(info_obec.toString())

        info.lokalita = info_obec
        info.lokalita.druh = "obvod"
    
        seznam_obvodu = eval(seznam_obvodu.toString())

        return res.render(path.join(__dirname, '../public/společné', 'rozcestník-map.html'), {obvody:seznam_obvodu, info:info});
    }
    
    return next();
})

app.get('/volby/:volby/obce/:obec/:obvod/ucast', (req, res, next) => {
    req.acceptsCharsets('utf-8')
    if(fs.existsSync(`${__dirname}/volby/${req.params.volby}/obce/${req.params.obec}/${req.params.obvod}/${req.params.obvod}.csv`)) {
        
        //title a popisek mapy
        let info_obec = execSync(`python3 "${__dirname}/../obce/vypsat_obce.py" --volby "${req.params.volby}" --vyhledatobec "${req.params.obvod}" --json ano`, (error, stdout, stderr) => {
            if (error) {
                console.error(`MarkO: program na vytváření volebních map\nVýpis posledního chybového hlášení (${Date()}):\n${error.message}`);
                return res.status(500).send('chyba při spuštění skriptu');
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
        })

        let info = nacistJSON(req.params.volby)

        info_obec = JSON.parse(info_obec.toString())

        info.lokalita = info_obec
        info.lokalita.druh = "obvod"
        
        return res.render(`${__dirname}/společné/mapa.html`, {volby:req.params.volby, info:info, typzobrazeni:"účast"});
    }
    
    return next();
})

app.get('/volby/:volby/obce/:obec/:obvod/samostatn%C3%A9/', (req, res, next) => {
    req.acceptsCharsets('utf-8')
    if(fs.existsSync(`${__dirname}/volby/${req.params.volby}/obce/${req.params.obec}/${req.params.obvod}/${req.params.obvod}.csv`)) {
        let info = nacistJSON(req.params.volby)

        //title a popisek mapy
        let info_obec = execSync(`python3 "${__dirname}/../obce/vypsat_obce.py" --volby "${req.params.volby}" --vyhledatobec "${req.params.obvod}" --json ano`, (error, stdout, stderr) => {
            if (error) {
                console.error(`MarkO: program na vytváření volebních map\nVýpis posledního chybového hlášení (${Date()}):\n${error.message}`);
                return res.status(500).send('chyba při spuštění skriptu');
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
        })

        info_obec = JSON.parse(info_obec.toString())

        info.lokalita = info_obec
        info.lokalita.druh = "obvod"

        return res.render(`${__dirname}/společné/mapa.html`, {volby:req.params.volby, info:info, typzobrazeni:"samostatné"});
    }
    
    return next();
})

///////////////////////////////
// krajské a sněmovní volby //
/////////////////////////////

app.get('/volby/:volby/', (req, res, next) => {
    req.acceptsCharsets('utf-8')
    if (!fs.existsSync(`${__dirname}/volby/${req.params.volby}/první kolo/`)) {
        let info = nacistJSON(req.params.volby)

        return res.render(`${__dirname}/společné/mapa.html`, {volby:req.params.volby,info:info, typzobrazeni:"normální"});
    }
    
    return next();
})

app.get('/volby/:volby/samostatn%C3%A9', (req, res, next) => {
    req.acceptsCharsets('utf-8')
    const info = nacistJSON(req.params.volby)
    return res.render(`${__dirname}/společné/mapa.html`, {volby:req.params.volby,info:info, typzobrazeni:"samostatné"});
    
    return next();
})

app.get('/volby/:volby/ucast', (req, res, next) => {
    req.acceptsCharsets('utf-8')
    const info = nacistJSON(req.params.volby)
    return res.render(`${__dirname}/společné/mapa.html`, {volby:req.params.volby, info:info, typzobrazeni:"účast"});
});


/////////////////////////////////
// seznam pro samostatné mapy //
///////////////////////////////

function vypsat_seznam(res, slozka) {
    var seznam = execSync(`cd "${slozka}" && python3 "${__dirname}/společné/mapy/menu/menu-samostatné.py"`,(error, stdout, stderr) => {
            if (error) {
                console.error(`MarkO: program na vytváření volebních map\nVýpis posledního chybového hlášení (${Date()}):\n${error.message}`);
                return res.status(500).send('chyba při spuštění skriptu');
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
        })
    
    seznam = seznam.toString()
    return res.type("text/javascript").send(seznam)
    return next()
}

app.get('/volby/:volby/:kolo/samostatn%C3%A9/seznam.js', (req, res, next) => {
    vypsat_seznam(res, `${__dirname}/volby/${req.params.volby}/${req.params.kolo}/samostatné`)
})
app.get('/volby/:volby/samostatn%C3%A9/seznam.js', (req, res, next) => {
    vypsat_seznam(res, `${__dirname}/volby/${req.params.volby}/samostatné`)
})
app.get('/volby/:volby/obce/:obec/samostatn%C3%A9/seznam.js', (req, res, next) => {
    vypsat_seznam(res, `${__dirname}/volby/${req.params.volby}/obce/${req.params.obec}/samostatné`)
})
app.get('/volby/:volby/obce/:obec/:obvod/samostatn%C3%A9/seznam.js', (req, res, next) => {
    vypsat_seznam(res, `${__dirname}/volby/${req.params.volby}/obce/${req.params.obec}/samostatné`)
})

/////////////////////////
//  Zachytávání chyb  //
///////////////////////

// 404
app.use((req, res, next) => {
    const err = new Error("Stránka nebyla nalezena");
    err.status = 404;
    next(err);
});

// společný handler
app.use((err, req, res, next) => {

    //console.error(err);

    const status = err.status || 500;

    res.status(status);
    if (status === 500) {
        console.log(err)
    }

    if (status === 404) {
        return res.render(
            `${__dirname}/společné/chyby/404.html`,
        );
    }

    return res.render(`${__dirname}/společné/chyby/500.html`,
        {
            error: process.env.NODE_ENV === "development"
                ? err.message
                : null
        }
    );
});

// Spuštění serveru
app.listen(port, () => {
    console.log(`Server běží na http://localhost:${port}`);
    prohlizec()
});