const valueCount = 10,
  width = 600,
  height = 500,
  margin = 30,
  radius = width / 2;

const monthNames = [
  "January",
"February",
"March",
"April",
"May",
"June",
"July",
"August",
"September",
"October",
"November",
"December"
];

function constructDataset(dataset) {
  const yearRange = d3.extent(dataset, d => d.year);
  console.log(`Year range: [${yearRange[0]}, ${yearRange[1]}]`);
  let data = {
    name: "root",
    children: Array(yearRange[1] - yearRange[0] + 1)
  };

  for (let y = 0; y < data.children.length; ++y) {
    data.children[y] = {
      name: yearRange[0] + y,
      // 12 months a year
      children: Array(12)
    };
    for (let m = 0; m < 12; ++m) {
      // Maximum 31 days a month
      data.children[y].children[m] = {
        name: monthNames[m],
        children: Array(31)
      };
      // for (let d = 0; d < 31; ++d) {
      //   data[y][m][d] = {
      //     name: d,
      //     value: null
      //   };
      // }
    }
  }

  console.log(`Dataset includes ${data.children.length} years`);
  dataset.forEach((d, i) => {
    if (!(Number.isNaN(d.year) || Number.isNaN(d.month) || Number.isNaN(d.day))) {
      data.children[d.year - yearRange[0]].children[d.month - 1].children[d.day - 1] = {
        name: d.day,
        value: d.snow
      };
    }
  });

  console.log(data);

  return data;
}

export default (dataset) => {
  // dataset = dataset.slice(0, 10);
  
  // Format data into hiererchical format
  const data = constructDataset(dataset);
  /*

  let partition = d3
    .partition()
    .size([2 * Math.PI, radius])
    (
      d3
        .hierarchy(data)
        .sum(d => d.value)
    );


  let canvas = d3
    .select("body")
    .append("svg")
    .attr("width", 600)
    .attr("height", 500);
  let x_scale = d3
    .scaleBand()
    .domain(dataset.map((d) => d.date))
    .range([margin, 500]);
  // Create a new band scale with the same output range of x_scale but the domain of the indexes in the series
  let color_scale = d3
    .scaleOrdinal()
    .domain(series.map((v, i) => i))
    .range(d3.schemeCategory10);
  let y_scale = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(dataset, (d) => {
        return d.mintmp + d.avgtmp + d.maxtmp;
      }),
    ])
    .range([450, margin]); // Reversing range (up on y-axis means larger)

  let x_axis = canvas
    .append("g")
    .call(d3.axisBottom(x_scale).tickFormat(d3.timeFormat("%d/%m")))
    .attr("transform", `translate(0, ${canvas.attr("height") - margin})`);
  let y_axis = canvas
    .append("g")
    .call(d3.axisLeft(y_scale))
    .attr("transform", `translate(${margin}, 0)`);

  let area = d3
    .area()
    .x((d) => x_scale(d.data.date))
    .y0((d) => y_scale(d[0]))
    .y1((d) => y_scale(d[1]));

  let path = canvas
    .selectAll()
    .data(series)
    .join("path")
    .attr("fill", ({ key }) => color_scale(key))
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", area);
    */
};
