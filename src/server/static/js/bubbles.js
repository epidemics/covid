function transformBubbleData(data) {
  return data.map(bubble => ({ lat: bubble.Latitude, long: bubble.Longitude, country: bubble.Country, city: bubble.City  }));
}

// mapid is the id of the div where the map will appear
var map = L.map("mapid").setView([47, 2], 5); // center position + zoom

// Add a tile to the map = a background. Comes from OpenStreetmap
L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: "abcd",
  maxZoom: 19
}).addTo(map);

// Add a svg layer to the map
L.svg().addTo(map);

d3.csv("https://raw.githubusercontent.com/epidemics/covid/a3f1363b07d803dbedc563eb055961644d913aca/src/server/static/data/bubble-data.csv").then(
  function(data) {
    markers = transformBubbleData(data);
    // Select the svg area and add circles:
    d3.select("#mapid")
      .select("svg")
      .attr('pointer-events', 'visible')
      .selectAll("myCircles")
      .data(markers)
      .enter()
      .append("circle")
      .attr("cx", function(d) {
        return map.latLngToLayerPoint([d.lat, d.long]).x;
      })
      .attr("cy", function(d) {
        return map.latLngToLayerPoint([d.lat, d.long]).y;
      })
      .attr("r", 14)
      .style("fill", "red")
      .attr("stroke", "red")
      .attr("stroke-width", 3)
      .attr("fill-opacity", 0.4)
      .attr("class", "bubble")
      .on('click', function() {
        console.log('clicked')
      });

      d3.selectAll(".bubble").on('click', function(bubble) {
        console.log(bubble);
        window.location += 'model?selection=' + bubble.city
    });

    // Function that update circle position if something change
    function update() {
      d3.selectAll("circle")
        .attr("cx", function(d) {
          return map.latLngToLayerPoint([d.lat, d.long]).x;
        })
        .attr("cy", function(d) {
          return map.latLngToLayerPoint([d.lat, d.long]).y;
        });
    }

    // If the user change the map (zoom or drag), I update circle position:
    map.on("moveend", update);
  }
);
