import chart1 from "./chart1.js";
import chart2 from "./chart2.js";
import chart3 from "./chart3.js";
import chart4 from "./chart4.js";
import chart5 from "./chart5.js";

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

function wrap(str, e) {
  const container = document.createElement("div");
  container.textContent = str;
  container.appendChild(document.createElement("br"));
  container.appendChild(e);
  document.body.appendChild(container);
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
    chart1(dataset).then(e => wrap("Example graph of something... ", e)).catch(err => console.log(err));
    let dayCount = 100;
    chart2(dataset, dayCount).then(e => wrap(`Min, avg and max temp comparison over a set of ${dayCount} days: `, e)).catch(err => console.log(err));
    chart3(dataset).then(e => wrap("Min, avg and max temp for full dataset in incrementing sets of 10s", e)).catch(err => console.log(err));
    chart4(dataset).then(e => wrap("Snow amount comparison over years (Click on elements to focus)", e)).catch(err => console.log(err));
    chart5(dataset).then(e => wrap("Total rain amount per month, separated by year. (Hover over to scope to year)", e)).catch(err => console.log(err));
  })
  .catch((err) => {
    console.log(`Failed to load data: ${err}`);
  });
