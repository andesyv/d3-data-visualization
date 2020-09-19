/** Zoomable sunburst graph
 * Sources:
 * https://observablehq.com/@d3/sunburst
 * https://observablehq.com/@d3/zoomable-sunburst
 */

const radius = 600,
  innerRadius = radius / 6;

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
  "December",
];

function constructDataset(dataset) {
  const yearRange = d3.extent(dataset, (d) => d.year);
  let data = {
    name: "root",
    children: Array(yearRange[1] - yearRange[0] + 1),
  };

  for (let y = 0; y < data.children.length; ++y) {
    data.children[y] = {
      name: yearRange[0] + y,
      // 12 months a year
      children: Array(12),
    };
    for (let m = 0; m < 12; ++m) {
      // Maximum 31 days a month
      data.children[y].children[m] = {
        name: monthNames[m],
      };
    }
  }

  dataset.forEach((d, i) => {
    if (
      !(Number.isNaN(d.year) || Number.isNaN(d.month) || Number.isNaN(d.day))
    ) {
      let node = data.children[d.year - yearRange[0]].children[d.month - 1];
      if (typeof node.children === "undefined") node.children = Array();

      node.children.push({
        name: d.day,
        value: d.snow,
      });
    }
  });

  return data;
}

function arcVisible(d) {
  return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
}

function labelVisible(d) {
  return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
}

function labelTransform(d) {
  const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
  const y = ((d.y0 + d.y1) / 2) * innerRadius;
  return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
}

export default (dataset) => {
  // Format data into hiererchical format
  const data = constructDataset(dataset);

  const partition = (data) => {
    const root = d3.hierarchy(data).sum((d) => d.value);
    // .sort((a, b) => b.value - a.value)

    return d3.partition().size([2 * Math.PI, root.height + 1])(root);
  };
  let root = partition(data);

  root.each((d) => (d.current = d));

  const canvas = d3
    .select("body")
    .append("svg")
    .attr("width", radius)
    .attr("height", radius);

  const g = canvas
    .append("g")
    .attr("transform", `translate(${radius / 2}, ${radius / 2})`);

  let color_scale = d3.scaleOrdinal(
    d3.quantize(d3.interpolateRainbow, data.children.length + 1)
  );

  let arc = d3
    .arc()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(innerRadius * 1.5)
    .innerRadius((d) => d.y0 * innerRadius)
    .outerRadius((d) => Math.max(d.y0 * innerRadius, d.y1 * innerRadius - 1));

  const color = d3.scaleOrdinal(
    d3.quantize(d3.interpolateRainbow, data.children.length + 1)
  );

  const path = g
    .append("g")
    .selectAll("path")
    .data(root.descendants().slice(1))
    .join("path")
    .attr("fill", (d) => {
      while (d.depth > 1) d = d.parent;
      return color(d.data.name);
    })
    .attr("fill-opacity", (d) =>
      arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0
    )
    .attr("d", (d) => arc(d.current));

  path
    .filter((d) => d.children)
    .style("cursor", "pointer")
    .on("click", clicked);

  const format = d3.format(",d");

  path.append("title").text(
    (d) =>
      `${d
        .ancestors()
        .map((d) => d.data.name)
        .reverse()
        .join("/")}\n${format(d.value)}`
  );

  const label = g
    .append("g")
    .attr("pointer-events", "none")
    .attr("text-anchor", "middle")
    .style("user-select", "none")
    .selectAll("text")
    .data(root.descendants().slice(1))
    .join("text")
    .attr("dy", "0.35em")
    .attr("fill-opacity", (d) => +labelVisible(d.current))
    .attr("transform", (d) => labelTransform(d.current))
    .text((d) => d.data.name);

  const parent = g
    .append("circle")
    .datum(root)
    .attr("r", innerRadius)
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .on("click", clicked);

  function clicked(event) {
    parent.datum(event.parent || root);

    root.each((d) => {
      d.target = {
        x0:
          Math.max(0, Math.min(1, (d.x0 - event.x0) / (event.x1 - event.x0))) *
          2 *
          Math.PI,
        x1:
          Math.max(0, Math.min(1, (d.x1 - event.x0) / (event.x1 - event.x0))) *
          2 *
          Math.PI,
        y0: Math.max(0, d.y0 - event.depth),
        y1: Math.max(0, d.y1 - event.depth),
      };
    });

    const t = g.transition().duration(750);

    // Transition the data on all arcs, even the ones that aren’t visible,
    // so that if this transition is interrupted, entering arcs will start
    // the next transition from the desired position.
    path
      .transition(t)
      .tween("data", (d) => {
        const i = d3.interpolate(d.current, d.target);
        return (t) => (d.current = i(t));
      })
      .filter(function (d) {
        return +this.getAttribute("fill-opacity") || arcVisible(d.target);
      })
      .attr("fill-opacity", (d) =>
        arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0
      )
      .attrTween("d", (d) => () => arc(d.current));

    label
      .filter(function (d) {
        return +this.getAttribute("fill-opacity") || labelVisible(d.target);
      })
      .transition(t)
      .attr("fill-opacity", (d) => +labelVisible(d.target))
      .attrTween("transform", (d) => () => labelTransform(d.current));
  }
};
