const express = require('express');
const router = express.Router({mergeParams: true});
const { chdir, cwd } = require('node:process');
const fs = require('fs');
const { exec, execSync } = require('child_process');
const vysledky_obce_ostatni_volby = require("./obce.js")
const pomocnefunkce = require("./pomocne.js")
const chyby = require("./chyby.js")

/////////////////////////////////////
// SEKCE ZOBRAZENÍ VÝSLEDKŮ VOLEB //
///////////////////////////////////

function snemovna_kraje_prezident(url, typzobrazeni) {
    return router.get(url, (req, res, next) => {
        req.acceptsCharsets('utf-8')

        if(pomocnefunkce.urllomitka(url, req, res) !== 0) {
            return
        }

        let info = pomocnefunkce.nacistJSON(req.params.volby) // existují volby v seznamu?

        if(info == null) {
            return next()
        }

        switch (info["druh"]) {
            case "krajské":
            case "sněmovní":
                if (!fs.existsSync(`${cwd()}/volby/${req.params.volby}/statistics.csv`) || req.params.kolo !== undefined) {// byly volby zpracovány?
                    return next();
                }

                if(typzobrazeni == "samostatné" && !fs.existsSync(`${cwd()}/volby/${req.params.volby}/samostatné`)) {
                    return next();
                }

                break;
            case "prezidentské":
                if (!fs.existsSync(`${cwd()}/volby/${req.params.volby}/${req.params.kolo}/statistics.csv`)) {// byly volby zpracovány?
                    return next();
                }

                if(typzobrazeni == "samostatné" && !fs.existsSync(`${cwd()}/volby/${req.params.volby}/${req.params.kolo}/samostatné`)) {
                    return next();
                }
                break;
            default:
                return next()
                //break;
        }

        info.lokalita = {druh: "stát"}

        const souborynastaveni = fs.readdirSync(`${cwd()}/společné/mapy/nastavení`)
        return res.render(`${cwd()}/společné/mapa.html`, {volby:req.params.volby, info:info, typzobrazeni:typzobrazeni, souborynastaveni: souborynastaveni});       
    });
}

/////////////////////////
// prezidentské volby //
///////////////////////

snemovna_kraje_prezident('/:volby/:kolo/vitez', "normální")
snemovna_kraje_prezident('/:volby/:kolo/samostatn%C3%A9/', "samostatné")
snemovna_kraje_prezident('/:volby/:kolo/ucast', "účast")

router.use("/:volby/:kolo/", vysledky_obce_ostatni_volby)
router.use("/:volby/:kolo/", pomocnefunkce.prehled)

///////////////////////////////
// krajské a sněmovní volby //
/////////////////////////////

snemovna_kraje_prezident('/:volby/vitez', "normální")
snemovna_kraje_prezident('/:volby/samostatn%C3%A9/', "samostatné")
snemovna_kraje_prezident('/:volby/ucast', "účast")

router.use("/:volby/", vysledky_obce_ostatni_volby) // i pro komunální volby
router.use("/:volby/", pomocnefunkce.prehled)

//////////////////////
// komunální volby //
////////////////////

// běžná/statutární zastupitelstva
// viz obce.js

const mapy = router.get('/:volby/obce/:obec/mapy', (req, res, next) => {
    req.acceptsCharsets('utf-8')
    if(fs.existsSync(`${cwd()}/volby/${req.params.volby}/obce/${req.params.obec}/${req.params.obec}.csv`)) {
        let seznam_obvodu = execSync(`python3 "${cwd()}/../obce/seznam_obvodů.py" --volby "${req.params.volby}" --obec "${req.params.obec}"`)

        let info_obec = execSync(`python3 "${cwd()}/../obce/vypsat_obce.py" --volby "${req.params.volby}" --vyhledat "obec" --hledanahodnota "${req.params.obec}" --json ano`)

        let info = pomocnefunkce.nacistJSON(req.params.volby)

        let seznam_nazvu_obvodu = execSync(`python3 "${cwd()}/../obce/seznam_obvodů.py" --volby "${req.params.volby}" --obec "${req.params.obec}" --vypsat "název"`)

        seznam_obvodu = eval(seznam_obvodu.toString())

        seznam_nazvu_obvodu = eval(seznam_nazvu_obvodu.toString())

        info_obec = JSON.parse(info_obec.toString())

        info.lokalita = info_obec
        info.lokalita.druh = "obec"

        return res.render('../public/společné/volby/rozcestník-map.ejs', {obvody:seznam_obvodu, nazvy:seznam_nazvu_obvodu, info:info});
    
    }
    
    return next();
})

// tyhle dvě věci by se daly sjednotit

//komunální zastupitelstva - samosprávné obvody/městské části

const mapy_obvody = router.get('/:volby/obce/:obec/:obvod/mapy', (req, res, next) => {
    req.acceptsCharsets('utf-8')
    if(fs.existsSync(`${cwd()}/volby/${req.params.volby}/obce/${req.params.obec}/${req.params.obvod}/${req.params.obvod}.csv`)) {
        let seznam_obvodu = execSync(`python3 "${cwd()}/../obce/seznam_obvodů.py" --volby "${req.params.volby}" --obec "${req.params.obvod}"`)

        let info_obec = execSync(`python3 "${cwd()}/../obce/vypsat_obce.py" --volby "${req.params.volby}" --vyhledat "obec" --hledanahodnota "${req.params.obvod}" --json ano`)

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

            //title a popisek mapy; generické volby, nejsou potřeba, ale chceme přístup k seznamu voleb, který je pořád stejný, nutno dořešit
            let info_obec = execSync(`python3 "${cwd()}/../obce/vypsat_obce.py" --vyhledat "obec" --hledanahodnota "${req.params.obvod}" --json ano`)

            info_obec = JSON.parse(info_obec.toString())

            info.lokalita = info_obec
            info.lokalita.druh = "obvod"

            const souborynastaveni = fs.readdirSync(`${cwd()}/společné/mapy/nastavení`)
            return res.render(`${cwd()}/společné/mapa.html`, {volby:req.params.volby, info:info, typzobrazeni:typzobrazeni, souborynastaveni: souborynastaveni});
        }
        
        return next();
    })
}

obvod('/:volby/obce/:obec/:obvod/vitez', "normální")
obvod('/:volby/obce/:obec/:obvod/ucast', "účast")
obvod('/:volby/obce/:obec/:obvod/samostatn%C3%A9/', "samostatné")


/////////////////////////////////
// seznam pro samostatné mapy //
///////////////////////////////

function vypsat_seznam(res, next, slozka) {
    if (!fs.existsSync(slozka)) {
        return next()
    }
    var seznam = execSync(`cd "${slozka}" && python3 "${cwd()}/společné/mapy/menu/menu-samostatné.py"`)
    
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
    let seznam_obvodu = execSync(`python3 "${cwd()}/../obce/seznam_obvodů.py" --volby "${req.params.volby}" --obec "${req.params.obec}"`)

    let seznam_nazvu_obvodu = execSync(`python3 "${cwd()}/../obce/seznam_obvodů.py" --volby "${req.params.volby}" --obec "${req.params.obec}" --vypsat "název"`)

    seznam_obvodu = eval(seznam_obvodu.toString())

    seznam_nazvu_obvodu = eval(seznam_nazvu_obvodu.toString())

    return res.type("text/javascript").render(`${cwd()}/společné/mapy/vykreslení/obvody.ejs`, {seznam_obvodu, seznam_nazvu_obvodu})
})

router.use(chyby.router)

module.exports = router;