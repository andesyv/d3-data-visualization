const valueCount = 10,
  width = 600,
  height = 500,
  margin = 30;

function removeYear(date) {
  return d3.timeParse("%B %d, %Y")(d3.timeFormat("%B %d")(date).concat(", 2020"));
};

export default (dataset) => {
  // dataset = dataset.slice(0, 10);
  const data = d3
    .groups(dataset.filter(dinner => dinner.date && dinner.precip), (d) => d.year)
    .sort((l, r) => {
      return l[0] < r[0];
    })
    .map((d) => d[1]);
  console.log(data);
  // let series = d3
  //   .stack()
  //   .keys(["mintmp", "avgtmp", "maxtmp"])
  //   .order(d3.stackOrderNone)
  //   .offset(d3.stackOffsetNone)(dataset);

  let canvas = d3
    .select("body")
    .append("svg")
    .attr("width", 600)
    .attr("height", 500);

  let x_scale = d3
    .scaleTime()
    .domain([new Date(2020, 0, 1), new Date(2020, 11, 31)])
    .range([margin, 500]);

  let color_scale = d3
    .scaleOrdinal()
    .domain(data.map(d => d[0].year))
    .range(d3.schemeCategory10);

  let y_scale = d3
    .scaleLinear()
    .domain([0, d3.max(dataset, (d) => d.precip)])
    .range([450, margin]); // Reversing range (up on y-axis means larger)

  let x_axis = canvas
    .append("g")
    .call(d3.axisBottom(x_scale).tickFormat(d3.timeFormat("%d/%m")))
    .attr("transform", `translate(0, ${canvas.attr("height") - margin})`);

  let y_axis = canvas
    .append("g")
    .call(d3.axisLeft(y_scale))
    .attr("transform", `translate(${margin}, 0)`);

  let line = d3
    .line()
    .x((d) => x_scale(removeYear(d.date)))
    .y((d) => y_scale(d.precip));

  let path = canvas
    .selectAll()
    .data(data)
    .join("path")
    .attr("fill", "none")
    .attr("stroke", (d) => color_scale(d[0].year))
    .attr("stroke-width", 1.5)
    .attr("d", line);
};
