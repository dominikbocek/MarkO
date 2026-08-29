const express = require('express');
const fs = require('fs');
const { exec, execSync } = require('child_process');
const { Command } = require('commander');
const program = new Command();
const app = express();
const { createGeoJSONImage } = require("./společné/mapy/js/geojson2png.js")
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

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

// zachytávání základních url adres

app.get("/", (req, res, next) => {
    res.render(`${__dirname}/index.html`)
})

app.get("/info", (req, res, next) => {
    res.render(`${__dirname}/info.html`)
})

app.use(express.static(__dirname))

// webová verze programu

const webMarko = require("./routes/webMarkO.js")

app.use(webMarko)

// ostatní věci

app.post("/stahnout", async (req, res, next) => {

    function makeid(length) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    let soubor = __dirname+req.body.soubor
    let tmpgeojson = `${__dirname}/../společné/tmp/${makeid(20)}.geojson`
    let barvy = __dirname+req.body.barvy
    let legenda = __dirname+req.body.legenda
    let druh = req.body.druh
    let popisek = req.body.popisek
    execSync(`bash "${__dirname}/../společné/geojson.sh" "${soubor}" "${tmpgeojson}"`, (error, stdout, stderr) => {
        if (error) {
            chyba(error)
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
        }
    })
    const vysledek = createGeoJSONImage(tmpgeojson, barvy, legenda, druh, popisek)
    vysledek.then(function(obrazek) {
        res.set({
            "Content-Type": "image/png",
            "Content-Disposition": 'attachment; filename="mapa.png"',
            "Content-Length": obrazek.length
        });
        res.send(obrazek)
        fs.unlinkSync(tmpgeojson)
    })
})

/////////////////////////
//  Zachytávání chyb  //
///////////////////////

const chyby = require("./routes/chyby.js")
app.use(chyby)

// Spuštění serveru
app.listen(port, () => {
    console.log(`Server běží na http://localhost:${port}`);
    prohlizec()
});