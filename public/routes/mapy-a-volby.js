const express = require('express');
const router = express.Router({mergeParams: true});
const { chdir, cwd } = require('node:process');
const fs = require('fs');
const { exec, execSync } = require('child_process');
const vysledky_obce_ostatni_volby = require("./obce.js")
const pomocnefunkce = require("./pomocne.js")

/////////////////////////////////////
// SEKCE ZOBRAZENÍ VÝSLEDKŮ VOLEB //
///////////////////////////////////

// dasboard s výsledky voleb

const prehled = express.Router({ mergeParams: true })

prehled.get("/prehled", (req, res, next) => {
    let info = pomocnefunkce.nacistJSON(req.params.volby)

    if (info == null) {
        return next()
    }

    if((info["druh"] == "prezidentské" && (req.params.kolo == undefined || (req.params.kolo !== "první kolo" && req.params.kolo !== "druhé kolo"))) || (info["druh"] !== "prezidentské" && req.params.kolo !== undefined) || (info["druh"] == "komunální") && req.params.obec == undefined) {
        return next()
    }

    if(req.params.obec == undefined) {
        return res.render(`${cwd()}/společné/volby/volby.ejs`, { info })
    }

    let info_obec = execSync(`python3 "${cwd()}/../společné/vypsat_obce.py" --kodobec ${req.params.obec} --json ano`, (error, stdout, stderr) => {
        if (error) {
            chyba(error)
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
        }
    })

    try {
        info_obec = JSON.parse(info_obec.toString()) // pokud obec neexistuje v seznamu, prehled se nezobrazí
    } catch (error) {
        return next()
    }

    return res.render(`${cwd()}/společné/volby/volby.ejs`, { info })
})

// Rozcestník obcí pro zobrazení výsledků za jednotlivé obce

const obce = express.Router({mergeParams: true})

obce.get('/obce/', (req, res, next) => {

    if(pomocnefunkce.urllomitka('/obce/', req, res) !== 0) {
        return
    }

    let info = pomocnefunkce.nacistJSON(req.params.volby, next)

    if(info == null) {
        return next()
    }

    if((info["druh"] == "prezidentské" && (req.params.kolo == undefined || (req.params.kolo !== "první kolo" && req.params.kolo !== "druhé kolo"))) || (info["druh"] !== "prezidentské" && req.params.kolo !== undefined)) {
        return next()
    }

    let seznam_obci = execSync(`python3 "${cwd()}/../společné/vypsat_obce.py" --json ano`, (error, stdout, stderr) => {
        if (error) {
            chyba(error)
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
        }
    })

    seznam_obci = seznam_obci.toString().split("\n")

    return res.render(`${cwd()}/společné/volby/obce.ejs`, {seznam_obci})
})


/////////////////////////
// prezidentské volby //
///////////////////////

function prezident(url, typzobrazeni) {
    return router.get(url, (req, res, next) => {
        req.acceptsCharsets('utf-8')

        let info = pomocnefunkce.nacistJSON(req.params.volby) // existují volby v seznamu?

        if(info == null) {
            return next()
        }

        if (!fs.existsSync(`${cwd()}/volby/${req.params.volby}/${req.params.kolo}/statistics.csv`)) {// byly volby zpracovány?
            return next();
        }

        if(typzobrazeni == "samostatné" && !fs.existsSync(`${cwd()}/volby/${req.params.volby}/${req.params.kolo}/samostatné`)) {
            return next();
        }


        info.lokalita = {druh: "stát"}
        const souborynastaveni = fs.readdirSync(`${cwd()}/společné/mapy/nastavení`)
        return res.render(`${cwd()}/společné/mapa.html`, {volby:req.params.volby, info:info, typzobrazeni:typzobrazeni, souborynastaveni: souborynastaveni});
        
    });
}

prezident('/:volby/:kolo/', "normální")
prezident('/:volby/:kolo/samostatn%C3%A9/', "samostatné")
prezident('/:volby/:kolo/ucast', "účast")

router.use("/:volby/:kolo/", obce)
router.use("/:volby/:kolo/", prehled)
router.use("/:volby/:kolo/obce/:obec/", prehled)
router.use("/:volby/:kolo/", vysledky_obce_ostatni_volby)

//////////////////////
// komunální volby //
////////////////////

// běžná/statutární zastupitelstva
// viz obce.js

const mapy = router.get('/:volby/obce/:obec/mapy', (req, res, next) => {
    req.acceptsCharsets('utf-8')
    if(fs.existsSync(`${cwd()}/volby/${req.params.volby}/obce/${req.params.obec}/${req.params.obec}.csv`)) {
        let seznam_obvodu = execSync(`python3 "${cwd()}/../obce/seznam_obvodů.py" --volby "${req.params.volby}" --obec "${req.params.obec}"`, (error, stdout, stderr) => {
            if (error) {
                chyba(error)
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
        })

        let info_obec = execSync(`python3 "${cwd()}/../obce/vypsat_obce.py" --volby "${req.params.volby}" --vyhledat "obec" --hledanahodnota "${req.params.obec}" --json ano`, (error, stdout, stderr) => {
            if (error) {
                chyba(error)
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
        })

        let info = pomocnefunkce.nacistJSON(req.params.volby)

        let seznam_nazvu_obvodu = execSync(`python3 "${cwd()}/../obce/seznam_obvodů.py" --volby "${req.params.volby}" --obec "${req.params.obec}" --vypsat "název"`, (error, stdout, stderr) => {
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

//komunální zastupitelstva - samosprávné obvody/městské části

const mapy_obvody = router.get('/:volby/obce/:obec/:obvod/mapy', (req, res, next) => {
    req.acceptsCharsets('utf-8')
    if(fs.existsSync(`${cwd()}/volby/${req.params.volby}/obce/${req.params.obec}/${req.params.obvod}/${req.params.obvod}.csv`)) {
        let seznam_obvodu = execSync(`python3 "${cwd()}/../obce/seznam_obvodů.py" --volby "${req.params.volby}" --obec "${req.params.obvod}"`, (error, stdout, stderr) => {
            if (error) {
                chyba(error)
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
        })

        let info_obec = execSync(`python3 "${cwd()}/../obce/vypsat_obce.py" --volby "${req.params.volby}" --vyhledat "obec" --hledanahodnota "${req.params.obvod}" --json ano`, (error, stdout, stderr) => {
            if (error) {
                chyba(error)
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
        })

        let info = pomocnefunkce.nacistJSON(req.params.volby)

        info_obec = JSON.parse(info_obec.toString())

        info.lokalita = info_obec
        info.lokalita.druh = "obvod"
    
        seznam_obvodu = eval(seznam_obvodu.toString())

        return res.render('../public/společné/volby/rozcestník-map.ejs', {obvody:seznam_obvodu, info:info});
    }
    
    return next();
})

function obvod(url, typzobrazeni) {
    return router.get(url, (req, res, next) => {
        req.acceptsCharsets('utf-8')
        if(fs.existsSync(`${cwd()}/volby/${req.params.volby}/obce/${req.params.obec}/${req.params.obvod}/${req.params.obvod}.csv`)) {
            let info = pomocnefunkce.nacistJSON(req.params.volby)

            //title a popisek mapy
            let info_obec = execSync(`python3 "${cwd()}/../obce/vypsat_obce.py" --volby "${req.params.volby}" --vyhledat "obec" --hledanahodnota "${req.params.obvod}" --json ano`, (error, stdout, stderr) => {
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

            const souborynastaveni = fs.readdirSync(`${cwd()}/společné/mapy/nastavení`)
            return res.render(`${cwd()}/společné/mapa.html`, {volby:req.params.volby, info:info, typzobrazeni:typzobrazeni, souborynastaveni: souborynastaveni});
        }
        
        return next();
    })
}

obvod('/:volby/obce/:obec/:obvod/', "normální")
obvod('/:volby/obce/:obec/:obvod/ucast', "účast")
obvod('/:volby/obce/:obec/:obvod/samostatn%C3%A9/', "samostatné")

///////////////////////////////
// krajské a sněmovní volby //
/////////////////////////////

function kraje_a_snemovna(url, typzobrazeni) {
    return router.get(url, (req, res, next) => {
        req.acceptsCharsets('utf-8')

        let info = pomocnefunkce.nacistJSON(req.params.volby) // existují volby v seznamu?

        if(info == null) {
            return next()
        }

        if (!fs.existsSync(`${cwd()}/volby/${req.params.volby}/statistics.csv`)) {// byly volby zpracovány?
            return next();
        }

        if(typzobrazeni == "samostatné" && !fs.existsSync(`${cwd()}/volby/${req.params.volby}/samostatné`)) {
            return next();
        }
        
        info.lokalita = {druh: "stát"}

        const souborynastaveni = fs.readdirSync(`${cwd()}/společné/mapy/nastavení`)
        return res.render(`${cwd()}/společné/mapa.html`, {volby:req.params.volby,info:info, typzobrazeni:typzobrazeni, souborynastaveni: souborynastaveni});
    })
}

kraje_a_snemovna('/:volby/', "normální")
kraje_a_snemovna('/:volby/samostatn%C3%A9', "samostatné")
kraje_a_snemovna('/:volby/ucast', "účast")

router.use("/:volby/", obce) // i pro komunální volby
router.use("/:volby/", prehled)
router.use("/:volby/obce/:obec/", prehled)
router.use("/:volby/", vysledky_obce_ostatni_volby) // i pro komunální volby


/////////////////////////////////
// seznam pro samostatné mapy //
///////////////////////////////

function vypsat_seznam(res, next, slozka) {
    if (!fs.existsSync(slozka)) {
        return next()
    }
    var seznam = execSync(`cd "${slozka}" && python3 "${cwd()}/společné/mapy/menu/menu-samostatné.py"`,(error, stdout, stderr) => {
            if (error) {
                chyba(error)
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
        })
    
    seznam = seznam.toString()
    return res.type("text/javascript").send(seznam)
}

router.get('/:volby/:kolo/samostatn%C3%A9/seznam.js', (req, res, next) => {
    vypsat_seznam(res, next, `${cwd()}/volby/${req.params.volby}/${req.params.kolo}/samostatné`)
})
router.get('/:volby/samostatn%C3%A9/seznam.js', (req, res, next) => {
    vypsat_seznam(res, next, `${cwd()}/volby/${req.params.volby}/samostatné`)
})
router.get('/:volby/obce/:obec/samostatn%C3%A9/seznam.js', (req, res, next) => {
    vypsat_seznam(res, next, `${cwd()}/volby/${req.params.volby}/obce/${req.params.obec}/samostatné`)
})
router.get('/:volby/obce/:obec/:obvod/samostatn%C3%A9/seznam.js', (req, res, next) => {
    vypsat_seznam(res, next, `${cwd()}/volby/${req.params.volby}/obce/${req.params.obec}/samostatné`)
})

/////////////////
// Další věci //
///////////////

router.get('/:volby/obce/:obec/seznam_obvodu.js', (req, res, next) => {
    let seznam_obvodu = execSync(`python3 "${cwd()}/../obce/seznam_obvodů.py" --volby "${req.params.volby}" --obec "${req.params.obec}"`, (error, stdout, stderr) => {
        if (error) {
            chyba(error)
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
        }
    })

    let seznam_nazvu_obvodu = execSync(`python3 "${cwd()}/../obce/seznam_obvodů.py" --volby "${req.params.volby}" --obec "${req.params.obec}" --vypsat "název"`, (error, stdout, stderr) => {
        if (error) {
            chyba(error)
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
        }
    })

    seznam_obvodu = eval(seznam_obvodu.toString())

    seznam_nazvu_obvodu = eval(seznam_nazvu_obvodu.toString())

    return res.type("text/javascript").render(`${cwd()}/společné/mapy/vykreslení/obvody.ejs`, {seznam_obvodu, seznam_nazvu_obvodu})
})

const chyby = require("./chyby.js")
router.use(chyby)

module.exports = router;