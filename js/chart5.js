const valueCount = 10,
  width = 600,
  height = 500,
  margin = 30;

function removeYear(date) {
  return d3.timeParse("%B %d, %Y")(
    d3.timeFormat("%B %d")(date).concat(", 2020")
  );
}

function avgReduction(acc, val, index) {
  return index ? (acc * (index - 1) + val) / index : acc;
}

export default (dataset) => {
  // dataset = dataset.slice(0, 10);
  const data = d3
    .groups(
      dataset.filter((dinner) => dinner.date && dinner.precip),
      (d) => d.year
    )
    .sort((l, r) => {
      return l[0] < r[0];
    })
    .map((d) => d[1])
    .map((y) => {
      let months = [];
      return Array(12)
        .fill(null)
        .map((v, i) => {
          let arr = y.filter((d) => d.month === i + 1);
          return arr.length
            ? arr
                .map((d) => d.precip)
                .reduce((acc, val, index) => (index ? acc + val : acc))
            : null;
        });
    });

  console.log(data);

  let canvas = d3
    .select("body")
    .append("svg")
    .attr("width", 600)
    .attr("height", 500);

  let x_scale = d3.scaleLinear().domain([0, 11]).range([margin, 500]);

  let color_scale = d3
    .scaleOrdinal()
    .domain(data.map((d, i) => i))
    .range(d3.schemeCategory10);

  let y_scale = d3
    .scaleLinear()
    .domain([0, d3.max(data.map((dinner) => d3.max(dinner)))])
    .range([450, margin]); // Reversing range (up on y-axis means larger)

  let x_axis = canvas
    .append("g")
    .call(d3.axisBottom(x_scale).tickFormat((d) => d + 1))
    .attr("transform", `translate(0, ${canvas.attr("height") - margin})`);

  let y_axis = canvas
    .append("g")
    .call(d3.axisLeft(y_scale))
    .attr("transform", `translate(${margin}, 0)`);

  let line = d3
    .line()
    .x((d, i) => x_scale(i))
    .y((d) => y_scale(d));

  let path = canvas
    .selectAll()
    .data(data)
    .join("path")
    .attr("fill", "none")
    .attr("stroke", (d, i) => color_scale(i))
    .attr("stroke-width", 1.5)
    .attr("d", line);
};
