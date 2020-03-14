// The svg
var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// var initX;
// var mouseClicked = false;



// Map and projection
var projection = d3.geoMercator()
    .center([2, 47])                // GPS of location to zoom on
    .scale(150)                       // This is like the zoom
    .translate([ width/2, height/2 ])

// var zoom = d3.zoom()
//   .scaleExtent([1, 10])
//   .on("zoom", zoomed)
//   .on("end", zoomended);


// svg.on("wheel", function() {
//   //zoomend needs mouse coords
//   initX = d3.mouse(this)[0];
// })
// .on("mousedown", function() {
//   //only if scale === 1
//   if(s !== 1) return;
//   initX = d3.mouse(this)[0];
//   mouseClicked = true;
// })
// .call(zoom);
// zoom and pan

function transformBubbleData(data) {
  return data.map(bubble => ({lat: bubble.Latitude, long: bubble.Longitude}))
}


var path = d3.geoPath()
    .projection(projection);
var g = svg.append("g");
// Load external data and boot
Promise.all([
  d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
  d3.csv("https://csvlint.io/validation/5e6d1368a8838f000400000d.csv")
])
  .then(function(files){
    data = files[0]
    bubbles = transformBubbleData(files[1])
    console.log('mdata', data, bubbles)
    // Filter data
    // data.features = data.features.filter(function(d){console.log(d.properties.name) ; return d.properties.name=="France"})

    // Draw the map
    g
      .selectAll("path")
      .data(data.features)
      .enter()
      .append("path")
        .attr("fill", "grey")
        .attr("d", d3.geoPath()
            .projection(projection)
        )
      .style("stroke", "none")
      var zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on('zoom', function() {
                g.selectAll('path')
                 .attr('transform', d3.event.transform);
                console.log('zoom')
                svg.selectAll('myCircles')
                  .transition()
                  .duration(750)
                  .attr("cx", function(d){ return projection([d.long, d.lat])[0] })
                  .attr("cy", function(d){ return projection([d.long, d.lat])[1] })    
      });


     g
      .selectAll("myCircles")
      .data(bubbles)
      .enter()
      .append("circle")
        .attr("cx", function(d){ return projection([d.long, d.lat])[0] })
        .attr("cy", function(d){ return projection([d.long, d.lat])[1] })
        .attr("r", 14)
        .style("fill", "69b3a2")
        .attr("stroke", "#69b3a2")
        .attr("stroke-width", 3)
        .attr("fill-opacity", .4)
      svg.call(zoom)
})