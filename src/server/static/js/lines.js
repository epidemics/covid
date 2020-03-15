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
      row.Timestep,
      row["Cumulative Median_0"],
      row["Cumulative Median_1"],
      row["Cumulative Median_2"],
      row["Cumulative Median_3"]
    ]);
  });
  return result;
}

//Read the data
d3.csv("https://csvlint.io/validation/5e6cf73ea8838f0004000004.csv").then(
  function(data) {
    console.log("data", data);
    // List of groups (here I have one group per column)
    var allGroup = getCountries(data);
    data = transformData(data);
    console.log("dataT", data);

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

    // // A color scale: one color for each group
    // var myColor = d3.scaleOrdinal()
    //   .domain(allGroup)
    //   .range(d3.schemeSet2);

    // Add X axis --> it is a date format
    var x = d3
      .scaleLinear()
      .domain([0, 365])
      .range([0, width]);
    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3
      .scaleLinear()
      .domain([0, 1000])
      .range([height, 0]);
    svg.append("g").call(d3.axisLeft(y));

    // Initialize line with group a
    var line = svg
      .append("g")
      .append("path")
      .datum(data)
      .attr(
        "d",
        d3
          .line()
          .x(function(d) {
            return x(+d[0]);
          })
          .y(function(d) {
            return y(+d[1]);
          })
      )
      .attr("stroke", "blue")
      .style("stroke-width", 1)
      .style("fill", "none");

    // Initialize line with group a
    var line2 = svg
      .append("g")
      .append("path")
      .datum(data)
      .attr(
        "d",
        d3
          .line()
          .x(function(d) {
            return x(+d[0]);
          })
          .y(function(d) {
            return y(+d[2]);
          })
      )
      .attr("stroke", "red")
      .style("stroke-width", 1)
      .style("fill", "none");

    // Initialize line with group a
    var line3 = svg
      .append("g")
      .append("path")
      .datum(data)
      .attr(
        "d",
        d3
          .line()
          .x(function(d) {
            return x(+d[0]);
          })
          .y(function(d) {
            return y(+d[3]);
          })
      )
      .attr("stroke", "orange")
      .style("stroke-width", 1)
      .style("fill", "none");

    // Initialize line with group a
    var line4 = svg
      .append("g")
      .append("path")
      .datum(data)
      .attr(
        "d",
        d3
          .line()
          .x(function(d) {
            return x(+d[0]);
          })
          .y(function(d) {
            return y(+d[4]);
          })
      )
      .attr("stroke", "green")
      .style("stroke-width", 1)
      .style("fill", "none");

    console.log(data, data.keys());
    update("Abuja");

    // A function that update the chart
    function update(selectedGroup) {
      // Create new data with the selection?
      var dataFilter = data[selectedGroup];
      console.log("update", dataFilter);

      // Give these new data to update line
      line
        .datum(dataFilter)
        .transition()
        .duration(1000)
        .attr(
          "d",
          d3
            .line()
            .x(function(d) {
              return x(+d[0]);
            })
            .y(function(d) {
              return y(+d[1]);
            })
        )
        .attr("stroke", "blue");

      line2
        .datum(dataFilter)
        .transition()
        .duration(1000)
        .attr(
          "d",
          d3
            .line()
            .x(function(d) {
              return x(+d[0]);
            })
            .y(function(d) {
              return y(+d[2]);
            })
        )
        .attr("stroke", "red");

      line3
        .datum(dataFilter)
        .transition()
        .duration(1000)
        .attr(
          "d",
          d3
            .line()
            .x(function(d) {
              return x(+d[0]);
            })
            .y(function(d) {
              return y(+d[3]);
            })
        )
        .attr("stroke", "orange");

      line4
        .datum(dataFilter)
        .transition()
        .duration(1000)
        .attr(
          "d",
          d3
            .line()
            .x(function(d) {
              return x(+d[0]);
            })
            .y(function(d) {
              return y(+d[4]);
            })
        )
        .attr("stroke", "green");
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
