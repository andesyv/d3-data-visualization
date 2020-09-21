const valueCount = 10,
  width = 600,
  height = 500,
  margin = 30;

export default (dataset) => {
  try {
    dataset = dataset.slice(0, 10).reverse();
    var canvas = d3.create("svg").attr("width", 600).attr("height", 500);

    let x_scale = d3
      .scaleBand()
      .domain(dataset.map((d) => d.date))
      .range([margin, 500]);
    let y_scale = d3
      .scaleLinear()
      .domain([
        d3.max(dataset, (d) => d.avgtmp),
        d3.min(dataset, (d) => d.avgtmp),
      ])
      .range([margin, 450]);

    let bars = canvas
      .selectAll(".bar")
      .data(dataset)
      .enter()
      .append("g")
      .attr("transform", (d) => {
        return `translate(${x_scale(d.date)}, ${y_scale(d.avgtmp)})`;
      });
    bars
      .append("rect")
      .attr("x", "0")
      .attr("y", /*`${canvas.attr("height")}`*/ "0")
      .attr("width", `${x_scale.bandwidth()}`)
      .attr("height", (d) => {
        return canvas.attr("height") - y_scale(d.avgtmp) - margin;
      });
    bars
      .append("text")
      .attr("x", `${x_scale.bandwidth() * 0.133}`)
      .attr("y", "-.35em")
      .text((d) => {
        return d.avgtmp;
      });

    let x_axis = canvas
      .append("g")
      .call(d3.axisBottom(x_scale).tickFormat(d3.timeFormat("%d/%m")))
      .attr("transform", `translate(0, ${canvas.attr("height") - margin})`);
    let y_axis = canvas
      .append("g")
      .call(d3.axisLeft(y_scale))
      .attr("transform", `translate(${margin}, 0)`);

    return Promise.resolve(canvas.node());
  } catch (err) {
    return Promise.reject(`Error chart1: ${err}`);
  }
};
