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
            //case "komunální": // pouze dočasné
                //break;
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

                info.kolo = req.params.kolo

                if(typzobrazeni == "samostatné" && !fs.existsSync(`${cwd()}/volby/${req.params.volby}/${req.params.kolo}/samostatné`)) {
                    return next();
                }
                break;
            default:
                return next()
                //break;
        }

        info.lokalita = {druh: "stát"} // pokud není stanoveno jinak, pro sněmovní, krajské a prezidentské volby platí lokalita stát; NUTNO přepsat v případě kteréhokoliv jiného území VÝHRADNĚ v sekci daného území; tento řádek NEPŘEPISOVAT

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

//function obce_rozcestnik(url, lokalita) {
    router.get('/:volby/obce/:obec/mapy', (req, res, next) => { // '/:volby/obce/:obec/mapy' nebo '/:volby/obce/:obec/:obvod/mapy'
        req.acceptsCharsets('utf-8')
        console.log("test")
        if(fs.existsSync(`${cwd()}/volby/${req.params.volby}/obce/${req.params.obec}/${req.params.obec}.csv`)) {
            let seznam_obvodu = execSync(`python3 "${cwd()}/../obce/seznam_obvodů.py" --volby "${req.params.volby}" --obec "${req.params.obec}"`)

            let info_obec = execSync(`python3 "${cwd()}/../obce/vypsat_obce.py" --vyhledat "obec" --hledanahodnota "${req.params.obec}" --json ano`)

            let info = pomocnefunkce.nacistJSON(req.params.volby)

            let seznam_nazvu_obvodu = execSync(`python3 "${cwd()}/../obce/seznam_obvodů.py" --volby "${req.params.volby}" --obec "${req.params.obec}" --vypsat "název"`)

            seznam_obvodu = eval(seznam_obvodu.toString())

            seznam_nazvu_obvodu = eval(seznam_nazvu_obvodu.toString())

            info_obec = JSON.parse(info_obec.toString())

            info.lokalita = info_obec
            info.lokalita.druh = "obec"

            return res.render(`${cwd()}/společné/volby/rozcestník-map.ejs`, {obvody:seznam_obvodu, nazvy:seznam_nazvu_obvodu, info:info});
        
        }
        
        return next();
    })
//}

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


/////////////////////////////////
// seznam pro samostatné mapy //
///////////////////////////////

function vypsat_seznam(res, next, slozka) {
    if (!fs.existsSync(slozka)) {
        return next()
    }
    var seznam = execSync(`cd "${slozka}" && python3 "${cwd()}/společné/mapy/seznam/seznam-samostatné.py"`)
    
    seznam = seznam.toString()
    return res.type("text/javascript").send(seznam)
}

router.get('/seznam.js/:volby/:kolo/', (req, res, next) => {
    vypsat_seznam(res, next, `${cwd()}/volby/${req.params.volby}/${req.params.kolo}/samostatné`)
})
router.get('/seznam.js/:volby/', (req, res, next) => {
    vypsat_seznam(res, next, `${cwd()}/volby/${req.params.volby}/samostatné`)
})
router.get('/seznam.js/:volby/obce/:obec/', (req, res, next) => {
    console.log("test Svitavy")
    vypsat_seznam(res, next, `${cwd()}/volby/${req.params.volby}/obce/${req.params.obec}/samostatné`)
})
router.get('/seznam.js/:volby/obce/:obec/:obvod/', (req, res, next) => {
    vypsat_seznam(res, next, `${cwd()}/volby/${req.params.volby}/obce/${req.params.obec}/samostatné`)
})

router.use(chyby.router)

module.exports = router;