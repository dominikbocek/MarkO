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

    if((info["druh"] == "prezidentské" && (req.params.kolo == undefined || (req.params.kolo !== "první kolo" && req.params.kolo !== "druhé kolo"))) || (info["druh"] !== "prezidentské" && req.params.kolo !== undefined) || (info["druh"] == "komunální") && req.params.obec == undefined) {
        return next()
    }

    if(req.params.obec == undefined) {
        return res.render(`${cwd()}/společné/volby/volby.ejs`, { info })
    }

    let info_obec = execSync(`python3 "${cwd()}/../společné/vypsat_obce.py" --kodobec ${req.params.obec} --json ano`)

    try {
        info_obec = JSON.parse(info_obec.toString()) // pokud obec neexistuje v seznamu, prehled se nezobrazí
    } catch (error) {
        chyby.chyba(error)
        return next()
    }

    return res
        .render(`${cwd()}/společné/volby/volby.ejs`, { info })
})

/*prehled.get("./", (req, res, next) => {
    if(req.url.endsWith("/")) {

        return res.redirect(301, req.baseUrl + req.path + "prehled");
    }
})*/

module.exports = {nacistJSON, urllomitka, prehled}