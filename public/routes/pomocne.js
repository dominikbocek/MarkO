const { chdir, cwd } = require('node:process');
const fs = require('fs');

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

    return 0
}

module.exports = {nacistJSON, urllomitka}