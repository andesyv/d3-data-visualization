const d3 = require('d3');

// Read contents of file into string
const fs = require('fs');
var filecontents = fs.readFileSync("YR-weather-data-Bergen-last-12-years_formatted.csv", 'utf8');
// Format data string (to ensure valid variable names)

function cleanseVal(val) {
    return (val == "---") ? null : val;
}
function convertToDate(str) {
    if (!str)
        return null;
    let parts = str.split("/");
    for (let i = 0; i < parts.length; i++) {
        parts[i] = parts[i].length < 2 ? "0".concat(parts[i]) : parts[i];
    }
    parts = [parts[2], parts[0], parts[1]];
    str = parts.join('-');

    return new Date(str);
}

const   valueCount = 10,
        width = 600,
        height = 500,
        margin = 30;

// Parse string into d3 object
const dsv = require("d3-dsv").dsvFormat(",");
var dataset = dsv.parse(filecontents, (d, i) => {
    if (d.date && i < valueCount) {
        for (let property in d) {
            d[property] = cleanseVal(d[property]);
        }

        return {
            date: convertToDate(d.date),
            year: parseInt(d.year),
            month: parseInt(d.month),
            day: parseInt(d.day),
            mintmp: parseFloat(d.mintmp),
            maxtmp: parseFloat(d.maxtmp),
            avgtmp: parseFloat(d.avgtmp),
            normtmp: parseFloat(d.normtmp),
            precip: parseFloat(d.precip),
            snow: parseFloat(d.snow),
            wind: parseFloat(d.wind),
            gust: parseFloat(d.gust)
        };
    }
});

const canvas = d3.select("body").append("svg").attr("width", 600).attr("height", 500);

let x_scale = d3.scaleBand().domain(dataset.map(d => d.date)).range([margin, 500]);
let y_scale = d3.scaleLinear().domain([d3.min(dataset, d => d.avgtmp), d3.max(dataset, d => d.avgtmp)]).range([margin, 450]);

let bars = canvas.selectAll(".bar").data(dataset).enter().append("g").attr("transform", (d) => { return `translate(${x_scale(d.date)}, ${y_scale(d.avgtmp)})`; });
bars.append("rect").attr("x", "0").attr("y", /*`${canvas.attr("height")}`*/"0").attr("width", `${x_scale.bandwidth()}`).attr("height", (d) => { return canvas.attr("height") - y_scale(d.avgtmp) - margin; });
bars.append("text").attr("x", `${x_scale.bandwidth() * 0.133}`).attr("y", "-.35em").text((d) => { return d.avgtmp; });

let x_axis = canvas.append("g").call(d3.axisBottom(x_scale).tickFormat(d3.timeFormat("%d/%m"))).attr("transform", `translate(0, ${canvas.attr("height") - margin})`);
let y_axis = canvas.append("g").call(d3.axisLeft(y_scale)).attr("transform", `translate(${margin}, 0)`);