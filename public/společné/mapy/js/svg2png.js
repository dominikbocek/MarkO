const sharp = require("sharp"); // https://jafaraziz.com/blog/transform-geojson-to-png-with-d3-js/
const { JSDOM } = require("jsdom");

const exportdoPNG = async (svg, legendasvg) => {
  
  let obrazek = new JSDOM(svg).window;
  let legenda = new JSDOM(legendasvg).window

  obrazek.document.getElementById("mapa").setAttribute("viewBox", "0 0 1800 750")
  legenda.document.querySelector("g").id = "legenda"
  obrazek.document.getElementById("mapa").innerHTML += legenda.document.querySelector("g").outerHTML
  obrazek.document.getElementById("legenda").setAttribute("transform", "translate(1400,50)")

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

    return await sharp(Buffer.from(obrazek.document.getElementById("mapa").outerHTML))
    .png()
    .toBuffer()
    /*return await Buffer.from(obrazek.document.getElementById("mapa").outerHTML)*/
};

module.exports = { exportdoPNG }