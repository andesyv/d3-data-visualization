// let data = [100, 200, 300];

// const body = d3.select("body");

// let paragraphs = body.selectAll("p").data(data).text((d, i) => {
//     console.log(d);
//     console.log(i);
//     console.log(this);
//     return d;
// });

// body.selectAll("p").on("mouseover", function(){
//     d3.select(this).style("background-color", "orange");
// });

// d3.select("#container").transition().duration(1000).style("background-color", "red").transition().duration(1000).style("background-color", "black");
const d3 = require('d3');

// Read contents of file into string
const fs = require('fs');
var filecontents = fs.readFileSync("2020-09-08--YR-weather-data-Bergen-last-12-years.csv", 'utf8');
// Format data string (to ensure valid variable names)
// let lines = [filecontents.substring(0, filecontents.indexOf('\n')), filecontents.substring(filecontents.indexOf('\n') + 1)];
// lines[0] = "date,year,month,day,mintmp,maxtmp,avgtmp,normtmp,precip,snow,wind,gust";
// filecontents = lines.join('\n');

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

// Parse string into d3 object
const dsv = require("d3-dsv").dsvFormat(",");
var dataset = dsv.parse(filecontents, (d, i) => {
    if (d.date) {
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

console.log(dataset);

// console.log(`Columns: ${dataset.columns}`);
// for (let i = 0; i < dataset.length && i < 10; i++) {
//     console.log(`${i}: ${dataset[i].Date}`);
// }

// let matrix = [
//     [1, 2, 3, 4],
//     [5, 6, 7, 8],
//     [9, 10, 11, 12],
//     [13, 14, 15, 16]
// ];

// const body = d3.select("body");
// var trs = body.select("table").select("tbody").selectAll("tr").data(matrix);
// trs.selectAll("td").data((d) => { return d; }).text((d) => { return d; });

// var td = trs.enter().append("tr").selectAll("td").data((d, i) => {
//     console.log(`d: ${d}`);
//     console.log(`i: ${i}`);
//     return d;
// }).enter().append("td").text((d) => {
//     console.log(`d: ${d}`);
//     return d;
// });