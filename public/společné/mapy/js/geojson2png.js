const sharp = require("sharp"); // https://jafaraziz.com/blog/transform-geojson-to-png-with-d3-js/
const { JSDOM } = require("jsdom");
const fs = require("fs");
const { select, geoPath, geoMercator } = require("d3");
//const { vykresleniLegendy } = require("../legendy/legenda-server.js")

const removeExtension = str => str.split(".").slice(0, -1).join(".");

const createGeoJSONImage = async (geojson, seznamsubjektu, souborlegendy, druhvoleb, popisek) => {
  const WIDTH = 1500;

  const HEIGHT = 1000;

  let geoJSON;
  try {
    geoJSON = JSON.parse(fs.readFileSync(geojson));
  } catch (error) {
    console.log(error);
    return 0;
  }

  let strany;
  try {
    strany = JSON.parse(fs.readFileSync(seznamsubjektu));
  } catch (error) {
    console.log(error);
    return 0;
  }

  let legenda;
  try {
    legenda = JSON.parse(fs.readFileSync(souborlegendy));
  } catch (error) {
    console.log(error);
    return 0;
  }
  
  const window = new JSDOM(undefined, { pretendToBeVisual: true }).window;

  window.d3 = select(window.document);

  const svg = window.d3
    .select("body")
    .append("div")
    .attr("class", "container")
    .append("svg")
    .attr("xmlns", "http://www.w3.org/2000/svg")
    .attr("width", WIDTH)
    .attr("height", HEIGHT)
    .append("g");

  const projection = geoMercator().fitSize([HEIGHT, HEIGHT], {
    type: "FeatureCollection",
    features: geoJSON.features,
  });

  var path = geoPath()
    .projection(projection);

  svg
    .selectAll("path")
    .data(geoJSON.features)
    .enter().append("path")
    .attr("class", function(d) { return "subunit " + d.id; })
    .attr("fill", function(d) {
      let mx = 0
      let px = ''
      for (let i = 1; i <= d.properties.POCET_VS; i++) {// v případě, že počet subjektů převýší uvedené číslo, je potřeba ho zvýšit, jinak budou subjekty nad limitem ignorovány
        let v = parseInt(d.properties[ i.toString() ])
        if (v > mx) {
          mx = v
          px = i
        }
      }

      if (px == '') {
        return "#aaa"
      } else {
        return strany[px]['color']
      }
    })
    .attr("d", path)

    // legenda

    let keys = []
    let barvy = []
    let x = legenda.length > 10 ? 10: legenda.length;
    for(let i = 0; i < x; i++) {
        let nazev = druhvoleb=="prezidentské"?legenda[i]["kandidat"]:legenda[i]["strana"];
        keys.push(nazev + " (" + Math.round(legenda[i]["proc_hlasu"] * 100) / 100 + " %)"); barvy.push(legenda[i]["color"])
    }
    // jeden puntík pro každý subjekt
    let g = svg.selectAll("mydots").data(keys).enter().append("g")
    let puntik = g.insert("circle")
    puntik.attr("cx", 1100)
    puntik.attr("cy", function(d,i){ return 300 + i*25}) // 200 ke souřadnice, kde se objeví první puntík, 25 je vzdálenost mezi puntíky
    puntik.attr("r", 8)
    puntik.style("fill", barvy)
    puntik.style("outline", "solid 1px rgb(117,117,117)")
    puntik.style("border-radius", "8px")

    let text = g.insert("text")
    text.attr("x", 1110)
    text.attr("y", function(d,i){ return 300 + i*25})
    text.text(function(d){ return d})
    text.attr("text-anchor", "left")
    text.style("alignment-baseline", "middle")
        
    let koule = svg.selectAll("circle")
    for (var y = 0; y < koule._groups[0].length; y++) {
        koule._groups[0][y].style.fill = barvy[y]
    }

    //popisek
    
    var elementpopisku = svg.append("g")
        .attr("class", "key");        
    g.append("text")
        .attr("class", "caption")
        .attr("x", "50%")
        .attr("y", "950")
        .attr("fill", "#000")
        .attr("font-size", "18px")
        .attr("font-style", "italic")
        .attr("text-anchor", "middle")
        .attr("font-family", "serif")
        .html(`Mapa volebních výsledků pro ${popisek}`);

    return await sharp(Buffer.from(window.d3.select(".container").html()))
    .png()
    .toBuffer()
};

module.exports = { createGeoJSONImage }