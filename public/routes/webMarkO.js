// MarkO: webová verze



const express = require('express');
const router = express.Router();
const { chdir, cwd } = require('node:process');
const fs = require('fs');
const { exec, execSync } = require('child_process');

router.post('/vypsat-volby', (req, res, next) => {
    exec(`cd "${cwd()}/../příprava/volby" && python3 zobrazit_volby.py`, (error, stdout, stderr) => {
        if (error) {
            chyba(error)
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
        }
        res.send(`${stdout}`);
    });
});


/////////////////////////////////////
// SEKCE ZRACOVÁNÍ VÝSLEDKŮ VOLEB //
///////////////////////////////////

// lockfile: https://stackoverflow.com/a/185473

router.post('/okrskove-mapy', (req, res, next) => {
    volby = req.body.volby;
    kolo = req.body.kolo //pouze pro prezidentské volby
    prezident = kolo //pouze pro prezidentské volby
    if (kolo == "1") {prezident = "první kolo"} else if (kolo == "2") {prezident = "druhé kolo"}
    if(!fs.existsSync(`${cwd()}/volby/${volby}/${prezident}/volebni_okrsky-simple-data-topo.json`)) {
        exec(`cd "volby/${volby}/${prezident}" && bash ./volebni_mapy.sh -n`, (error, stdout, stderr) => {
            if (error) {
                chyba(error)
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
            res.send(`Vytvoření mapy dokončeno. Pro zobrazení klikněte <a href="volby/${volby}/${prezident}/" target="_blank">sem</a>.`);
        });
    } else {
        res.send(`Mapa okrskových vítězů pro tyto volby už existuje. Pro zobrazení klikněte <a href="volby/${volby}/${prezident}/" target="_blank">sem</a>.`)
    }
});

router.post('/kandidujici-subjekty', (req, res, next) => {
    volby = req.body.volby;
    druh_voleb = req.body.druh_voleb
    seznam = req.body.seznam
    druh_map = req.body.druh_map
    kolo = req.body.kolo
    prezident = "."
    if (kolo == "1") {prezident = "první kolo"} else if (kolo == "2") {prezident = "druhé kolo"}
    if(druh_map == "vítězné") {
        command = `cd "volby/${volby}/${prezident}" && bash ./volebni_mapy.sh -s "základ+koalice" ano`
    } else if(druh_map == "samostatné") {
        command = `cd "volby/${volby}/${prezident}" && bash ./volebni_mapy.sh -s "všechno" ano`
    }
    if (druh_voleb == "prezident") {prezident = "první kolo"}
    exec(command, (error, stdout, stderr) => {
        if (error) {
            chyba(error)
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
        }
        res.send(`${stdout}`);
    });
});

router.post('/samostatne-mapy', (req, res, next) => {
    volby = req.body.volby;
    cisla = req.body.cisla
    druh_voleb = req.body.druh_voleb
    kolo = req.body.kolo
    prezident = "."
    if (kolo == "1") {prezident = "první kolo"} else if (kolo == "2") {prezident = "druhé kolo"}
    // opatření pro druhé kolo, protože verze programu je osekaná až na kost
    if (kolo == "2") {command = `cd "volby/${volby}/${prezident}" && bash ./samostatne.sh -n`}
    else {command = `cd "volby/${volby}/${prezident}" && bash ./samostatne.sh -k "${cisla}" ano`}
    exec(command, (error, stdout, stderr) => {
        if (error) {
            chyba(error)
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
        }
        res.send(`Vytvoření map dokončeno. Pro zobrazení klikněte <a href="volby/${volby}/${prezident}/samostatné/" target="_blank">sem</a>.`);
    });
});

router.post('/koalice', (req, res, next) => {
    druh_voleb = req.body.druh_voleb;
    cisla = req.body.cisla
    druh_map = req.body.druh_map
    volby = req.body.volby
    nazev_koalice = req.body.nazev_koalice
    zkratka_koalice = req.body.zkratka_koalice
    prezident = "."
    if (druh_voleb == "prezident") {prezident = "první kolo"}
    if (druh_map == "vítězné") {
        command = `cd "volby/${volby}/${prezident}" && bash ./volebni_mapy.sh -k "${cisla}" "${nazev_koalice}" "${zkratka_koalice}"`
        odpoved = `Vytvoření mapy dokončeno. Pro zobrazení klikněte <a href="volby/${volby}/${prezident}/?koalice" target="_blank">sem</a>.`
    } else if (druh_map == "samostatné") {
        command = `cd "volby/${volby}/${prezident}" && bash ./volebni_mapy.sh -koalice-samostatne "${cisla}" "${nazev_koalice}" "${zkratka_koalice}"`
        odpoved = `Vytvoření mapy dokončeno. Pro zobrazení klikněte <a href="volby/${volby}/${prezident}/samostatné/" target="_blank">sem</a>.`
    }
    exec(command, (error, stdout, stderr) => {
        if (error) {
            chyba(error)
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
        }
        res.send(odpoved);
    });
});

router.get("/volby", (req, res, next) => {
    var seznam = execSync(`python3 "${cwd()}/zobrazit_zpracované_volby.py"`, (error, stdout, stderr) => {
            if (error) {
                chyba(error)
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
        })
    var cesty = execSync(`python3 "${cwd()}/zobrazit_zpracované_volby.py" --cesta ano`, (error, stdout, stderr) => {
        if (error) {
            chyba(error)
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
        }
    })
    var mapy_koalic = []
    var samostatne_mapy = []

    seznam = eval(seznam.toString())
    cesty = eval(cesty.toString())

    cesty.forEach(element => {
        if(fs.existsSync(`${cwd()}/volby/${element}/samostatné/`)) {
            samostatne_mapy.push("mapy voličské podpory")
        } else {
            samostatne_mapy.push("")
        }

        if(fs.existsSync(`${cwd()}/volby/${element}/volebni_okrsky-simple-data-topo2.json`)) {
            mapy_koalic.push("koalice")
        } else {
            mapy_koalic.push("")
        }
    });

    res.render(`${cwd()}/společné/volby/seznam.html`, {seznam:seznam, cesty:cesty, mapy_koalic:mapy_koalic, samostatne_mapy:samostatne_mapy});
})

const volby = require("./mapy-a-volby.js")
router.use("/volby", volby)

const chyby = require("./chyby.js")
router.use(chyby)

module.exports = router;