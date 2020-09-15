const valueCount = 10,
  width = 600,
  height = 500,
  margin = 30;

export default (dataset) => {
  const canvas = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  let x_scale = d3
    .scaleBand()
    .domain(dataset.map((d) => d.date))
    .range([margin, 500]);
  let y_scale = d3.scaleLinear().domain([0, 50]).range([450, margin]);

  let x_axis = canvas
    .append("g")
    .call(d3.axisBottom(x_scale).tickFormat(d3.timeFormat("%d/%m")))
    .attr("transform", `translate(0, ${canvas.attr("height") - margin})`);

  let y_axis = canvas
    .append("g")
    .call(d3.axisLeft(y_scale))
    .attr("transform", `translate(${margin}, 0)`);

  let series = Array();
  let properties = ["mintmp", "avgtmp", "maxtmp"];
  for (let i = 0; i < properties.length - 1; ++i) {
    series.push(
      dataset.map((d) => {
        let obj = [d[properties[i]], d[properties[i + 1]]];
        obj.date = d.date;
        obj.i = i;
        return obj;
      })
    );
  }
  console.log(series);

  let color_scale = d3
    .scaleOrdinal()
    .domain(series)
    .range(["#40829B", "#634DAA"]);

  let area = d3
    .area()
    .x((d) => {
      return x_scale(d.date);
    })
    .y0((d) => {
      return y_scale(d[0]);
    })
    .y1((d) => {
      return y_scale(d[1]);
    });

  let path = canvas
    .selectAll()
    .data(series)
    .join("path")
    .attr("fill", d => color_scale(d))
    .attr("stroke", "black")
    .attr("stroke-width", 1.5)
    .attr("d", area);
};
