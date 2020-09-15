import chart1 from "./chart1.js";
import chart2 from "./chart2.js";
import chart3 from './chart3.js';

function cleanseVal(val) {
  return val == "---" ? null : val;
}
function convertToDate(str) {
  if (!str) return null;
  let parts = str.split("/");
  for (let i = 0; i < parts.length; i++) {
    parts[i] = parts[i].length < 2 ? "0".concat(parts[i]) : parts[i];
  }
  parts = [parts[2], parts[0], parts[1]];
  str = parts.join("-");

  return new Date(str);
}

// Parse string into d3 object
d3.csv(
  "https://raw.githubusercontent.com/andesyv/d3-data-visualization/master/YR-weather-data-Bergen-last-12-years_formatted.csv",
  (d) => {
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
        gust: parseFloat(d.gust),
      };
    }
  }
)
  .then((dataset) => {
    try {
      chart1(dataset);
    } catch (err) {
      console.log(`Error chart1: ${err}`);
    }
    try {
      chart2(dataset);
    } catch (err) {
      console.log(`Error chart2: ${err}`);
    }
    try {
      chart3(dataset);
    } catch (err) {
      console.log(`Error chart3: ${err}`);
    }
  })
  .catch((err) => {
    console.log(`Failed to load data: ${err}`);
  });
