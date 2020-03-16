
Date.prototype.addDays=function(d){return new Date(this.valueOf()+864E5*d);};
function setGetParam(key,value) {
  if (history.pushState) {
    var params = new URLSearchParams(window.location.search);
    params.set(key, value);
    var newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + params.toString();
    window.history.pushState({path:newUrl},'',newUrl);
  }
}
let today = new Date();
// set the dimensions and margins of the graph


var chartDiv = document.getElementById("my_dataviz");

// set the dimensions and margins of the graph
var margin = {top: 10, right: 100, bottom: 30, left: 50},
    width = 600,
    height = 700;
// append the svg object to the body of the page
var svg = d3
  .select("#my_dataviz")
  .append("svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 750 750")
  .classed("svg-content", true)

  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function getCountries(data) {
  return [...new Set(data.map(d => d.Country))];
}

function getCountryBetaData(data) {
  result = [];
  let combinations = _.uniqBy(data, r => [r.Country, r.beta].join()).map(r => ({country: r.Country, beta: r.beta, items:[]}));
  data.forEach(row => {
    _.find(combinations, {'country':row.Country, 'beta': row.beta}).items.push([
      today.addDays(row.Timestep), 
      row['Cumulative Median_0'], 
      row['Cumulative Median_1'], 
      row['Cumulative Median_2'],
    ])
  })
  return combinations;
}
// doesn't to anything
// // triggers a get method with the selected country
// function onchange_model_country() {
//     var country = document.getElementById("selectButton").value;
//     // run the updateChart function with this selected option
//     update({country: country});
//     jQuery.get({
//     url: "/model",
//     data: {"country": country},
// })
// }

function getSelectedCountry(data) {
  var url_string = window.location.href
  var url = new URL(url_string);
  var c = url.searchParams.get("selection");
  console.log(c);
  console.log('search query', c, data.includes(c), data)
  return (c && data.includes(c)) ? c : 'Abuja'
}

//Read the data
d3.csv('https://storage.googleapis.com/static-covid/static/line-data-v2.csv')
  .then(function(data){
    var selectedBeta = "0.0";
    // List of groups (here I have one group per column)
    var allGroup = getCountries(data)
    countryBetas = getCountryBetaData(data);
    selectedCountry = getSelectedCountry(allGroup)
    selectedCountryBeta = countryBetas.find(r => r.country === selectedCountry && r.beta === selectedBeta);
    countryBetaData=selectedCountryBeta.items;

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

      var xDomain = d3.extent(selectedCountryBeta.items, function(d) { 
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
      .classed('xlabel', true)
      .style('fill', '#a9a9ac')
      .attr("transform",
            "translate(" + (width/2) + " ," +
                           (height + margin.top + 20) + ")")
      .style("text-anchor", "middle")
      .text("Date");

    // Add Y axis
    var y = d3.scaleLinear()
      .domain(yDomain)
      //.domain([0, d3.max(selectedCountryBeta.items, function(d) { return Math.max(+d[1], +d[2], +d[3], +d[4]); })])
      .range([ height, 0 ]);
    svg.append("g")
      .call(d3.axisLeft(y))

    // text label for the y axis
    svg.append("text")
      .classed('ylabel', true)
      .style('fill', '#a9a9ac')
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
          .datum(selectedCountryBeta.items)
          .attr("d", d3.line()
            .x(function(d) { window.myX = x; return x(d[0]) })
            .y(function(d) { return y(+d[i]) })
          )
          .attr("stroke", color)
          .style("stroke-width", 2)
          .style("fill", "none")

    }

    var line1 = drawLine(1, '#753def')
    var line2 = drawLine(2, '#ef3d3d')
    var line3 = drawLine(3, '#ef993d')


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
            const hoveredValues = selectedCountryBeta.items[diffDays]
            console.log('hv', hoveredValues)
            var hVars = [
              Math.round(hoveredValues[1]),
              Math.round(hoveredValues[2]),
              Math.round(hoveredValues[3]),
            ]
            tooltip.style('opacity', 1)
              .html('v1: '+hVars[0]+'<br>'+'v2: '+hVars[1]+'<br>'+'v3: '+hVars[2]+'<br>')
              .style("left", (d3.event.pageX) + "px")   
              .style("top", (d3.event.pageY - 28) + "px");  

            console.log('move', diffDays)
          });


  
    update({country: selectedCountry})
    d3.select('#selectButton').property('value', selectedCountry);

    // A function that update the chart
    function update({country=selectedCountryBeta.country, beta=selectedCountryBeta.beta}) {
      selectedCountryBeta = countryBetas.find(r => (r.country === country && r.beta === beta));
      function updateLine(myLine, i){
          myLine
            .datum(selectedCountryBeta.items)
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
    }

    // When the button is changed, run the updateChart function
    d3.select("#selectButton").on("change", function(d) {
      // recover the option that has been chosen
      var selectedOption = d3.select(this).property("value");
      // change url param
      setGetParam('selection', selectedOption)
      // run the updateChart function with this selected option
      // jQuery.get({
      //   url: "/model",
      //   data: {"country": selectedOption},
      // });
      update({country: selectedOption});

    });

    d3.select(".beta-0").on("click", function(){
      update({beta: "0.0"});
    })
    d3.select(".beta-03").on("click", function(){
      update({beta: "0.3"});
    })
    d3.select(".beta-04").on("click", function(){
      update({beta: "0.4"});
    })
    d3.select(".beta-05").on("click", function(){
      update({beta: "0.5"});
    })

    console.log("RUNNING D3");
  }
);
