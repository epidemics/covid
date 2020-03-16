// function transformBubbleData(data) {
//   return data.map(bubble => ({ lat: bubble.lat, lang: bubble.lng, country: bubble.Country, city: bubble.City  }));
// }

// mapid is the id of the div where the map will appear
var map = L.map("mapid").setView([35, 2], 2); // center position + zoom

// Add a tile to the map = a background. Comes from OpenStreetmap
L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: "abcd",
  maxZoom: 19
}).addTo(map);

// Add a svg layer to the map
L.svg().addTo(map);


d3.csv(
  "https://storage.googleapis.com/static-covid/static/countries-spread.csv"
).then(function(data) {
  // Select the svg area and add circles:
  d3.select("#mapid")
    .select("svg")
    .attr("pointer-events", "visible")
    .selectAll("myCircles")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function(d) {
      return map.latLngToLayerPoint([d.lat, d.lng]).x;
    })
    .attr("cy", function(d) {
      return map.latLngToLayerPoint([d.lat, d.lng]).y;
    })
    .attr("r", function(d) {
      return Math.sqrt(d.Spreadsize / 100);
    })
    .style("fill", function(d) {
      return d.Colour;
    })
    .attr("stroke", function(d) {
      return d.Colour;
    })
    .attr("stroke-width", 3)
    .attr("fill-opacity", 0.4)
    .attr("class", "bubble");

  d3.selectAll(".bubble").on("click", function(bubble) {
    window.location += "model?selection=" + bubble.Country;
  });

  // Function that update circle position if something change
  function update() {
    d3.selectAll("circle")
      .attr("cx", function(d) {
        return map.latLngToLayerPoint([d.lat, d.lng]).x;
      })
      .attr("cy", function(d) {
        return map.latLngToLayerPoint([d.lat, d.lng]).y;
      });
  }

  // If the user change the map (zoom or drag), I update circle position:
  map.on("moveend", update);
});
