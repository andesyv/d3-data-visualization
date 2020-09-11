// Download latest D3 library
const http = require('https');
const fs = require('fs');

const file = fs.createWriteStream("ext/D3lib.min.js");
const request = http.get("https://d3js.org/d3.v4.min.js", function(response) {
  file.on('pipe', () => {
    console.log("Wrote to stream!");
  });
  response.pipe(file);
});