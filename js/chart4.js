// Source: https://observablehq.com/@d3/sunburst

const valueCount = 10,
  width = 600,
  height = 600,
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
  "December",
];

function constructDataset(dataset) {
  const yearRange = d3.extent(dataset, (d) => d.year);
  console.log(`Year range: [${yearRange[0]}, ${yearRange[1]}]`);
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
        name: monthNames[m]
      };
    }
  }

  console.log(`Dataset includes ${data.children.length} years`);
  dataset.forEach((d, i) => {
    if (
      !(Number.isNaN(d.year) || Number.isNaN(d.month) || Number.isNaN(d.day))
    ) {
      let node = data.children[d.year - yearRange[0]].children[d.month - 1];
      if (typeof node.children === 'undefined')
        node.children = Array();

      node.children.push({
        name: d.day,
        value: d.snow,
      });
    }
  });

  console.log(data);

  return data;
}

export default (dataset) => {
  // dataset = dataset.slice(0, 10);

  // Format data into hiererchical format
  const data = constructDataset(dataset);

  // let root = Array.from(d3.group(dataset, d => d.year, d => d.month), ([key, children]) => ({key, children}));

  // console.log(root);

  const partition = d3.partition().size([2 * Math.PI, radius])(
    d3.hierarchy(data)
    .sum((d) => {
      return d.value;
    })
    // .sort((a, b) => b.value - a.value)
  );

  console.log(partition);

  let arc = d3
    .arc()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(radius / 2)
    .innerRadius((d) => d.y0)
    .outerRadius((d) => d.y1 - 1);

  let canvas = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  let color_scale = d3.scaleOrdinal(
    d3.quantize(d3.interpolateRainbow, data.children.length + 1)
  );

  canvas
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`)
    .selectAll("path")
    .data(partition.descendants().filter((d) => d.depth))
    .join("path")
    .attr("fill", (d) => {
      while (d.depth > 1) d = d.parent;
      return color_scale(d.data.name);
    })
    .attr("d", arc)
    .append("title")
    .text(
      (d) =>
        `${d
          .ancestors()
          .map((d) => d.data.name)
          .reverse()
          .join("/")}\n${d3.format(",d")(d.value)}`
    );

  canvas
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`)
    .attr("pointer-events", "none")
    .attr("text-anchor", "middle")
    .attr("font-size", 10)
    .attr("font-family", "sans-serif")
    .selectAll("text")
    .data(
      partition
        .descendants()
        .filter((d) => d.depth && ((d.y0 + d.y1) / 2) * (d.x1 - d.x0) > 10)
    )
    .join("text")
    .attr("transform", function (d) {
      const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
      const y = (d.y0 + d.y1) / 2;
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    })
    .attr("dy", "0.35em")
    .text((d) => d.data.name);
};
