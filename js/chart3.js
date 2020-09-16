const valueCount = 100,
  iterationSize = 10,
  width = 600,
  height = 300,
  margin = 20;

export default (dataset) => {
  let data = dataset.slice(0, 200);
  var start = 0;

  function getNextRange() {
    start = start - iterationSize;
    // If rotating past last value, do an extra big jump to make sure we get the whole range.
    if (start < 0) start = dataset.length - valueCount - 1;
    return dataset.slice(start, (start + valueCount) % dataset.length);
  }

  function updateRange() {
    data = getNextRange();
    return data;
  }

  function updateSeries() {
    data = updateRange();

    let arr = new Array();
    const p = ["mintmp", "avgtmp", "maxtmp"];
    for (let i = 0; i < p.length - 1; ++i)
      arr.push(
        data.map((d) => {
          let obj = [d[p[i]], d[p[i + 1]]];
          obj.date = d.date;
          return obj;
        })
      );
    return arr;
  }

  let series = updateSeries(true);

  const canvas = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  let x_scale = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => d.date))
    .range([margin, width - margin]);
  let y_scale = d3
    .scaleLinear()
    .domain([d3.min(data, (d) => d.mintmp), d3.max(data, (d) => d.maxtmp)])
    .range([height - margin, margin]);

  let x_axis = canvas
    .append("g")
    .call(d3.axisBottom(x_scale).tickFormat(d3.timeFormat("%d/%m")))
    .attr("transform", `translate(0, ${canvas.attr("height") - margin})`);

  let y_axis = canvas
    .append("g")
    .call(d3.axisLeft(y_scale))
    .attr("transform", `translate(${margin}, 0)`);

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
      return y_scale(d[0] === null || Number.isNaN(d[0]) ? 0 : d[0]);
    })
    .y1((d) => {
      return y_scale(d[1] === null || Number.isNaN(d[1]) ? 0 : d[1]);
    });

  let path = canvas
    .selectAll()
    .data(series)
    .join("path")
    .attr("fill", (d) => color_scale(d))
    .attr("stroke", "black")
    .attr("stroke-width", 1.5)
    .attr("d", area);

  // Animation:
  function scroll() {
    series = updateSeries();

    y_scale.domain([
      d3.min(data, (d) => d.mintmp),
      d3.max(data, (d) => d.maxtmp),
    ]);

    x_axis
      .transition()
      .duration(1000)
      .delay(2000)
      .call(d3.axisBottom(x_scale).tickFormat(d3.timeFormat("%d/%m")));    

    x_scale.domain(d3.extent(data, (d) => d.date));

    y_axis.transition().duration(1000).delay(2000).call(d3.axisLeft(y_scale));

    path
      .data(series)
      .transition()
      .duration(1000)
      .delay(2000)
      .attr("d", area)
      .on("end", scroll);
  }

  scroll();
};
