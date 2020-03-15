
var chartDiv = document.getElementById("my_dataviz");

// set the dimensions and margins of the graph
var margin = {top: 10, right: 100, bottom: 30, left: 50},
    width = chartDiv.clientWidth - margin.left - margin.right,
    height = chartDiv.clientWidth - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// from https://bl.ocks.org/curran/3a68b0c81991e2e94b19
function redraw(){

        // Extract the width and height that was computed by CSS.
        width = chartDiv.clientWidth - margin.left - margin.right;
        height = chartDiv.clientWidth - margin.top - margin.bottom;

        // Use the extracted size to set the size of an SVG element.
        svg
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom);

        // Draw an X to show that the size is correct.
        var lines = svg.selectAll("line").data([
          {x1: 0, y1: 0, x2: width, y2: height},
          {x1: 0, y1: height, x2: width, y2: 0}
        ]);
        lines
          .enter().append("line")
            .style("stroke-width", 50)
            .style("stroke-opacity", 0.4)
            .style("stroke", "black")
          .merge(lines)
            .attr("x1", function (d) { return d.x1; })
            .attr("y1", function (d) { return d.y1; })
            .attr("x2", function (d) { return d.x2; })
            .attr("y2", function (d) { return d.y2; })
         ;
      }

// Draw for the first time to initialize.
redraw();

// Redraw based on the new size whenever the browser window is resized.
window.addEventListener("resize", redraw);


function getCountries(data) {
  return [...new Set(data.map(d => d.City))]
}

function transformData(data) {
  result = []
  data.forEach(row => {
    if (!result[row.City]) {
      result[row.City] = []
    }
    result[row.City].push([
          row.Timestep, 
          row['Cumulative Median_0'], 
          row['Cumulative Median_1'], 
          row['Cumulative Median_2'],
          row['Cumulative Median_3']
        ])
  })
  return result
}

//Read the data
d3.csv("https://csvlint.io/validation/5e6cf73ea8838f0004000004.csv")
  .then(function(data){
    console.log('data', data)
    // List of groups (here I have one group per column)
    var allGroup = getCountries(data)
    data = transformData(data)
    console.log('dataT', data)

    // add the options to the button
    d3.select("#selectButton")
      .selectAll('myOptions')
      .data(allGroup)
      .enter()
      .append('option')
      .text(function (d) { return d; }) // text showed in the menu
      .attr("value", function (d) { return d; }) // corresponding value returned by the button

    // // A color scale: one color for each group
    // var myColor = d3.scaleOrdinal()
    //   .domain(allGroup)
    //   .range(d3.schemeSet2);

    // Add X axis --> it is a date format
    var x = d3.scaleLinear()
      .domain([0,365])
      .range([ 0, width ]);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // text label for the x axis
    svg.append("text")
      .attr("transform",
            "translate(" + (width/2) + " ," +
                           (height + margin.top + 20) + ")")
      .style("text-anchor", "middle")
      .text("Date");

    // Add Y axis
    var y = d3.scaleLinear()
      .domain( [0,1000])
      .range([ height, 0 ]);
    svg.append("g")
      .call(d3.axisLeft(y));

    // text label for the y axis
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Value");

    // Initialize line with group a
    var line = svg
      .append('g')
      .append("path")
        .datum(data)
        .attr("d", d3.line()
          .x(function(d) { return x(+d[0]) })
          .y(function(d) { return y(+d[1]) })
        )
        .attr("stroke", 'blue')
        .style("stroke-width", 1)
        .style("fill", "none")

    // Initialize line with group a
    var line2 = svg
      .append('g')
      .append("path")
        .datum(data)
        .attr("d", d3.line()
          .x(function(d) { return x(+d[0]) })
          .y(function(d) { return y(+d[2]) })
        )
        .attr("stroke", 'red')
        .style("stroke-width", 1)
        .style("fill", "none")

    // Initialize line with group a
    var line3 = svg
      .append('g')
      .append("path")
        .datum(data)
        .attr("d", d3.line()
          .x(function(d) { return x(+d[0]) })
          .y(function(d) { return y(+d[3]) })
        )
        .attr("stroke", 'orange')
        .style("stroke-width", 1)
        .style("fill", "none")

    // Initialize line with group a
    var line4 = svg
      .append('g')
      .append("path")
        .datum(data)
        .attr("d", d3.line()
          .x(function(d) { return x(+d[0]) })
          .y(function(d) { return y(+d[4]) })
        )
        .attr("stroke", 'green')
        .style("stroke-width", 1)
        .style("fill", "none")

      console.log(data, data.keys())
    update('Abuja')

    // A function that update the chart
    function update(selectedGroup) {
      // Create new data with the selection?
      var dataFilter = data[selectedGroup]
      console.log('update', dataFilter)

      // Give these new data to update line
      line
          .datum(dataFilter)
          .transition()
          .duration(1000)
          .attr("d", d3.line()
            .x(function(d) { return x(+d[0]) })
            .y(function(d) { return y(+d[1]) })
          )
          .attr("stroke", 'blue')

      line2
          .datum(dataFilter)
          .transition()
          .duration(1000)
          .attr("d", d3.line()
            .x(function(d) { return x(+d[0]) })
            .y(function(d) { return y(+d[2]) })
          )
          .attr("stroke", 'red')

      line3
          .datum(dataFilter)
          .transition()
          .duration(1000)
          .attr("d", d3.line()
            .x(function(d) { return x(+d[0]) })
            .y(function(d) { return y(+d[3]) })
          )
          .attr("stroke", 'orange')

      line4
          .datum(dataFilter)
          .transition()
          .duration(1000)
          .attr("d", d3.line()
            .x(function(d) { return x(+d[0]) })
            .y(function(d) { return y(+d[4]) })
          )
          .attr("stroke", 'green')
    }

    // When the button is changed, run the updateChart function
    d3.select("#selectButton").on("change", function(d) {
        // recover the option that has been chosen
        var selectedOption = d3.select(this).property("value")
        // run the updateChart function with this selected option
        update(selectedOption)
    })

})