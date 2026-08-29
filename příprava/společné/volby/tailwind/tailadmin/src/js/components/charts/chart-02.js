window.ucast = await d3.csv("/statistics.csv", function(d) {
  return d.VOL_SEZNAM
})

function chart02(selector, value, options = {}) {

    const {
        width = 330,
        height = 190,
        color = "#465FFF",
        background = "#E4E7EC",
        thickness = 20
    } = options;

    const outerRadius = width * 0.42;
    const innerRadius = outerRadius - thickness;

    const svg = d3.select(selector)
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("width", "60%")
        .style("height", "auto")
        .style("margin", "auto");

    const g = svg.append("g")
        .attr(
            "transform",
            `translate(${width / 2}, ${height - 20})`
        );

    const arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)
        .cornerRadius(thickness / 2);

    // pozadí
    g.append("path")
        .attr("d", arc({
            startAngle: -Math.PI / 2,
            endAngle: Math.PI / 2
        }))
        .attr("fill", background);

    // hodnota
    g.append("path")
        .attr("d", arc({
            startAngle: -Math.PI / 2,
            endAngle:
                -Math.PI / 2 +
                Math.PI * value / 100
        }))
        .attr("fill", color);

    // číslo
    g.append("text")
        .attr("text-anchor", "middle")
        .attr("y", -25)
        .attr("font-family", "Outfit, sans-serif")
        .attr("font-size", 36)
        .attr("font-weight", 600)
        .attr("fill", "#1D2939")
        .text(`${value}%`);
}