Date.prototype.addDays=function(d){return new Date(this.valueOf()+864E5*d);};
let today = new Date();
// set the dimensions and margins of the graph
var margin = { top: 10, right: 100, bottom: 30, left: 30 },
  width = 460 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3
  .select("#my_dataviz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function getCountries(data) {
  return [...new Set(data.map(d => d.City))];
}

function transformData(data) {
  result = [];
  data.forEach(row => {
    if (!result[row.City]) {
      result[row.City] = [];
    }
    result[row.City].push([
          today.addDays(row.Timestep), 
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
    console.log('raw data', data)
    // List of groups (here I have one group per column)
    var allGroup = getCountries(data)
    data = transformData(data)
    countryData = data['Abuja']
    console.log('transformed data', data)

    // add the options to the button
    d3.select("#selectButton")
      .selectAll("myOptions")
      .data(allGroup)
      .enter()
      .append("option")
      .text(function(d) {
        return d;
      }) // text showed in the menu
      .attr("value", function(d) {
        return d;
      }); // corresponding value returned by the button


      var xDomain = d3.extent(countryData, function(d) { 
          return d[0]; 
        })
    // Add X axis --> it is a date format
    var x = d3.scaleTime()
      .range([ 0, width ])
            // .domain( [0,1000])
      .domain(xDomain)
      // .ticks(d3.time.months, 1).tickFormat(d3.time.format("%b"));;
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).ticks(6).tickFormat(d3.timeFormat("%Y-%m-%d")));

    var yDomain = [0, 1000]
    // Add Y axis
    var y = d3.scaleLinear()
      .domain(yDomain)
      //.domain([0, d3.max(countryData, function(d) { return Math.max(+d[1], +d[2], +d[3], +d[4]); })])
      .range([ height, 0 ]);
    svg.append("g")
      .call(d3.axisLeft(y))


    function drawLine(i, color) {
      return svg
        .append('g')
        .append("path")
          .datum(countryData)
          .attr("d", d3.line()
            .x(function(d) { console.log('asdsa'); window.myX = x; return x(d[0]) })
            .y(function(d) { return y(+d[i]) })
          )
          .attr("stroke", color)
          .style("stroke-width", 1)
          .style("fill", "none")

    }

    var line1 = drawLine(1, 'blue')
    var line2 = drawLine(2, 'red')
    var line3 = drawLine(3, 'orange')
    var line4 = drawLine(4, 'green')


    // create crosshairs
    var crosshair = svg.append("g")
      .attr("class", "line");

    // create horizontal line
    crosshair.append("line")
      .attr("id", "crosshairX")
      .attr("class", "crosshair");

    // create vertical line
    crosshair.append("line")
      .attr("id", "crosshairY")
      .attr("class", "crosshair");

var div = d3.select("body").append("div") 
    .attr("class", "tooltip")       
    .style("opacity", 0);



      svg.append('rect')
        .attr('class', 'overlay')
        .attr('width', width)
        .attr('height', height)
          .on('mouseover', function() {
            console.log('over')
            crosshair.style("display", null);
          })
          .on('mouseout', function() {
            console.log('out')
            crosshair.style("display", "none");
          })
          .on('mousemove', function() {
               var mouse = d3.mouse(this);
               var mouseDate = x.invert(mouse[0]);
               var mouseVal = y.invert(mouse[1])

              crosshair.select("#crosshairX")
                .attr("x1", mouse[0])
                .attr("y1", y(yDomain[0]))
                .attr("x2", mouse[0])
                .attr("y2", y(yDomain[1]));

              crosshair.select("#crosshairY")
                .attr("x1", x(xDomain[0]))
                .attr("y1", mouse[1])
                .attr("x2", x(xDomain[1]))
                .attr("y2", mouse[1]);

            const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
            const diffDays = Math.round(Math.abs((mouseDate - today) / oneDay)); // number of days in the future
            const hoveredValues = countryData[diffDays]

            div.style('opacity', 1)
              .html('asdasdasdsad')
              .style("left", (d3.event.pageX) + "px")   
              .style("top", (d3.event.pageY - 28) + "px");  

            console.log('move', diffDays)
          });


  
    update('Abuja')

    // A function that update the chart
    function update(selectedGroup) {
      countryData = data[selectedGroup]
      console.log('countryData',countryData)
      function updateLine(myLine, i){
          myLine
            .datum(countryData)
            .transition()
            .duration(1000)
            .attr("d", d3.line()
              .x(function(d) { return x(d[0]) })
              .y(function(d) { return y(+d[i]) })
            )
      }

      updateLine(line1, 1)
      updateLine(line2, 2)
      updateLine(line3, 3)
      updateLine(line4, 4)

    }

    // When the button is changed, run the updateChart function
    d3.select("#selectButton").on("change", function(d) {
      // recover the option that has been chosen
      var selectedOption = d3.select(this).property("value");
      // run the updateChart function with this selected option
      update(selectedOption);
    });
  }
);
