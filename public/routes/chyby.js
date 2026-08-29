/////////////////////////
//  Zachytávání chyb  //
///////////////////////

const express = require('express');
const router = express.Router();
const { chdir, cwd } = require('node:process');

// 404
router.use((req, res, next) => {
    const err = new Error("Stránka nebyla nalezena");
    err.status = 404;
    next(err);
});

// společný handler
router.use((err, req, res, next) => {

    const status = err.status || 500;

    res.status(status);

    
    if (status === 500) {
        chyba(err)
        return res.render(`${cwd()}/společné/chyby/chyba.ejs`, {status});
    }

    if (status === 404) {
        return res.render(`${cwd()}/společné/chyby/chyba.ejs`, {status});
    }
});

function chyba(error) {
    if(global.options.debug) {
        console.error(`MarkO: program na vytváření volebních map\nVýpis posledního chybového hlášení (${Date()}):\n${error.message}`);
        //console.log(error)
    }
}

module.exports = router;