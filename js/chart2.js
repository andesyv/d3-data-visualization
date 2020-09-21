const valueCount = 10,
  width = 600,
  height = 500,
  margin = 30;

export default (dataset, count = 100) => {
  try {
    dataset = dataset.slice(0, count);
    let series = d3
      .stack()
      .keys(["mintmp", "avgtmp", "maxtmp"])
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone)(dataset);

    let canvas = d3
      .create("svg")
      .attr("width", 600)
      .attr("height", 500);
    let x_scale = d3
      .scaleTime()
      .domain(d3.extent(dataset, (d) => d.date))
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
      .call(d3.axisBottom(x_scale).tickFormat(d3.timeFormat("%d/%m")).ticks(/*d3.timeMonth.every(1)*/10))
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

    return Promise.resolve(canvas.node());
  } catch (err) {
    return Promise.reject(`Error chart2: ${err}`);
  }
};
