const {ogr2ogr} = require('ogr2ogr')
const { Command } = require('commander');
const program = new Command();
const fs = require('fs');

program.option('-i, --input <soubor>', 'vstupní soubor')
program.option('-o, --output <soubor>', 'výstupní soubor')
program.parse(process.argv);
program.parse()

console.log(program.opts())

const options = program.opts();

ogr2ogr(options.input, {
        options: ["-t_srs", "EPSG:4326"], destination: options.output, format: 'ESRI Shapefile'
    }).exec((err, data) => {
        console.log(err)
    }
)