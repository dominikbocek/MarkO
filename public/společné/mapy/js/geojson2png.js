const sharp = require("sharp"); // https://jafaraziz.com/blog/transform-geojson-to-png-with-d3-js/
const { JSDOM } = require("jsdom");
const fs = require("fs");
const d3 = require("d3");

const createGeoJSONImage = async (geojson, seznamsubjektu, druhvoleb, typzobrazeni, rozsah, popisek) => {
  const WIDTH = 1450;

  const HEIGHT = 750;

  let subunits = JSON.parse(geojson)

  let strany;
  try {
    strany = JSON.parse(fs.readFileSync(seznamsubjektu));
  } catch (error) {
    console.log(error);
    return 0;
  }
  
  const window = new JSDOM(undefined, { pretendToBeVisual: true }).window;

  window.d3 = d3.select(window.document);

  const svg = window.d3
    .select("body")
    .append("div")
    .attr("class", "container")
    .append("svg")
    .attr("xmlns", "http://www.w3.org/2000/svg")
    .attr("width", WIDTH) // šířka
    .attr("height", HEIGHT) // výška
    .append("g");

  // vykreslení

  let vykresleni
  
  switch (typzobrazeni) {
  case "normální":
    vykresleni = await import("../vykreslení/celostát a kraje/vítěz.mjs")
    await vykresleni.vykresleni(svg, druhvoleb, subunits, strany)
    break;
  case "samostatné":
    vykresleni = await import("../vykreslení/celostát a kraje/samostatné.mjs")
    await vykresleni.vykresleni(svg, rozsah, subunits)
    break;
  case "účast":
    vykresleni = await import("../vykreslení/celostát a kraje/účast.mjs")
    await vykresleni.vykresleni() //...
    break;
  }

  //popisek
    
  /*var elementpopisku = svg.append("g")
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
    .html(`Mapa volebních výsledků pro ${popisek}`);*/

    return await sharp(Buffer.from(window.d3.select(".container").html()))
    .png()
    .toBuffer()
};

module.exports = { createGeoJSONImage }