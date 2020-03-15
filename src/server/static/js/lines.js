
Date.prototype.addDays=function(d){return new Date(this.valueOf()+864E5*d);};
let today = new Date();
// set the dimensions and margins of the graph


var chartDiv = document.getElementById("my_dataviz");

// set the dimensions and margins of the graph
var margin = {top: 10, right: 100, bottom: 30, left: 50},
    width = chartDiv.clientWidth - margin.left - margin.right,
    height = chartDiv.clientWidth - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3
  .select("#my_dataviz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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

function getSelectedCountry(data) {
  var url_string = window.location.href
  var url = new URL(url_string);
  var c = url.searchParams.get("selection");
  console.log(c, data[c], data)
  return (c && data[c]) ? c : 'Abuja'
}

//Read the data
d3.csv("https://raw.githubusercontent.com/epidemics/covid/a3f1363b07d803dbedc563eb055961644d913aca/src/server/static/data/line-data.csv")
  .then(function(data){
    console.log('raw data', data)
    // List of groups (here I have one group per column)
    var allGroup = getCountries(data)
    data = transformData(data)
    selectedCountry = getSelectedCountry(data)
    countryData = data[selectedCountry]
    console.log('transformed data', data, selectedCountry)

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

    // text label for the x axis
    svg.append("text")
      .attr("transform",
            "translate(" + (width/2) + " ," +
                           (height + margin.top + 20) + ")")
      .style("text-anchor", "middle")
      .text("Date");

    // Add Y axis
    var y = d3.scaleLinear()
      .domain(yDomain)
      //.domain([0, d3.max(countryData, function(d) { return Math.max(+d[1], +d[2], +d[3], +d[4]); })])
      .range([ height, 0 ]);
    svg.append("g")
<<<<<<< HEAD
      .call(d3.axisLeft(y))

    // text label for the y axis
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Value");

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
          .style("stroke-width", 2)
          .style("fill", "none")

    }

    var line1 = drawLine(1, '#753def')
    var line2 = drawLine(2, '#ef3d3d')
    var line3 = drawLine(3, '#ef993d')
    var line4 = drawLine(4, '#e2ca4a')


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

    var tooltip = d3.select("body").append("div") 
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
            tooltip.style('opacity', 0)
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

            tooltip.style('opacity', 1)
              .html('v1: '+hoveredValues[1]+'<br>'+'v2: '+hoveredValues[2]+'<br>'+'v3: '+hoveredValues[3]+'<br>'+'v4: '+hoveredValues[4]+'<br>')
              .style("left", (d3.event.pageX) + "px")   
              .style("top", (d3.event.pageY - 28) + "px");  

            console.log('move', diffDays)
          });


  
    update(selectedCountry)
    d3.select('#selectButton').property('value', selectedCountry);

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
