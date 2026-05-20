//protektorát
      //vykreslení mapy
      function sudety() {
      barva = location.pathname.includes("samostatn") ? "GreenYellow": "#f00"
      meritko = location.pathname.includes("samostatn") ? 7500: 8000
      var svg = d3.select("#sudety"),
      width = +svg.attr("width"),
      height = +svg.attr("height");

      var projection = d3.geoMercator()
          .center([15.34, 49.75]) //střed ČR
          .scale(meritko) // měřítko, nastavíme dle potřeb
          //.translate([560, height / 2])

      var path = d3.geoPath()
          .projection(projection);

      d3.json("/společné/protektorát.json", function(error, data) {

          var subunits = topojson.feature(data, data.objects.tracts) // obce

          // vykreslíme obce
          svg.selectAll(".subunit")
              .data(subunits.features)
              .enter().append("path")
              .attr("class", function(d) { return "subunit " + d.id; })
              //.attr("fill", function(d) { return color(d.properties.hustota); })
              .attr("fill", function(d) {
                let mx = 0
                let px = ''
                for (let i = 1; i <= 85; i++) {
                  let v = parseInt(d.properties[ i.toString() ])
                  if (v > mx) {
                    mx = v
                    px = i
                  }
                }
                    return "#ffffff00"
              })
              .attr("stroke", barva)
              .attr("stroke-width", "2")
              .attr("stroke-linejoin", "round")
              .attr("d", path)
        }); 
      }
sudety()