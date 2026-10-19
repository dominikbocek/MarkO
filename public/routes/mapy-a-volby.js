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

        pomocnefunkce.overeni(req, res, next, info, typzobrazeni)

        info.lokalita = {druh: "stát"} // pokud není stanoveno jinak, pro sněmovní, krajské a prezidentské volby platí lokalita stát; NUTNO přepsat v případě kteréhokoliv jiného území VÝHRADNĚ v sekci daného území; tento řádek NEPŘEPISOVAT

        const souborynastaveni = fs.readdirSync(`${cwd()}/společné/mapy/nastavení`)
        return res.render(`${cwd()}/společné/mapa.html`, {volby:req.params.volby, info:info, typzobrazeni:typzobrazeni, souborynastaveni: souborynastaveni});       
    });
}

// !!! NEMĚNIT POŘADÍ !!!

///////////////////////////////
// krajské a sněmovní volby //
/////////////////////////////

snemovna_kraje_prezident('/:volby/vitez', "normální")
snemovna_kraje_prezident('/:volby/samostatn%C3%A9/', "samostatné")
snemovna_kraje_prezident('/:volby/ucast', "účast")

router.use("/:volby/", vysledky_obce_ostatni_volby) // i pro komunální volby
router.use("/:volby/", pomocnefunkce.prehled)

/////////////////////////
// prezidentské volby //
///////////////////////

snemovna_kraje_prezident('/:volby/:kolo/vitez', "normální")
snemovna_kraje_prezident('/:volby/:kolo/samostatn%C3%A9/', "samostatné")
snemovna_kraje_prezident('/:volby/:kolo/ucast', "účast")

router.use("/:volby/:kolo/", vysledky_obce_ostatni_volby)
router.use("/:volby/:kolo/", pomocnefunkce.prehled)

//////////////////////
// komunální volby //
////////////////////

// viz obce.js


/////////////////////////////////
// seznam pro samostatné mapy //
///////////////////////////////

function vypsat_seznam(res, next, slozka) {
    if (!fs.existsSync(slozka)) {
        throw new chyby.AppError("Volební subjekty nebyly zpracovány.", 404)
    }
    var seznam = execSync(`cd "${slozka}" && python3 "${cwd()}/společné/mapy/seznam/seznam-samostatné.py"`)
    
    seznam = seznam.toString()
    return res.type("text/javascript").send(seznam)
}

router.get('/js/seznam.js/:volby/:kolo/', (req, res, next) => {
    vypsat_seznam(res, next, `${cwd()}/volby/${req.params.volby}/${req.params.kolo}/samostatné`)
})
router.get('/js/seznam.js/:volby/', (req, res, next) => {
    vypsat_seznam(res, next, `${cwd()}/volby/${req.params.volby}/samostatné`)
})
router.get('/js/seznam.js/:volby/obce/:obec/', (req, res, next) => {
    vypsat_seznam(res, next, `${cwd()}/volby/${req.params.volby}/obce/${req.params.obec}/samostatné`)
})
router.get('/js/seznam.js/:volby/obce/:obec/:obvod/', (req, res, next) => {
    vypsat_seznam(res, next, `${cwd()}/volby/${req.params.volby}/obce/${req.params.obec}/samostatné`)
})

module.exports = router;