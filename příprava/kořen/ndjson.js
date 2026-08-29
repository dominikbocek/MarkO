const fs = require('fs');
const readline = require('readline');

global.statutarni = ""
global.kod = ""

async function processLineByLine(pozadavek) {
  const fileStream = fs.createReadStream(`${__dirname}/volby/${req.params.volby}/kvcoco.ndjson`);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in kvcoco.ndjson as a single line break.

  for await (const line of rl) {
    // Each line in kvcoco.ndjson will be successively available here as `line`.
    var kodzastup = JSON.parse(line)["KODZASTUP"]
    var nadrzastup = JSON.parse(line)["NADRZASTUP"]
    //console.log(`Line from file: ${JSON.parse(line)["KODZASTUP"]}`);
    if(req.params.dalsi == kodzastup && nadrzastup == "") {
        global.kod = kodzastup
        global.statutarni = "statutární";
      break
    } else if(req.params.dalsi == kodzastup && nadrzastup !== req.params.dalsi) {
        global.kod = nadrzastup
        global.statutarni = "obvod";
      break
    } else if(req.params.dalsi == kodzastup && nadrzastup == kodzastup) {
        global.kod = kodzastup
        global.statutarni = "nestatutární";
      break
    }
    //console.log(`Line from file: ${line}`);
  }
  //console.log(global.statutarni)
  //console.log(global.kod)
  if(pozadavek == "index") {
    if(global.statutarni == "statutární" || global.statutarni == "nestatutární" || global.statutarni == "obvod") {
      res.render(path.join(__dirname, '../public/společné', 'index.html'));
    }
  }
  if(pozadavek == "soubory") {//???
    if(global.statutarni == "statutární" || global.statutarni == "nestatutární" || global.statutarni == "obvod") {
      res.sendFile(`${__dirname}/volby/${req.params.volby}/${kod}/${req.params.soubory}`)
    }
  }
}