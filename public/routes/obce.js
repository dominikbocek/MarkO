const express = require('express');
const router = express.Router({mergeParams: true});
const { chdir, cwd } = require('node:process');
const fs = require('fs');
const { exec, execSync } = require('child_process');
const pomocnefunkce = require("./pomocne.js")

// Rozcestník obcí pro zobrazení výsledků za jednotlivé obce

const obce = express.Router({mergeParams: true})

obce.get('/obce/', (req, res, next) => {

    if(pomocnefunkce.urllomitka('/obce/', req, res) !== 0) {
        return
    }

    let info = pomocnefunkce.nacistJSON(req.params.volby, next)

    pomocnefunkce.overeni(req, res, next, info)

    return res.render(`${cwd()}/společné/volby/tailadmin/obce.html`, {info, zobrazeni:"prehledobci"})
})

// univerzální funkce pro obce a obvody komumálních a ostatních voleb

function obce_obvody_vsechny_volby(url, typzobrazeni) {

    return router.get(url, (req, res, next) => {

        req.acceptsCharsets('utf-8')

        if(pomocnefunkce.urllomitka(url, req, res) !== 0) {
            return
        }

        let info = pomocnefunkce.nacistJSON(req.params.volby) // existují volby v seznamu?

        pomocnefunkce.overeni(req, res, next, info, typzobrazeni)

        let info_obec

        if(req.params.obvod == undefined) {
            if(isNaN(req.params.obec)) {
                throw new chyby.AppError("Neplatný identifikátor obce.", 404)
            }
            info_obec = execSync(`python3 "${cwd()}/../obce/vypsat_obce.py" --vyhledat obec --hledanahodnota ${req.params.obec} --json ano`)
        } else {
            if(isNaN(req.params.obvod)) {
                throw new chyby.AppError("Neplatný identifikátor obvodu.", 404)
            }
            info_obec = execSync(`python3 "${cwd()}/../obce/vypsat_obce.py" --vyhledat obec --hledanahodnota ${req.params.obvod} --json ano`)
        }
        
        try {
            info_obec = JSON.parse(info_obec.toString()) // pokud obec neexistuje v seznamu, prehled se nezobrazí
        } catch (error) {
            chyby.chyba(error)
            throw new chyby.AppError("Obec neexistuje.", 404)
        }

        info.lokalita = info_obec

        if(req.params.obvod == undefined) {
            info.lokalita.druh = "obec"
        } else {
            info.lokalita.druh = "obvod"
        }

        const souborynastaveni = fs.readdirSync(`${cwd()}/společné/mapy/nastavení`)

        if(info["druh"] == "krajské" && req.params.obec == 554782) { // vyloučení Prahy u krajských voleb
            throw new chyby.AppError("Praha má v krajských volbách útrum.", 404)
        }

        return res.render(`${cwd()}/společné/mapa.html`, {volby:req.params.volby, info:info, typzobrazeni:typzobrazeni, souborynastaveni: souborynastaveni})
    })
}

obce_obvody_vsechny_volby("/:obec/vitez", "normální")
obce_obvody_vsechny_volby("/:obec/samostatn%C3%A9/", "samostatné")
obce_obvody_vsechny_volby("/:obec/ucast", "účast")

obce_obvody_vsechny_volby('/:obec/:obvod/vitez', "normální")
obce_obvody_vsechny_volby('/:obec/:obvod/ucast', "účast")
obce_obvody_vsechny_volby('/:obec/:obvod/samostatn%C3%A9/', "samostatné")

const legenda = express.Router({mergeParams: true})
legenda.get(["/vysledky_cr.json", "/vysledky_cr2.json"], (req, res, next) => {
    let info = pomocnefunkce.nacistJSON(req.params.volby) // existují volby v seznamu?

    pomocnefunkce.overeni(req, res, next, info)

    let verze
    switch (info["druh"]) {
        case "sněmovní":
        case "krajské":
            verze = "kraje a sněmovna"
            break;
        case "prezidentské":
            if(req.params.kolo == "první kolo") {
                verze = "prezident/první kolo"
            } else if(req.params.kolo == "druhé kolo") {
                verze = "prezident/druhé kolo"
            }
            break;
        default:
            throw new chyby.AppError("Neznámý druh voleb.", 500)
    }

    var filtrovanalegenda

    if(req.params.obvod == undefined) {
        if(req.originalUrl.endsWith("vysledky_cr.json")){
            filtrovanalegenda = execSync(`python3 "${cwd()}/../${verze}/legenda.py" --volby "${req.params.volby}" --kodobec ${req.params.obec}`)
        } else {
            filtrovanalegenda = execSync(`python3 "${cwd()}/../${verze}/legenda.py" --volby "${req.params.volby}" --koalice "ano" --kodobec ${req.params.obec}`)
        }
    } else {
        if(req.originalUrl.endsWith("vysledky_cr2.json")) {
            filtrovanalegenda = execSync(`python3 "${cwd()}/../${verze}/legenda.py" --volby "${req.params.volby}" --kodobec ${req.params.obvod}`)
        } else {
            filtrovanalegenda = execSync(`python3 "${cwd()}/../${verze}/legenda.py" --volby "${req.params.volby}" --koalice "ano" --kodobec ${req.params.obvod}`)
        }
    }

    return res.send(filtrovanalegenda)
})

router.get("/:obec/seznam_obvodu.js", (req, res, next) => {
    let seznam_obvodu = execSync(`python3 "${cwd()}/../obce/seznam_obvodů.py" --obec "${req.params.obec}"`)

    let seznam_nazvu_obvodu = execSync(`python3 "${cwd()}/../obce/seznam_obvodů.py" --obec "${req.params.obec}" --vypsat "název"`)

    seznam_obvodu = eval(seznam_obvodu.toString())

    seznam_nazvu_obvodu = eval(seznam_nazvu_obvodu.toString())

    return res.type("text/javascript").render(`${cwd()}/společné/mapy/vykreslení/obvody.ejs`, {seznam_obvodu, seznam_nazvu_obvodu})
})

router.use("/:obec/", pomocnefunkce.prehled)
router.use("/:obec/", legenda)
router.use("/:obec/:obvod/", pomocnefunkce.prehled)
router.use("/:obec/:obvod/", legenda)

obce.use("/obce/", router)

module.exports = obce;