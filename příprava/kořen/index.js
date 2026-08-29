const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec, execSync } = require('child_process');
const { Command } = require('commander');
const ndjsonParser = require('ndjson-parse');
const {Base64} = require('js-base64');
const program = new Command();
const app = express();
const { createGeoJSONImage } = require("./společné/mapy/js/geojson2png.js")
app.engine('html', require('ejs').renderFile);

program
  .name('MarkO - program na vytváření volebních map')
  .description('Tato část slouží pouze ke spuštění lokálního serveru. Hlavní program najdete ve složkách pro jednotlivé volby.')
  .version(fs.readFileSync("../.verze.txt").toString());

program
  .option('-p, --port <type>', 'port, na kterém server poběží, ve výchozím stavu je použit port 80', '80')
  .option('-g, --gui', 'spustí grafickou verzi v prohlížeči')
  .option('-d, --debug', 'vypsání chybových hlášení')
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

const bodyParser = require('body-parser')

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
            chyba(error)
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
    volby = req.body.volby;
    kolo = req.body.kolo //pouze pro prezidentské volby
    prezident = kolo //pouze pro prezidentské volby
    if (kolo == "1") {prezident = "první kolo"} else if (kolo == "2") {prezident = "druhé kolo"}
    if(!fs.existsSync(`${__dirname}/volby/${volby}/${prezident}/volebni_okrsky-simple-data-topo.json`)) {
        exec(`cd "volby/${volby}/${prezident}" && bash ./volebni_mapy.sh -n`, (error, stdout, stderr) => {
            if (error) {
                chyba(error)
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
            chyba(error)
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
        }
        res.send(`${stdout}`);
    });
});

app.post('/samostatne-mapy', (req, res, next) => {
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
            chyba(error)
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
        }
        res.send(`Vytvoření map dokončeno. Pro zobrazení klikněte <a href="volby/${volby}/${prezident}/samostatné/" target="_blank">sem</a>.`);
    });
});

app.post('/koalice', (req, res, next) => {
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
            chyba(error)
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
        }
        res.send(odpoved);
    });
});

app.get("/volby", (req, res, next) => {
    var seznam = execSync(`python3 zobrazit_zpracované_volby.py`, (error, stdout, stderr) => {
            if (error) {
                chyba(error)
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
        })
    var cesty = execSync(`python3 zobrazit_zpracované_volby.py --cesta ano`, (error, stdout, stderr) => {
        if (error) {
            chyba(error)
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

    res.render(__dirname + "/společné/volby/seznam.html", {seznam:seznam, cesty:cesty, mapy_koalic:mapy_koalic, samostatne_mapy:samostatne_mapy});
})

app.get("/volby/:volby/prehled", (req, res, next) => {
    let info = nacistJSON(req.params.volby)
    res.render(`${__dirname}/společné/volby/volby.ejs`, {info})
}) // u prezidentských voleb to zatím nefunguje


/////////////////////////////////////
// SEKCE ZOBRAZENÍ VÝSLEDKŮ VOLEB //
///////////////////////////////////


/////////////////////////
// prezidentské volby //
///////////////////////

function prezident(url, typzobrazeni) {
    app.get(url, (req, res, next) => {
        req.acceptsCharsets('utf-8')
        if ((req.params.kolo == "první kolo" || req.params.kolo == "druhé kolo") && (fs.existsSync(`${__dirname}/volby/${req.params.volby}/${req.params.kolo}/`))) {
            const info = nacistJSON(req.params.volby)
            const souborynastaveni = fs.readdirSync(`${__dirname}/společné/mapy/nastavení`)
            return res.render(`${__dirname}/společné/mapa.html`, {volby:req.params.volby, info:info, typzobrazeni:typzobrazeni, souborynastaveni: souborynastaveni, oblast: "stát"});
        }

        return next();
    });
}

prezident('/volby/:volby/:kolo/', "normální")
prezident('/volby/:volby/:kolo/samostatn%C3%A9/', "samostatné")
prezident('/volby/:volby/:kolo/ucast', "účast")

//////////////////////
// komunální volby //
////////////////////

// bežná/statutární zastupitelstva

app.get('/volby/:volby/obce/:obec/mapy', (req, res, next) => {
    req.acceptsCharsets('utf-8')
    if(fs.existsSync(`${__dirname}/volby/${req.params.volby}/obce/${req.params.obec}/${req.params.obec}.csv`)) {
        let seznam_obvodu = execSync(`python3 "../obce/seznam_obvodů.py" --volby "${req.params.volby}" --obec "${req.params.obec}"`, (error, stdout, stderr) => {
            if (error) {
                chyba(error)
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
        })

        let info_obec = execSync(`python3 "${__dirname}/../obce/vypsat_obce.py" --volby "${req.params.volby}" --vyhledat "obec" --hledanahodnota "${req.params.obec}" --json ano`, (error, stdout, stderr) => {
            if (error) {
                chyba(error)
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
        })

        let info = nacistJSON(req.params.volby)

        seznam_nazvu_obvodu = execSync(`python3 "../obce/seznam_obvodů.py" --volby "${req.params.volby}" --obec "${req.params.obec}" --vypsat "název"`, (error, stdout, stderr) => {
            if (error) {
                chyba(error)
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

        return res.render('../public/společné/volby/rozcestník-map.ejs', {obvody:seznam_obvodu, nazvy:seznam_nazvu_obvodu, info:info});
    
    }
    
    return next();
})

function obce(url, typzobrazeni) {
    app.get(url, (req, res, next) => {
        req.acceptsCharsets('utf-8')

        let verze 
        switch (info["druh"]) {
            case "sněmovní":
                verze = "sněmovna"
                break;
            case "krajské":
                verze = "kraje"
                break;
            case "prezidentské":
                verze = "prezident/první kolo"
            default:
                break;
        }

        let info_obec = execSync(`python3 "${__dirname}/../${verze}/vypsat_obce.py" --volby "${req.params.volby}" --vyhledat "obec" --hledanahodnota "${req.params.obec}" --json ano`, (error, stdout, stderr) => {
            if (error) {
                chyba(error)
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
        })

        let info = nacistJSON(req.params.volby)

        info_obec = JSON.parse(info_obec.toString())

        info.lokalita = info_obec
        info.lokalita.druh = "obec"

        const souborynastaveni = fs.readdirSync(`${__dirname}/společné/mapy/nastavení`)

        if(info["druh"] == "komunální") {
            return res.render(`${__dirname}/společné/mapa.html`, {volby:req.params.volby, info:info, typzobrazeni:typzobrazeni, souborynastaveni: souborynastaveni, oblast: "obce"});
        } else {
            const souborynastaveni = fs.readdirSync(`${__dirname}/společné/mapy/nastavení`)
            let statistiky_ndjson = execSync(`bash "${__dirname}/../společné/ndjson_filtr.sh" "${__dirname}/../public/volby/${req.params.volby}/volebni_okrsky-simple-data.ndjson" "${req.params.obec}"`)
            const statistiky_obce_base64 = Base64.encode(statistiky_ndjson)

            var legenda = Base64.encode(execSync(`python3 "../${verze}/legenda.py" --volby "${req.params.volby}" --kodobec ${req.params.obec}`))

            return res.render(`${__dirname}/společné/mapa.html`, {volby:req.params.volby, info:info, typzobrazeni:typzobrazeni, souborynastaveni: souborynastaveni, statistiky_obce_base64, legenda})
        }
        
        return next();
    })
}

obce('/volby/:volby/obce/:obec/', "normální")
obce('/volby/:volby/obce/:obec/ucast', "účast")
obce('/volby/:volby/obce/:obec/samostatn%C3%A9/', "samostatné")

app.get('/volby/:volby/obce', (req, res, next) => {
    let seznam_obci = execSync(`python3 "${__dirname}/../společné/vypsat_obce.py" --json ano`, (error, stdout, stderr) => {
        if (error) {
            chyba(error)
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
        }
    })

    seznam_obci = seznam_obci.toString().split("\n")

    //seznam_obci = JSON.parse(seznam_obci.toString())

    return res.render(`${__dirname}/společné/volby/obce.ejs`, {seznam_obci})

    return next()
})

//komunální zastupitelstva - samosprávné obvody/městské části

app.get('/volby/:volby/obce/:obec/:obvod/mapy', (req, res, next) => {
    req.acceptsCharsets('utf-8')
    if(fs.existsSync(`${__dirname}/volby/${req.params.volby}/obce/${req.params.obec}/${req.params.obvod}/${req.params.obvod}.csv`)) {
        let seznam_obvodu = execSync(`python3 "../obce/seznam_obvodů.py" --volby "${req.params.volby}" --obec "${req.params.obvod}"`, (error, stdout, stderr) => {
            if (error) {
                chyba(error)
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
        })

        let info_obec = execSync(`python3 "${__dirname}/../obce/vypsat_obce.py" --volby "${req.params.volby}" --vyhledat "obec" --hledanahodnota "${req.params.obvod}" --json ano`, (error, stdout, stderr) => {
            if (error) {
                chyba(error)
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

        return res.render('../public/společné/volby/rozcestník-map.ejs', {obvody:seznam_obvodu, info:info});
    }
    
    return next();
})

function obvod(url, typzobrazeni) {
    app.get(url, (req, res, next) => {
        req.acceptsCharsets('utf-8')
        if(fs.existsSync(`${__dirname}/volby/${req.params.volby}/obce/${req.params.obec}/${req.params.obvod}/${req.params.obvod}.csv`)) {
            let info = nacistJSON(req.params.volby)

            //title a popisek mapy
            let info_obec = execSync(`python3 "${__dirname}/../obce/vypsat_obce.py" --volby "${req.params.volby}" --vyhledat "obec" --hledanahodnota "${req.params.obvod}" --json ano`, (error, stdout, stderr) => {
                if (error) {
                    chyba(error)
                }
                if (stderr) {
                    console.error(`stderr: ${stderr}`);
                }
            })

            info_obec = JSON.parse(info_obec.toString())

            info.lokalita = info_obec
            info.lokalita.druh = "obvod"

            const souborynastaveni = fs.readdirSync(`${__dirname}/společné/mapy/nastavení`)
            return res.render(`${__dirname}/společné/mapa.html`, {volby:req.params.volby, info:info, typzobrazeni:typzobrazeni, souborynastaveni: souborynastaveni, oblast: "stát"});
        }
        
        return next();
    })
}

obvod('/volby/:volby/obce/:obec/:obvod/', "normální")
obvod('/volby/:volby/obce/:obec/:obvod/ucast', "účast")
obvod('/volby/:volby/obce/:obec/:obvod/samostatn%C3%A9/', "samostatné")

///////////////////////////////
// krajské a sněmovní volby //
/////////////////////////////

function kraj_a_snemovna(url, typzobrazeni) {
    app.get(url, (req, res, next) => {
        req.acceptsCharsets('utf-8')
        if (fs.existsSync(`${__dirname}/volby/${req.params.volby}/statistics.csv`)) {
            let info = nacistJSON(req.params.volby)

            const souborynastaveni = fs.readdirSync(`${__dirname}/společné/mapy/nastavení`)
            return res.render(`${__dirname}/společné/mapa.html`, {volby:req.params.volby,info:info, typzobrazeni:typzobrazeni, souborynastaveni: souborynastaveni, oblast: "stát"});
        }
        
        return next();
    })    
}

kraj_a_snemovna('/volby/:volby/', "normální")
kraj_a_snemovna('/volby/:volby/samostatn%C3%A9', "samostatné")
kraj_a_snemovna('/volby/:volby/ucast', "účast")


/////////////////////////////////
// seznam pro samostatné mapy //
///////////////////////////////

function vypsat_seznam(res, slozka) {
    var seznam = execSync(`cd "${slozka}" && python3 "${__dirname}/společné/mapy/menu/menu-samostatné.py"`,(error, stdout, stderr) => {
            if (error) {
                chyba(error)
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

/////////////////
// Další věci //
///////////////

app.get('/volby/:volby/obce/:obec/seznam_obvodu.js', (req, res, next) => {
    let seznam_obvodu = execSync(`python3 "../obce/seznam_obvodů.py" --volby "${req.params.volby}" --obec "${req.params.obec}"`, (error, stdout, stderr) => {
        if (error) {
            chyba(error)
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
        }
    })

    seznam_nazvu_obvodu = execSync(`python3 "../obce/seznam_obvodů.py" --volby "${req.params.volby}" --obec "${req.params.obec}" --vypsat "název"`, (error, stdout, stderr) => {
        if (error) {
            chyba(error)
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
        }
    })

    seznam_obvodu = eval(seznam_obvodu.toString())

    seznam_nazvu_obvodu = eval(seznam_nazvu_obvodu.toString())

    return res.type("text/javascript").render(`${__dirname}/společné/mapy/vykreslení/obvody.ejs`, {seznam_obvodu, seznam_nazvu_obvodu})

    return next()
})

app.post("/stahnout", async (req, res, next) => {

    function makeid(length) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    let soubor = __dirname+req.body.soubor
    let tmpgeojson = `${__dirname}/../společné/tmp/${makeid(20)}.geojson`
    let barvy = __dirname+req.body.barvy
    let legenda = __dirname+req.body.legenda
    let druh = req.body.druh
    let popisek = req.body.popisek
    execSync(`bash "${__dirname}/../společné/geojson.sh" "${soubor}" "${tmpgeojson}"`, (error, stdout, stderr) => {
        if (error) {
            chyba(error)
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
        }
    })
    const vysledek = createGeoJSONImage(tmpgeojson, barvy, legenda, druh, popisek)
    vysledek.then(function(obrazek) {
        res.set({
            "Content-Type": "image/png",
            "Content-Disposition": 'attachment; filename="mapa.png"',
            "Content-Length": obrazek.length
        });
        res.send(obrazek)
        fs.unlinkSync(tmpgeojson)
    })
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

    const status = err.status || 500;

    res.status(status);

    
    if (status === 500) {
        chyba(err)
        return res.render(`${__dirname}/společné/chyby/chyba.ejs`, {status});
    }

    if (status === 404) {
        return res.render(`${__dirname}/společné/chyby/chyba.ejs`, {status});
    }
});

function chyba(error) {
    if(global.options.debug) {
        console.error(`MarkO: program na vytváření volebních map\nVýpis posledního chybového hlášení (${Date()}):\n${error.message}`);
    }
}

// Spuštění serveru
app.listen(port, () => {
    console.log(`Server běží na http://localhost:${port}`);
    prohlizec()
});