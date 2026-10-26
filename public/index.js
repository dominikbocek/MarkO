const { Command } = require('commander');
const readline = require('node:readline');
const fs = require('fs');
const program = new Command();
const prompt = require("prompt-sync")({ sigint: true });
const { server } = require("./routes/server.js");
const { options } = require('./routes/obce.js');

program
  .name('MarkO - program na vytváření volebních map')
  .description('Tato část slouží pouze ke spuštění lokálního serveru. Hlavní program najdete ve složkách pro jednotlivé druhy voleb.')
  .version(fs.readFileSync("../.verze.txt").toString());

program
    .command('menu')
    .description('spustí menu textového uživatelského rozhraní')
    .action(() => {

        console.log(`MarkO - program na vytváření volebních map, verze ${fs.readFileSync("../.verze.txt").toString()}`)

        function menu() {
            console.log("1) spustit s grafickým uživatelským rozhraním (doporučeno)")
            console.log("2) spustit bez grafického uživatelského rozhraní (výchozí)")
            console.log("3) spustit v režimu ladění")
            console.log("4) ukončit program (lze též ukončit zkratkou Ctrl C)")
        }

        menu()

        let cislo = prompt("Zadejte možnost: ")

        
        while (isNaN(cislo) || cislo < 1 || cislo > 4) {
            console.log("Neplatná možnost, zadejte jinou.")
            menu()
            cislo = prompt("Zadejte možnost: ")
        }

        switch (cislo) {
            case "1":
                global.options = {gui: true, port: "80"}
                server()
                break;
            case "2":
                global.options = {port: "80"}
                server()
                break;
            case "3":
                global.options = {debug: true, port: "80"}
                server()
                break;
            default:
                console.log("Nascheanou.")
                break;
        }
    })

program
  .option('-p, --port <type>', 'port, na kterém server poběží, ve výchozím stavu je použit port 80')
  .option('-g, --gui', 'spustí grafickou verzi v prohlížeči')
  .option('-d, --debug', 'vypsání chybových hlášení')
  .action((options) => {
    global.options = options;
    if(Object.keys(global.options).length > 0) {
        if(global.options.port == undefined) {
            global.options.port = "80"
        }
        server()
    } else {
        program.help()
    }
  })

program.parse(process.argv);