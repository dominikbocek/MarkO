const express = require('express');
const router = express.Router({mergeParams: true});
const { chdir, cwd } = require('node:process');
const fs = require('fs');
const { exec, execSync } = require('child_process');
const pomocnefunkce = require("./pomocne.js")
const chyby = require("./chyby.js")

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

    return res.render(`${cwd()}/společné/volby/obce.ejs`, {info})
})

// univerzální funkce pro obce a obvody komumálních a ostatních voleb

function obce_obvody_vsechny_volby(url, typzobrazeni) {

    return router.get(url, (req, res, next) => {

        req.acceptsCharsets('utf-8')

        if(pomocnefunkce.urllomitka(url, req, res) !== 0) {
            return
        }

        let info = pomocnefunkce.nacistJSON(req.params.volby) // existují volby v seznamu?

        if(info == null) {
            return next()
        }

        switch (info["druh"]) { // byly volby zpracovány?
            case "komunální":
                if(req.params.obvod == undefined){
                    if(!fs.existsSync(`${cwd()}/volby/${req.params.volby}/obce/${req.params.obec}/${req.params.obec}.csv`)) {
                        return next()
                    }

                    if(typzobrazeni == "samostatné" && !fs.existsSync(`${cwd()}/volby/${req.params.volby}/obce/${req.params.obec}/samostatné`)) {
                        return next()
                    }
                } else {
                    if(!fs.existsSync(`${cwd()}/volby/${req.params.volby}/obce/${req.params.obec}/${req.params.obvod}/${req.params.obvod}.csv`)) {
                        return next()
                    }

                    if(typzobrazeni == "samostatné" && !fs.existsSync(`${cwd()}/volby/${req.params.volby}/obce/${req.params.obec}/${req.params.obvod}/samostatné`)) {
                        return next()
                    }
                }
                break;
            case "prezidentské":
                if(!fs.existsSync(`${cwd()}/volby/${req.params.volby}/${req.params.kolo}/statistics.csv`)) {
                    return next()
                }

                if(typzobrazeni == "samostatné" && !fs.existsSync(`${cwd()}/volby/${req.params.volby}/${req.params.kolo}/samostatné`)) {
                    return next()
                }
                
                break;
            case "sněmovní":
            case "krajské":
                if(!fs.existsSync(`${cwd()}/volby/${req.params.volby}/statistics.csv`)) {
                    return next()
                }

                if(typzobrazeni == "samostatné" && !fs.existsSync(`${cwd()}/volby/${req.params.volby}/samostatné`)) {
                    return next()
                }
            break;
        }

        if(req.params.obec == undefined) {
            info.lokalita = {druh: "stát"}
            return res.render(`${cwd()}/společné/volby/volby.ejs`, {volby:req.params.volby, info:info, typzobrazeni:typzobrazeni, souborynastaveni: souborynastaveni})
        }

        let info_obec

        if(req.params.obvod == undefined) {
            info_obec = execSync(`python3 "${cwd()}/../obce/vypsat_obce.py" --vyhledat obec --hledanahodnota ${req.params.obec} --json ano`)
        } else {
            info_obec = execSync(`python3 "${cwd()}/../obce/vypsat_obce.py" --vyhledat obec --hledanahodnota ${req.params.obvod} --json ano`)
        }

        try {// v případě, že obec nebude nalezena, vrací python prázdný výstup, NIKOLIV PRÁZDNÝ JSON 
            info_obec = JSON.parse(info_obec.toString())
        } catch (error) {
            return next()
        }

        info.lokalita = info_obec

        if(req.params.obvod == undefined) {
            info.lokalita.druh = "obec"
        } else {
            info.lokalita.druh = "obvod"
        }

        const souborynastaveni = fs.readdirSync(`${cwd()}/společné/mapy/nastavení`)

        if(info["druh"] == "krajské" && req.params.obec == 554782) { // vyloučení Prahy u krajských voleb
            return next()
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
legenda.get("/vysledky_cr.json", (req, res, next) => {
    let info = pomocnefunkce.nacistJSON(req.params.volby) // existují volby v seznamu?

    if(info == null) {
        return next()
    }

    if(info["druh"] == "komunální") {
        if(req.params.obvod !== undefined) {
            return res.sendFile(`${cwd()}/volby/${req.params.volby}/obce/${req.params.obec}/${req.params.obvod}/vysledky_cr_${req.params.obvod}.json`)    
        }

        return res.sendFile(`${cwd()}/volby/${req.params.volby}/obce/${req.params.obec}/vysledky_cr_${req.params.obec}.json`)
    }

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
            return next()
    }

    var filtrovanalegenda = execSync(`python3 "${cwd()}/../${verze}/legenda.py" --volby "${req.params.volby}" --kodobec ${req.params.obec}`)
    return res.send(filtrovanalegenda)
})

router.get("/:obec/seznam_obvodu.js", (req, res, next) => {
    let seznam_obvodu = execSync(`python3 "${cwd()}/../obce/seznam_obvodů.py" --volby "${req.params.volby}" --obec "${req.params.obec}"`)

    let seznam_nazvu_obvodu = execSync(`python3 "${cwd()}/../obce/seznam_obvodů.py" --volby "${req.params.volby}" --obec "${req.params.obec}" --vypsat "název"`)

    seznam_obvodu = eval(seznam_obvodu.toString())

    seznam_nazvu_obvodu = eval(seznam_nazvu_obvodu.toString())

    return res.type("text/javascript").render(`${cwd()}/společné/mapy/vykreslení/obvody.ejs`, {seznam_obvodu, seznam_nazvu_obvodu})
})

router.use("/:obec/", pomocnefunkce.prehled)
router.use("/:obec/:obvod/", pomocnefunkce.prehled)
router.use("/:obec/", legenda)
router.use("/:obec/:obvod/", legenda)

obce.use("/obce/", router)

module.exports = obce;

//obvody??? u nekomunálních voleb