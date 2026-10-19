const express = require('express');
const fs = require('fs');
const { exec, execSync } = require('child_process');
const { chdir, cwd } = require('node:process');
const { Command } = require('commander');
const program = new Command();
const app = express();
const { exportdoPNG } = require("./společné/mapy/js/svg2png.js")
const chyby = require("./routes/chyby.js")

app.engine('html', require('ejs').renderFile);
app.enable("strict routing");

program
  .name('MarkO - program na vytváření volebních map')
  .description('Tato část slouží pouze ke spuštění lokálního serveru. Hlavní program najdete ve složkách pro jednotlivé volby.')
  .version(fs.readFileSync("../.verze.txt").toString());

program
  .option('-p, --port <type>', 'port, na kterém server poběží, ve výchozím stavu je použit port 80', '80')
  .option('-g, --gui', 'spustí grafickou verzi v prohlížeči')
  .option('-d, --debug', 'vypsání chybových hlášení')
  .action((options) => {
    global.port = `${options.port}`;
  });

program.parse(process.argv);
global.options = program.opts();

function prohlizec() {
    if(global.options.gui) {
        console.log("Program se spustí ve vašem výchozím prohlížeči. Pokud se tak nestane, zadejte do prohlížeče RUČNĚ adresu 127.0.0.1")
        exec(`python3 -m webbrowser http://127.0.0.1:${port}/`)
    }
}

program.parse();

const bodyParser = require('body-parser')

//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(bodyParser.json())

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
    res.render(`${__dirname}/index.html`)
})

app.get("/info", (req, res, next) => {
    res.render(`${__dirname}/info.html`)
})

app.use(express.static(__dirname))

// ostatní věci

app.post("/stahnout", async (req, res, next) => {

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

// webová verze programu

const webMarko = require("./routes/webMarkO.js")

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
app.listen(port, () => {
    console.log(`Server běží na http://localhost:${port}`);
    prohlizec()
});