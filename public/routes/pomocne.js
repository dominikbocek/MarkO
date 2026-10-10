const express = require('express');
const { chdir, cwd } = require('node:process');
const fs = require('fs');
const { exec, execSync } = require('child_process');
const chyby = require('./chyby.js')

function nacistJSON(volby) {
    let soubor = `${cwd()}/../sada/${volby}/info.json`
    if (fs.existsSync(soubor)) {
        return (JSON.parse(fs.readFileSync(`${cwd()}/../sada/${volby}/info.json`).toString()))
    } else {
        return null
    }
}

function urllomitka(url, req, res) {
    if(url.endsWith("/") && !req.path.endsWith("/")) {
        const queryIndex = req.originalUrl.indexOf("?"); //zjistí, zda původní url obsahovala nějaké query
        const query = queryIndex !== -1 ? req.originalUrl.substring(queryIndex) : "";

        return res.redirect(301, req.baseUrl + req.path + "/" + query); // a přilepí ho zpátky
    }

    if(!url.endsWith("/") && req.path.endsWith("/")) {
        // nepředpokládá se query
        return res.redirect(301, req.baseUrl + req.path.substring(0, req.path.length - 1))
    }

    return 0
}

// dasboard s výsledky voleb

const prehled = express.Router({ mergeParams: true })

prehled.get("/prehled", (req, res, next) => {
    let info = nacistJSON(req.params.volby)

    if (info == null) {
        return next()
    }

    switch (info["druh"]) {// byly volby zpracovány?
        case "krajské":
        case "sněmovní":
            if (!fs.existsSync(`${cwd()}/volby/${req.params.volby}/statistics.csv`) || req.params.kolo !== undefined) {
                return next();
            }
            break;
        case "prezidentské":
            if (!fs.existsSync(`${cwd()}/volby/${req.params.volby}/${req.params.kolo}/statistics.csv`)) {
                return next();
            }
            break;
        case "komunální":
            if (!fs.existsSync(`${cwd()}/volby/${req.params.volby}/obce/${req.params.obec}/${req.params.obec}.csv`)) {
                return next();
            }
            break;
    }

    if(info["druh"] == "prezidentské") {
        info.kolo = req.params.kolo
    }

    if(req.params.obec == undefined) {
        info.lokalita = {druh: "stát"}
        return res.render(`${cwd()}/společné/volby/volby.ejs`, { info })
    }

    let info_obec

    if(req.params.obvod == undefined) {
        info_obec = execSync(`python3 "${cwd()}/../obce/vypsat_obce.py" --vyhledat obec --hledanahodnota ${req.params.obec} --json ano`)
    } else {
        info_obec = execSync(`python3 "${cwd()}/../obce/vypsat_obce.py" --vyhledat obec --hledanahodnota ${req.params.obvod} --json ano`)
    }

    try {
        info_obec = JSON.parse(info_obec.toString()) // pokud obec neexistuje v seznamu, prehled se nezobrazí
    } catch (error) {
        chyby.chyba(error)
        return next()
    }

    info.lokalita = info_obec

    if(req.params.obvod == undefined) {
        info.lokalita.druh = "obec"
    } else {
        info.lokalita.druh = "obvod"
    }


    let seznam_obvodu = execSync(`python3 "${cwd()}/../obce/seznam_obvodů.py" --obec "${req.params.obec}"`)

    let seznam_nazvu_obvodu = execSync(`python3 "${cwd()}/../obce/seznam_obvodů.py" --obec "${req.params.obec}" --vypsat "název"`)

    seznam_obvodu = eval(seznam_obvodu.toString())

    seznam_nazvu_obvodu = eval(seznam_nazvu_obvodu.toString())

    return res.render(`${cwd()}/společné/volby/volby.ejs`, { info , obvody:seznam_obvodu, nazvy:seznam_nazvu_obvodu})
})

prehled.get("/", (req, res, next) => {
    if(req.originalUrl.endsWith("/")) {
        return res.redirect(301, req.baseUrl + req.path + "prehled");
    } else {
        return next()
    }
})

module.exports = {nacistJSON, urllomitka, prehled}