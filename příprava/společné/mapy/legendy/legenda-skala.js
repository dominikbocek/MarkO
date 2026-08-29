// skálo, skálo, skálo, proč je lásky málo

// měřítko - barevná škála
// rozsah procentuálního zisku hlasů

const barva1 = "yellow"
const barva2 = "darkblue"
const prostrednibarva = "#ff1100"

const velmimale = d3.scaleLinear()
    .domain([0, 10])
    .range([barva1,  barva2])
    .clamp(true)  
      
const male = d3.scaleLinear()
    .domain([0, 25])
    .range([barva1, barva2])
    .clamp(true)

const standard = d3.scaleLinear()
    .domain([0,32])
    .range([barva1, barva2])
    .clamp(true)

const velke = d3.scaleLinear()
    .domain([0, 50])
    .range([barva1, barva2])
    .clamp(true)

const plne = d3.scaleLinear()
    .domain([0,50,100])
    .range([barva1, prostrednibarva, barva2]) //#20dced
    .clamp(true)
    
//legenda
var SVG = d3.select("#legenda")

let color

if(parametry.rozsah !== "velmimale" && parametry.rozsah !== "male" && parametry.rozsah !== "standard" && parametry.rozsah !== "velke" && parametry.rozsah !== "plne") {color = standard;} else {color = eval(parametry.rozsah);}

var legend = d3.legendColor()
    .scale(color)
    .cells(11)

SVG.append("g")
    .attr("transform", "translate(80,0)")
    .call(legend)
    .append("text")
    .attr("y", "10%")
    .attr("transform", "translate(0,-12)")
    .html("Údaje v %");

SVG.selectAll("rect")
    .attr("stroke", "black")
    .attr("stroke-width", "2")
    .attr("stroke-linejoin", "round")

SVG.select(".legendCells").selectAll(".cell").selectAll("rect").attr("y", "10%")
SVG.select(".legendCells").selectAll(".cell").selectAll("text").attr("y", "10%")