const valueCount = 10,
  width = 600,
  height = 500,
  margin = 40;

function removeYear(date) {
  return d3.timeParse("%B %d, %Y")(
    d3.timeFormat("%B %d")(date).concat(", 2020")
  );
}

function avgReduction(acc, val, index) {
  return index ? (acc * (index - 1) + val) / index : acc;
}

export default (dataset) => {
  try {
    const data = d3
      .groups(
        dataset.filter((dinner) => dinner.precip),
        (d) => d.year
      )
      .sort((l, r) => {
        return l[0] - r[0];
      })
      .map((d) => d[1]);

    data.forEach((d) => {
      d.sort((l, r) => l.date - r.date);
    });

    const avgRain = data.map((y) => {
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

    const yearRange = d3.extent(dataset, (d) => d.year);

    let canvas = d3
      .select("body")
      .append("svg")
      .attr("width", 600)
      .attr("height", 500);

    let x_scale = d3
      .scaleLinear()
      .domain([0, 11])
      .range([margin, width - margin]);

    let color_scale = d3
      .scaleOrdinal()
      .domain(avgRain.map((d, i) => i))
      .range(d3.schemeCategory10);

    let y_scale = d3
      .scaleLinear()
      .domain([0, d3.max(avgRain.map((dinner) => d3.max(dinner)))])
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
      .y((d) => y_scale(d))
      .defined((d) => d !== null)
      .x((d, i) => x_scale(i));

    let path = canvas
      .selectAll()
      .data(avgRain)
      .join("path")
      .attr("fill", "none")
      .attr("stroke", (d, i) => color_scale(i))
      .attr("stroke-width", 2)
      .attr("d", line)
      .on("mouseenter", hover)
      .on("mouseleave", hoveroff);

    let labels = canvas
      .selectAll()
      .data(avgRain)
      .enter()
      .append("text")
      .attr("transform", (d, i) => {
        let lastIndex = d.map((d) => d !== null).lastIndexOf(true);
        return `translate(${x_scale(lastIndex)}, ${y_scale(d[lastIndex])})`;
      })
      .attr("style", "font: 14px sans-serif")
      .attr("fill", (d, i) => `${color_scale(i)}`)
      .text((d, i) => `${yearRange[0] + i}`)
      .on("mouseenter", hover)
      .on("mouseleave", hoveroff);

    function hover(event, p) {
      path
        .attr("stroke-width", (d, i) => (i === p ? 4 : 2))
        .attr("stroke-opacity", (d, i) => (i === p ? 1 : 0.3));
      labels
        // .attr("stroke-width", (d, i) => (i === p) ? 4 : 2)
        .attr("fill-opacity", (d, i) => (i === p ? 1 : 0.3));
    }

    function hoveroff() {
      path.attr("stroke-width", 2).attr("stroke-opacity", 1);
      labels.attr("fill-opacity", 1);
    }

    return Promise.resolve(canvas.node());
  } catch (err) {
    return Promise.reject(`Error chart5: ${err}`);
  }
};
