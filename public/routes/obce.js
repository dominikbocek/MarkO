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

// univerzální funkce pro obce komumálních a ostatních voleb

function obce_ostatni_volby(url, typzobrazeni) {

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
                if(!fs.existsSync(`${cwd()}/volby/${req.params.volby}/obce/${req.params.obec}/${req.params.obec}.csv`)) {
                    return next()
                }

                if(typzobrazeni == "samostatné" && !fs.existsSync(`${cwd()}/volby/${req.params.volby}/obce/${req.params.obec}/samostatné`)) {
                    return next()
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

        let info_obec

        try {
            info_obec = execSync(`python3 "${cwd()}/../společné/vypsat_obce.py" --kodobec ${req.params.obec} --json ano`)
        } catch (error) {
            chyby.chyba(error)
            return next()
        }

        try {
            info_obec = JSON.parse(info_obec.toString())
        } catch (error) {
            return next()
        }

        info.lokalita = info_obec
        info.lokalita.druh = "obec"

        const souborynastaveni = fs.readdirSync(`${cwd()}/společné/mapy/nastavení`)

        if(info["druh"] == "komunální") {
            return res.render(`${cwd()}/společné/mapa.html`, {volby:req.params.volby, info:info, typzobrazeni:typzobrazeni, souborynastaveni: souborynastaveni});
        }

        let verze
        switch (info["druh"]) {
            case "sněmovní":
                verze = "sněmovna"
                break;
            case "krajské":
                verze = "kraje"
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

        if(info["druh"] == "krajské" && req.params.obec == 554782) { // vyloučení Prahy u krajských voleb
            return next()
        }

        return res.render(`${cwd()}/společné/mapa.html`, {volby:req.params.volby, info:info, typzobrazeni:typzobrazeni, souborynastaveni: souborynastaveni})
    })
}

obce_ostatni_volby("/:obec/vitez", "normální")
obce_ostatni_volby("/:obec/samostatn%C3%A9/", "samostatné")
obce_ostatni_volby("/:obec/ucast", "účast")

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
            verze = "sněmovna"
            break;
        case "krajské":
            verze = "kraje"
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

router.use("/:obec/", pomocnefunkce.prehled)
router.use("/:obec/:obvod/", pomocnefunkce.prehled)
router.use("/:obec/", legenda)
router.use("/:obec/:obvod/", legenda)

obce.use("/obce/", router)

module.exports = obce;