const express = require('express');
const { chdir, cwd } = require('node:process');
const fs = require('fs');
const { exec, execSync } = require('child_process');
const chyby = require('./chyby.js')

function nacistJSON(volby) {
    let soubor = `${cwd()}/../sada/${volby}/info.json`
    if (fs.existsSync(soubor)) {
        try {
            return (JSON.parse(fs.readFileSync(`${cwd()}/../sada/${volby}/info.json`).toString()))
        } catch (error) {
            throw new chyby.AppError("Neplatný JSON soubor.", 404)
        }
    } else {
        throw new chyby.AppError("Zadaný soubor neexistuje", 404)
    }
}

function overeni(req, res, next, info, typzobrazeni = "") {

    switch (info["druh"]) {
        case "komunální":
            if(req.params.obec !== undefined) {
                if(req.params.obvod == undefined) {
                    if(!fs.existsSync(`${cwd()}/volby/${req.params.volby}/obce/${req.params.obec}/vysledky_cr_${req.params.obec}.json`)) {
                        throw new chyby.AppError("Obec neexistuje.", 404)
                    }

                    if(typzobrazeni == "samostatné" && !fs.existsSync(`${cwd()}/volby/${req.params.volby}/obce/${req.params.obec}/samostatné`)) {
                        throw new chyby.AppError("Volební subjekty nebyly zpracovány.", 404)
                    }
                } else {
                    if(!fs.existsSync(`${cwd()}/volby/${req.params.volby}/obce/${req.params.obec}/${req.params.obvod}/vysledky_cr_${req.params.obvod}.json`)) {
                        console.log(req.params.obvod)
                        throw new chyby.AppError("Obvod neexistuje.", 404)
                    }

                    if(typzobrazeni == "samostatné" && !fs.existsSync(`${cwd()}/volby/${req.params.volby}/obce/${req.params.obec}/${req.params.obvod}/samostatné`)) {
                        throw new chyby.AppError("Volební subjekty nebyly zpracovány.", 404)
                    }
                }
            } else if(!fs.existsSync(`${cwd()}/volby/${req.params.volby}/volebni_okrsky-topo.json`) || req.params.kolo !== undefined || typzobrazeni == "normální" || typzobrazeni == "samostatné") {
                throw new chyby.AppError("Volby nebyly zpracovány.", 404)
            }
            break;
        case "krajské":
        case "sněmovní":
            if (!fs.existsSync(`${cwd()}/volby/${req.params.volby}/statistics.csv`) || req.params.kolo !== undefined) {// byly volby zpracovány?
                throw new chyby.AppError("Volby nebyly zpracovány.", 404)
            }
    
            if(typzobrazeni == "samostatné" && !fs.existsSync(`${cwd()}/volby/${req.params.volby}/samostatné`)) {
                throw new chyby.AppError("Volební subjekty nebyly zpracovány.", 404)
            }
    
            break;
        case "prezidentské":
            if (!fs.existsSync(`${cwd()}/volby/${req.params.volby}/${req.params.kolo}/statistics.csv`)) {// byly volby zpracovány?
                throw new chyby.AppError("Volby nebyly zpracovány.", 404)
            }
    
            info.kolo = req.params.kolo
    
            if(typzobrazeni == "samostatné" && !fs.existsSync(`${cwd()}/volby/${req.params.volby}/${req.params.kolo}/samostatné`)) {
                throw new chyby.AppError("Volební subjekty nebyly zpracovány.", 404)
            }
            break;
        default:
            throw new chyby.AppError("Neznámý druh voleb.", 500)
            //break;
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

prehled.get(["/prehled", "/"], (req, res, next) => {

    let info = nacistJSON(req.params.volby)

    overeni(req, res, next, info)

    if(req.params.obec == undefined) {
        if(req.originalUrl.endsWith("/") || !req.originalUrl.endsWith("/prehled")) {
            return res.redirect(301, req.baseUrl + req.path + "prehled");
        }
        info.lokalita = {druh: "stát"}
        return res.render(`${cwd()}/společné/volby/volby.ejs`, { info })
    }

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

    if(req.originalUrl.endsWith("/") || !req.originalUrl.endsWith("/prehled")) {
        return res.redirect(301, req.baseUrl + req.path + "prehled");
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

module.exports = {nacistJSON, urllomitka, overeni, prehled}