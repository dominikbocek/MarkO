// MarkO: webová verze



const express = require('express');
const router = express.Router();
const { chdir, cwd } = require('node:process');
const fs = require('fs');
const { exec, execSync } = require('child_process');
const chyby = require("./chyby.js")
const volby = require("./mapy-a-volby.js")
const { exportdoPNG } = require("../společné/mapy/js/svg2png.js")
const pomocnefunkce = require("./pomocne.js")

router.get('/vypsat-volby', (req, res, next) => {
    exec(`python3 "${cwd()}/../společné/zobrazit_volby.py"`, (error, stdout, stderr) => {
        if (error) {
            chyby.chyba(error)
        }
        if (stderr) {
            chyby.chyba(stderr)
        }

        res.render(`${cwd()}/webMarkO/prvnifaze.ejs`, {seznamvoleb: stdout})
    });
});


/////////////////////////////////////
// SEKCE ZRACOVÁNÍ VÝSLEDKŮ VOLEB //
///////////////////////////////////

function vyberverzi(info) {
    let verzeprogramu
    switch (info["druh"]) {
        case "krajské":
        case "sněmovní":
            verzeprogramu = "kraje a sněmovna"
            break;
        case "prezidentské":
            verzeprogramu = "prezident"
            break;
        case "komunální":
            verzeprogramu = "obce"
            break;
        default:
            throw new chyby.AppError("Neznámý druh voleb.", 500)
    }

    return verzeprogramu
}

// lockfile: https://stackoverflow.com/a/185473

router.post('/okrskove-mapy', (req, res, next) => {
    let volby = req.body.volby;
    let kolo = req.body.kolo //pouze pro prezidentské volby
    let obec = req.body.obec // pouze pro komunální volby

    const info = pomocnefunkce.nacistJSON(volby)

    if((info["druh"] == "prezidentské" && kolo == undefined) || (info["druh"] == "komunální" && obec == undefined)) {
        return res.render(`${cwd()}/webMarkO/komunal_a_prezident.ejs`, {info, volby})
    }

    let verzeprogramu = vyberverzi(info)

    if(info["druh"] == "komunální") {
        if(fs.existsSync(`${cwd()}/volby/${volby}/obce/${obec}/volebni_okrsky-topo.json`)) {
            let zprava = `Mapa okrskových vítězů pro tyto volby už existuje. Pro zobrazení klikněte <a href="/volby/${volby}/obce/${obec}/vitez" target="_blank">sem</a>.`
            return res.render(`${cwd()}/webMarko/druhafaze.ejs`, {volby, info, zprava, obec, jizexistuje: true})
        }

        let command = `cd "${cwd()}/../obce/" && bash ./volebni_mapy.sh -n "${volby}" "" ${obec}`

        return exec(command, (error, stdout, stderr) => {
            if(error) {
                chyby.chyba(`${error}\n${command}`)
                return res.status(500).send(error)
            }
            if(stderr) {
                chyby.chyba(`${stderr}\n${command}`)
                return res.status(500).send(stderr)
            }

            let zprava = `<span>Vytvoření mapy dokončeno. Pro zobrazení klikněte <a href="/volby/${volby}/obce/${obec}/vitez" target="_blank">sem</a>.</span>`
            res.render(`${cwd()}/webMarko/druhafaze.ejs`, {volby, zprava, info, obec})
        })
    }

    let prezident //pouze pro prezidentské volby
    if (kolo == "1") {prezident = "první kolo"} else if (kolo == "2") {prezident = "druhé kolo"} else {prezident = ""}

    if(fs.existsSync(`${cwd()}/volby/${volby}/${prezident}/volebni_okrsky-simple-topo.json`)) {
        let zprava = `Mapa okrskových vítězů pro tyto volby už existuje. Pro zobrazení klikněte <a href="/volby/${volby}/${prezident}/" target="_blank">sem</a>.`
        return res.render(`${cwd()}/webMarko/druhafaze.ejs`, {volby, zprava, info, kolo, jizexistuje: true})
    }

    let command = `cd "${cwd()}/../${verzeprogramu}/${prezident}" && bash ./volebni_mapy.sh -n "${volby}"`
        
    return exec(command, (error, stdout, stderr) => {
        if (error) {
            chyby.chyba(`${error}\n${command}`)
            return res.status(500).send(error)
        }
        if (stderr) {
            chyby.chyba(`${stderr}\n${command}`)
            return res.status(500).send(stderr)
        }

        let zprava = `Vytvoření mapy dokončeno. Pro zobrazení klikněte <a href="volby/${volby}/${prezident}/vitez" target="_blank">sem</a>.`
        res.render(`${cwd()}/webMarko/druhafaze.ejs`, {volby, zprava, info, kolo});
    });
});

router.post('/kandidujici-subjekty', (req, res, next) => {
    let volby = req.body.volby;
    let seznam = req.body.seznam //???
    let vytvorit = req.body.vytvorit
    let druh_map = req.body.druh_map
    let kolo = req.body.kolo
    let obec = req.body.obec
    let prezident = "."

    const info = pomocnefunkce.nacistJSON(volby)

    let verzeprogramu = vyberverzi(info)

    let command

    if(info["druh"] == "komunální") {
        if(druh_map == "vítězné") {
            command = `cd "${cwd()}/../${verzeprogramu}/${prezident}" && bash ./volebni_mapy.sh -s "${volby}" ${obec} "základ+koalice" ano`
        } else if(druh_map == "samostatné") {
            command = `cd "${cwd()}/../${verzeprogramu}/${prezident}" && bash ./volebni_mapy.sh -s "${volby}" ${obec} "všechno" ano`
        }

        return exec(command, (error, stdout, stderr) => {
            if (error) {
                chyby.chyba(`${error}\n${command}`)
                return res.status(500).send(error)
            }
            if (stderr) {
                chyby.chyba(`${stderr}\n${command}`)
                return res.status(500).send(stderr)
            }
            res.render(`${cwd()}/webMarko/tretifaze.ejs`, {volby, subjekty: `${stdout}`, info, kolo, obec, vytvorit, druh_map});
        })
    }

    if (kolo == "1") {prezident = "první kolo"} else if (kolo == "2") {prezident = "druhé kolo"}
    if(druh_map == "vítězné") {
        command = `cd "${cwd()}/../${verzeprogramu}/${prezident}" && bash ./volebni_mapy.sh -s "${volby}" "základ+koalice" ano`
    } else if(druh_map == "samostatné") {
        command = `cd "${cwd()}/../${verzeprogramu}/${prezident}" && bash ./volebni_mapy.sh -s "${volby}" "všechno" ano`
    }

    exec(command, (error, stdout, stderr) => {
        if (error) {
            chyby.chyba(`${error}\n${command}`)
            return res.status(500).send(error)
        }
        if (stderr) {
            chyby.chyba(`${stderr}\n${command}`)
            return res.status(500).send(stderr)
        }

        res.render(`${cwd()}/webMarko/tretifaze.ejs`, {volby, subjekty: `${stdout}`, kolo, info, vytvorit, druh_map});
    });
});

router.post('/samostatne-mapy', (req, res, next) => {
    let volby = req.body.volby;
    let cisla = req.body.cisla
    let kolo = req.body.kolo
    let obec = req.body.obec
    let prezident = "."

    const info = pomocnefunkce.nacistJSON(volby)

    let command

    switch (info["druh"]) {
        case "prezidentské":
            if (kolo == "1") {prezident = "první kolo"} else if (kolo == "2") {prezident = "druhé kolo"}
            // opatření pro druhé kolo, protože verze programu je osekaná až na kost
            command = `cd "${cwd()}/../prezident/${prezident}" && bash ./samostatne.sh -n "${volby}"`
            break;
        case "sněmovní":
            command = `cd "${cwd()}/../kraje a sněmovna/" && bash ./samostatne.sh -n "${volby}"`
            break;
        case "komunální":
            command = `cd "${cwd()}/../obce/" && bash ./samostatne.sh -n "${volby}" "${cisla}" "${obec}"`
            break;
        default:
            break;
    }

    return exec(command, (error, stdout, stderr) => {
        if (error) {
            chyby.chyba(`${error}\n${command}`)
            return res.status(500).send(error)
        }
        if (stderr) {
            chyby.chyba(`${stderr}\n${command}`)
            return res.status(500).send(stderr)
        }
        res.send(`Vytvoření map dokončeno. Pro zobrazení klikněte <a href="volby/${volby}/${prezident}/samostatné/" target="_blank">sem</a>.`);
    });
});

router.post('/koalice', (req, res, next) => {
    let cisla = req.body.cisla
    let druh_map = req.body.druh_map
    let volby = req.body.volby
    let nazev_koalice = req.body.nazev_koalice
    let zkratka_koalice = req.body.zkratka_koalice
    let obec = req.body.obec

    const info = pomocnefunkce.nacistJSON(volby)

    let command
    let odpoved

    switch (info["druh"]) {
        case "sněmovní":
        case "krajské":
            if(druh_map == "vítězné") {
                command = `cd "${cwd()}/../kraje a sněmovna/" && bash ./volebni_mapy.sh -k "${volby}" "${cisla}" "${nazev_koalice}" "${zkratka_koalice}"`
                odpoved = `Vytvoření mapy dokončeno. Pro zobrazení klikněte <a href="volby/${volby}/vitez?koalice" target="_blank">sem</a>.`
            } else if (druh_map == "samostatné") {
                command = `cd "${cwd()}/../kraje a sněmovna/" && bash ./volebni_mapy.sh -koalice-samostatne "${volby}" "${cisla}" "${nazev_koalice}" "${zkratka_koalice}"`
                odpoved = `Vytvoření mapy dokončeno. Pro zobrazení klikněte <a href="volby/${volby}/samostatné/" target="_blank">sem</a>.`
            }
            break;
        case "prezidentské":
            if(druh_map == "vítězné") {
                command = `cd "${cwd()}/../prezident/první kolo" && bash ./volebni_mapy.sh -k "${volby}" "${cisla}" "${nazev_koalice}" "${zkratka_koalice}"`
            } else if(druh_map == "samostatné") {
                command = `cd "${cwd()}/../prezident/první kolo" && bash ./volebni_mapy.sh -koalice-samostatne "${volby}" "${cisla}" "${nazev_koalice}" "${zkratka_koalice}"`
                odpoved = `Vytvoření mapy dokončeno. Pro zobrazení klikněte <a href="volby/${volby}/první kolo/samostatné/" target="_blank">sem</a>.`
            }
            break;
        case "komunální": // u odkazů neexistuje podpora pro samosprávné obvody
            if(druh_map == "vítězné") {
                command = `cd "${cwd()}/../obce/" && bash ./volebni_mapy.sh -k "${volby}" "${obec}" "${cisla}" "${nazev_koalice}" "${zkratka_koalice}"`
                odpoved = `Vytvoření mapy dokončeno. Pro zobrazení klikněte <a href="volby/${volby}/obce/${obec}/vitez?koalice" target="_blank">sem</a>.`
            } else if(druh_map == "samostatné") {
                command = `cd "${cwd()}/../obce/" && bash ./volebni_mapy.sh -koalice-samostatne "${volby}" "${obec}" "${cisla}" "${nazev_koalice}" "${zkratka_koalice}"`
                odpoved = `Vytvoření mapy dokončeno. Pro zobrazení klikněte <a href="volby/${volby}/obce/${obec}/samostatné" target="_blank">sem</a>.`
            }
            break;
        default:
            throw new chyby.AppError("Neznámý druh voleb.", 500)
    }

    exec(command, (error, stdout, stderr) => {
        if (error) {
            chyby.chyba(`${error}\n${command}`)
            return res.status(500).send(error)
        }
        if (stderr) {
            chyby.chyba(`${stderr}\n${command}`)
            return res.status(500).send(stderr)
        }
        res.send(odpoved);
    });
});

router.get("/volby", (req, res, next) => {
    let command = `python3 "${cwd()}/zobrazit_zpracované_volby.py"`
    var seznam = execSync(`python3 "${cwd()}/zobrazit_zpracované_volby.py"`, (error, stdout, stderr) => {
            if (error) {
                chyby.chyba(`${error}\n${command}`)
                return res.status(500).send(error)
            }
            if (stderr) {
                chyby.chyba(`${stderr}\n${command}`)
                return res.status(500).send(stderr)
            }
        })

    command = `python3 "${cwd()}/zobrazit_zpracované_volby.py" --cesta ano`
    var cesty = execSync(`python3 "${cwd()}/zobrazit_zpracované_volby.py" --cesta ano`, (error, stdout, stderr) => {
        if (error) {
            chyby.chyba(`${error}\n${command}`)
            return res.status(500).send(error)
        }
        if (stderr) {
            chyby.chyba(`${stderr}\n${command}`)
            return res.status(500).send(stderr)
        }
    })

    seznam = eval(seznam.toString())
    cesty = eval(cesty.toString())

    res.render(`${cwd()}/společné/volby/tailadmin/seznam.html`, {seznam:seznam, cesty:cesty});
})

// ostatní věci

router.post("/stahnout", async (req, res, next) => {

    let svg = req.body.svg
    let legenda = req.body.legenda

    const vysledek = exportdoPNG(svg, legenda)
    vysledek.then(function(obrazek) {
        res.set({
            "Content-Type": "image/png",
            "Content-Disposition": 'attachment; filename="mapa.png"',
            "Content-Length": obrazek.length
        });
        res.send(obrazek)
    })
})

router.use("/volby", volby)

module.exports = router;