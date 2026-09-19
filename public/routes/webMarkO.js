// MarkO: webová verze



const express = require('express');
const router = express.Router();
const { chdir, cwd } = require('node:process');
const fs = require('fs');
const { exec, execSync } = require('child_process');
const chyby = require("./chyby.js")
const volby = require("./mapy-a-volby.js")
const pomocnefunkce = require("./pomocne.js")

router.get('/vypsat-volby', (req, res, next) => {
    exec(`cd "${cwd()}/../příprava/volby" && python3 zobrazit_volby.py`, (error, stdout, stderr) => {
        if (error) {
            chyby.chyba(error)
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
        }
        res.render(`${cwd()}/webMarkO/prvnifaze.ejs`, {seznamvoleb: stdout})
    });
});


/////////////////////////////////////
// SEKCE ZRACOVÁNÍ VÝSLEDKŮ VOLEB //
///////////////////////////////////

function vyberverzi(info, res) {
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
            return res.status(500).send("Vyskytla se chyba...");
    }

    return verzeprogramu
}

// lockfile: https://stackoverflow.com/a/185473

router.post('/okrskove-mapy', (req, res, next) => {
    let volby = req.body.volby;
    let kolo = req.body.kolo //pouze pro prezidentské volby
    let obec = req.body.obec // pouze pro komunální volby

    const info = pomocnefunkce.nacistJSON(volby)

    if(info == null) {
        return res.status(500).send("Vyskytla se chyba...")
    }

    if((info["druh"] == "prezidentské" && kolo == undefined) || (info["druh"] == "komunální" && obec == undefined)) {
        return res.render(`${cwd()}/webMarkO/komunal_a_prezident.ejs`, {info, volby})
    }

    let verzeprogramu = vyberverzi(info, res)

    if(info["druh"] == "komunální") {
        return exec(`cd "${cwd()}/../obce/" && bash ./volebni_mapy.sh -n "${volby}" "" ${obec}`, (error, stdout, stderr) => {
            if(error) {
                console.log(error)
                chyby.chyba(error)
                return res.status(500).send("Vyskytla se chyba...")
            }
            if(stderr) {
                console.log(stderr)
                console.error(`stderr: ${stderr}`);
                return res.status(500).send("Vyskytla se chyba...")
            }

            let zprava = `<span>Vytvoření mapy dokončeno. Pro zobrazení klikněte <a href="/volby/${volby}/obce/${obec}" target="_blank">sem</a>.</span>`
            res.render(`${cwd()}/webMarko/druhafaze.ejs`, {volby, zprava, info, obec})
        })
    }

    prezident = kolo //pouze pro prezidentské volby
    if (kolo == "1") {prezident = "první kolo"} else if (kolo == "2") {prezident = "druhé kolo"} else {prezident = ""}

    if(!fs.existsSync(`${cwd()}/volby/${volby}/${prezident}/volebni_okrsky-simple-data.json`)) {
        return exec(`cd "${cwd()}/../${verzeprogramu}/${prezident}" && bash ./volebni_mapy.sh -n "${volby}"`, (error, stdout, stderr) => {
            if (error) {
                chyby.chyba(error)
                return res.status(500).send("Vyskytla se chyba...")
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                return res.status(500).send("Vyskytla se chyba...")
            }

            let zprava = `Vytvoření mapy dokončeno. Pro zobrazení klikněte <a href="volby/${volby}/${prezident}/" target="_blank">sem</a>.`
            res.render(`${cwd()}/webMarko/druhafaze.ejs`, {volby, zprava, info, kolo});
        });
    } else {
        let zprava = `Mapa okrskových vítězů pro tyto volby už existuje. Pro zobrazení klikněte <a href="/volby/${volby}/${prezident}/" target="_blank">sem</a>.`
        res.render(`${cwd()}/webMarko/druhafaze.ejs`, {volby, zprava, info, kolo})
    }
});

router.post('/kandidujici-subjekty', (req, res, next) => {
    let volby = req.body.volby;
    let seznam = req.body.seznam //???
    let vytvorit = req.body.vytvorit
    let druh_map = req.body.druh_map
    let kolo = req.body.kolo
    let obec = req.body.obec
    let prezident = "."

    console.log(req.body)

    const info = pomocnefunkce.nacistJSON(volby)

    if(info == null) {
        return res.status(500).send("Vyskytla se chyba...")
    }

    let verzeprogramu = vyberverzi(info, res)

    let command

    if(info["druh"] == "komunální") {
        if(druh_map == "vítězné") {
            command = `cd "${cwd()}/../${verzeprogramu}/${prezident}" && bash ./volebni_mapy.sh -s "${volby}" ${obec} "základ+koalice" ano`
        } else if(druh_map == "samostatné") {
            command = `cd "${cwd()}/../${verzeprogramu}/${prezident}" && bash ./volebni_mapy.sh -s "${volby}" ${obec} "všechno" ano`
        }

        return exec(command, (error, stdout, stderr) => {
            if (error) {
                chyby.chyba(error)
                return res.status(500).send("Vyskytla se chyba...")
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                return res.status(500).send("Vyskytla se chyba...")
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

    //if (druh_voleb == "prezidentské") {prezident = "první kolo"} //???
    exec(command, (error, stdout, stderr) => {
        if (error) {
            chyby.chyba(error)
            return res.status(500).send("Vyskytla se chyba...")
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return res.status(500).send("Vyskytla se chyba...")
        }
        res.render(`${cwd()}/webMarko/tretifaze.ejs`, {volby, subjekty: `${stdout}`, kolo, info, vytvorit, druh_map});
    });
});

router.post('/samostatne-mapy', (req, res, next) => {
    let volby = req.body.volby;
    let cisla = req.body.cisla
    let kolo = req.body.kolo
    let prezident = "."

    const info = pomocnefunkce.nacistJSON(volby)

    if(info == null) {
        return res.status(500).send("Vyskytla se chyba...")
    }

    let verzeprogramu = vyberverzi(info, res)

    if (kolo == "1") {prezident = "první kolo"} else if (kolo == "2") {prezident = "druhé kolo"}
    // opatření pro druhé kolo, protože verze programu je osekaná až na kost
    if (kolo == "2") {command = `cd "${cwd()}/../${verzeprogramu}/${prezident}" && bash ./samostatne.sh -n "${volby}"`}
    else {command = `cd "${cwd()}/../${verzeprogramu}/${prezident}" && bash ./samostatne.sh -k "${volby}" "${cisla}" ano`}
    return exec(command, (error, stdout, stderr) => {
        if (error) {
            chyby.chyba(error)
            return res.status(500).send("Vyskytla se chyba...")
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return res.status(500).send("Vyskytla se chyba...")
        }
        res.send(`Vytvoření map dokončeno. Pro zobrazení klikněte <a href="volby/${volby}/${prezident}/samostatné/" target="_blank">sem</a>.`);
    });
});

router.post('/koalice', (req, res, next) => {
    let druh_voleb = req.body.druh_voleb;
    let cisla = req.body.cisla
    let druh_map = req.body.druh_map
    let volby = req.body.volby
    let nazev_koalice = req.body.nazev_koalice
    let zkratka_koalice = req.body.zkratka_koalice
    let prezident = "."

    const info = pomocnefunkce.nacistJSON(volby)

    if(info == null) {
        return res.status(500).send("Vyskytla se chyba...")
    }

    let verzeprogramu = vyberverzi(info, res)

    if (druh_voleb == "prezident") {prezident = "první kolo"}
    if (druh_map == "vítězné") {
        command = `cd "${cwd()}/../${verzeprogramu}/${prezident}" && bash ./volebni_mapy.sh -k "${volby}" "${cisla}" "${nazev_koalice}" "${zkratka_koalice}"`
        odpoved = `Vytvoření mapy dokončeno. Pro zobrazení klikněte <a href="volby/${volby}/${prezident}/?koalice" target="_blank">sem</a>.`
    } else if (druh_map == "samostatné") {
        command = `cd  "${cwd()}/../${verzeprogramu}/${prezident}" && bash ./volebni_mapy.sh -koalice-samostatne "${volby}" "${cisla}" "${nazev_koalice}" "${zkratka_koalice}"`
        odpoved = `Vytvoření mapy dokončeno. Pro zobrazení klikněte <a href="volby/${volby}/${prezident}/samostatné/" target="_blank">sem</a>.`
    }
    exec(command, (error, stdout, stderr) => {
        if (error) {
            chyby.chyba(error)
            return res.status(500).send("Vyskytla se chyba...")
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return res.status(500).send("Vyskytla se chyba...")
        }
        res.send(odpoved);
    });
});

router.get("/volby", (req, res, next) => {
    var seznam = execSync(`python3 "${cwd()}/zobrazit_zpracované_volby.py"`, (error, stdout, stderr) => {
            if (error) {
                chyby.chyba(error)
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
        })
    var cesty = execSync(`python3 "${cwd()}/zobrazit_zpracované_volby.py" --cesta ano`, (error, stdout, stderr) => {
        if (error) {
            chyby.chyba(error)
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

router.use("/volby", volby)

router.use(chyby.router)

module.exports = router;