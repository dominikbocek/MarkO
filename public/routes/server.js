function server() {
    const express = require('express');
    const { exec, execSync } = require('child_process');
    const { chdir, cwd } = require('node:process');

    const chyby = require("./chyby.js")
    const app = express();
    app.engine('html', require('ejs').renderFile);
    app.enable("strict routing");

    // základní nastavení

    app.use(express.urlencoded({
        extended: false,
        limit: "2000mb"
    }));

    app.use(express.json({
        limit: "2000mb"
    }));

    app.use(express.text({
        limit: "2000mb"
    }));

    app.use(express.raw({
        limit: "2000mb"
    }));

    // zachytávání základních url adres

    app.get("/", (req, res, next) => {
        res.render(`${cwd()}/index.html`)
    })

    app.get("/info", (req, res, next) => {
        res.render(`${cwd()}/info.html`)
    })

    app.use(express.static(cwd()))

    // webová verze programu

    const webMarko = require("./webMarkO.js")

    app.use(webMarko)

    /////////////////////////
    //  Zachytávání chyb  //
    ///////////////////////

    // společný handler
    app.use((req, res, next) => {
        return res.status(404).render(`${cwd()}/společné/chyby/chyba.ejs`, {status: 404});
    });

    app.use((err, req, res, next) => {
        console.log(`chyba: ${err}`)
        if (err.statusCode === 500 || err.status === 500) {
            chyby.chyba(err.stack)
            if(err.message == "Neznámý druh voleb.") {
                return res.status(err.statusCode).send(`<pre>${err.stack}</pre>`)
            }
            return res.status(err.statusCode).render(`${cwd()}/společné/chyby/chyba.ejs`, {status: err.statusCode});
        } else if (err.statusCode === 404 || err.status === 404) {
            chyby.chyba(err)
            return res.status(err.statusCode).render(`${cwd()}/společné/chyby/chyba.ejs`, {status: err.statusCode});
        } else {
            console.log(err)
        }
    });

    // Spuštění serveru
    app.listen(global.options.port, () => {
        console.log(`Server běží na http://localhost:${global.options.port}`);
        if(global.options.debug) {
            console.log("Spuštěno v režimu ladění.")
        }
        if(global.options.gui) {
            console.log("Program se spustí ve vašem výchozím prohlížeči. Pokud se tak nestane, zadejte do prohlížeče RUČNĚ adresu 127.0.0.1")
            exec(`python3 -m webbrowser http://127.0.0.1:${global.options.port}/`)
        }
    });
}

module.exports = {
    server
}