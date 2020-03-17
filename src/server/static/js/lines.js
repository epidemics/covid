Date.prototype.addDays = function(d) {
  return new Date(this.valueOf() + 864e5 * d);
};
function setGetParam(key, value) {
  if (history.pushState) {
    var params = new URLSearchParams(window.location.search);
    params.set(key, value);
    var newUrl =
      window.location.protocol +
      "//" +
      window.location.host +
      window.location.pathname +
      "?" +
      params.toString();
    window.history.pushState({ path: newUrl }, "", newUrl);
  }
}
let today = new Date();
// set the dimensions and margins of the graph

var chartDiv = document.getElementById("my_dataviz");

// set the dimensions and margins of the graph
var margin = { top: 10, right: 100, bottom: 30, left: 50 },
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
  let combinations = _.uniqBy(data, r =>
    [r.Country, r.Mitigation].join()
  ).map(r => ({ country: r.Country, beta: r.Mitigation, items: [] }));
  data.forEach(row => {
    _.find(combinations, {
      country: row.Country,
      beta: row.Mitigation
    }).items.push([
      today.addDays(row.Timestep),
      row["Cumulative Median_s=0.85_at=0.2"],
      row["Cumulative Median_s=0.7_at=0.2"],
      row["Cumulative Median_s=0.1_at=0.2"],
      row["Cumulative Median_s=0.85_at=0.7"],
      row["Cumulative Median_s=0.7_at=0.7"],
      row["Cumulative Median_s=0.1_at=0.7"]
    ]);
  });
  return combinations;
}

function getSelectedCountry(data) {
  var url_string = window.location.href;
  var url = new URL(url_string);
  var c = url.searchParams.get("selection");
  return c && data.includes(c) ? c : "China";
}

//Read the data
d3.csv(
  "https://storage.googleapis.com/static-covid/static/line-data-v2.csv?cache_bump=2"
).then(function(data) {
  var selectedBeta = "0.0";
  // List of groups (here I have one group per column)
  var allGroup = getCountries(data);
  countryBetas = getCountryBetaData(data);
  selectedCountry = getSelectedCountry(allGroup);
  //console.log(allGroup)
  selectedCountryBeta = countryBetas.find(
    r => r.country === selectedCountry && r.beta === selectedBeta
  );
  countryBetaData = selectedCountryBeta.items;

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
  });
  // Add X axis --> it is a date format
  var x = d3
    .scaleTime()
    .range([0, width])
    // .domain( [0,1000])
    .domain(xDomain);
  // .ticks(d3.time.months, 1).tickFormat(d3.time.format("%b"));;
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(
      d3
        .axisBottom(x)
        .ticks(6)
        .tickFormat(d3.timeFormat("%Y-%m-%d"))
    );

  var yDomain = [0, 200 / 1000];

  // text label for the x axis
  svg
    .append("text")
    .classed("xlabel", true)
    .style("fill", "#a9a9ac")
    .attr(
      "transform",
      "translate(" + width / 2 + " ," + (height + margin.top + 20) + ")"
    )
    .style("text-anchor", "middle")
    .text("Date");

  // Add Y axis
  var y = d3
    .scaleLinear()
    .domain(yDomain)
    //.domain([0, d3.max(selectedCountryBeta.items, function(d) { return Math.max(+d[1], +d[2], +d[3], +d[4]); })])
    .range([height, 0]);
  svg.append("g").call(d3.axisLeft(y));

  // text label for the y axis
  svg
    .append("text")
    .classed("ylabel", true)
    .style("fill", "#a9a9ac")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Value");

  function drawLine(i, color) {
    return svg
      .append("g")
      .append("path")
      .datum(selectedCountryBeta.items)
      .attr(
        "d",
        d3
          .line()
          .x(function(d) {
            window.myX = x;
            return x(d[0]);
          })
          .y(function(d) {
            return y(+d[i]);
          })
      )
      .attr("stroke", color)
      .style("stroke-width", 2)
      .style("fill", "none");
  }

  var line1 = drawLine(1, "#753def");
  var line2 = drawLine(2, "#ef3d3d");
  var line3 = drawLine(3, "#ef993d");
  var line4 = drawLine(4, "#9edf5c");
  var line5 = drawLine(5, "#5cdfd3");
  var line6 = drawLine(6, "#cf5cdf");

  // create crosshairs
  var crosshair = svg.append("g").attr("class", "line");

  // create horizontal line
  crosshair
    .append("line")
    .attr("id", "crosshairX")
    .attr("class", "crosshair");

  // create vertical line
  crosshair
    .append("line")
    .attr("id", "crosshairY")
    .attr("class", "crosshair");

  var tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  svg
    .append("rect")
    .attr("class", "overlay")
    .attr("width", width)
    .attr("height", height)
    .on("mouseover", function() {
      //console.log('over')
      crosshair.style("display", null);
    })
    .on("mouseout", function() {
      //console.log('out')
      tooltip.style("opacity", 0);
      crosshair.style("display", "none");
    })
    .on("mousemove", function() {
      var mouse = d3.mouse(this);
      var mouseDate = x.invert(mouse[0]);
      var mouseVal = y.invert(mouse[1]);

      crosshair
        .select("#crosshairX")
        .attr("x1", mouse[0])
        .attr("y1", y(yDomain[0]))
        .attr("x2", mouse[0])
        .attr("y2", y(yDomain[1]));

      crosshair
        .select("#crosshairY")
        .attr("x1", x(xDomain[0]))
        .attr("y1", mouse[1])
        .attr("x2", x(xDomain[1]))
        .attr("y2", mouse[1]);

      const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
      const diffDays = Math.round(Math.abs((mouseDate - today) / oneDay)); // number of days in the future
      const hoveredValues = selectedCountryBeta.items[diffDays];
      //console.log('hv', hoveredValues)
      var hVars = [
        Math.round(hoveredValues[1]),
        Math.round(hoveredValues[2]),
        Math.round(hoveredValues[3]),
        Math.round(hoveredValues[4]),
        Math.round(hoveredValues[5]),
        Math.round(hoveredValues[6])
      ];
      tooltip
        .style("opacity", 1)
        .html(
          '<span class="color1">v1: ' +
            hVars[0] +
            "</span><br>" +
            '<span class="color2">v1: ' +
            hVars[1] +
            "</span><br>" +
            '<span class="color3">v1: ' +
            hVars[2] +
            "</span><br>" +
            '<span class="color4">v1: ' +
            hVars[3] +
            "</span><br>" +
            '<span class="color5">v1: ' +
            hVars[4] +
            "</span><br>" +
            '<span class="color6">v1: ' +
            hVars[5] +
            "</span><br>"
        )
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY - 28 + "px");

      //console.log('move', diffDays)
    });

  //initialization
  update({ country: selectedCountry });
  d3.select("#selectButton").property("value", selectedCountry);
  // update the containment measures with the new selected country
  update_containment_measures(selectedCountry);

  // A function that update the chart
  function update({
    country = selectedCountryBeta.country,
    beta = selectedCountryBeta.beta
  }) {
    selectedCountryBeta = countryBetas.find(
      r => r.country === country && r.beta === beta
    );
    function updateLine(myLine, i) {
      myLine
        .datum(selectedCountryBeta.items)
        .transition()
        .duration(1000)
        .attr(
          "d",
          d3
            .line()
            .x(function(d) {
              return x(d[0]);
            })
            .y(function(d) {
              return y(+d[i]);
            })
        );
    }

    updateLine(line1, 1);
    updateLine(line2, 2);
    updateLine(line3, 3);
    updateLine(line4, 4);
    updateLine(line5, 5);
    updateLine(line6, 6);
  }

  // When the button is changed, run the updateChart function
  d3.select("#selectButton").on("change", function(d) {
    // recover the option that has been chosen
    var selectedOption = d3.select(this).property("value");
    // change url param
    setGetParam("selection", selectedOption);
    // run the updateChart function with this selected option
    update({ country: selectedOption });
    // update the containment measures with the new selected country
    update_containment_measures(selectedOption);
  });

  d3.select(".beta-0").on("click", function() {
    update({ beta: "0.0" });
  });
  d3.select(".beta-03").on("click", function() {
    update({ beta: "0.3" });
  });
  d3.select(".beta-04").on("click", function() {
    update({ beta: "0.4" });
  });
  d3.select(".beta-05").on("click", function() {
    update({ beta: "0.5" });
  });

  //console.log("RUNNING D3");
});

function containment_entry(date = "", text = "", source_link = "") {
  /* write that jinja code with js for model.html template sidebar with containment measures entry
   * <div class="containment_measure">
   *   <h3 class="num">{{ date }}</h3>
   *   <div class="area">{{ text }} <a href="{{ source_link }}" target="_blank">Source</a></div>
   *</div>
   */
  var entryDiv = document.createElement("DIV");
  entryDiv.setAttribute("class", "containment_measure");
  var title = document.createElement("H6");
  title.setAttribute("class", "num");
  title.innerHTML = date;
  var textDiv = document.createElement("DIV");
  textDiv.setAttribute("class", "area");
  textDiv.innerHTML =
    text + " <a href='" + source_link + "'target='_blank'>Source</a>";
  entryDiv.appendChild(title);
  entryDiv.appendChild(textDiv);
  return entryDiv;
}

function update_containment_measures(selectedOption) {
  jQuery.get({
    url: "/get_containment_measures",
    data: { country: selectedOption },
    dataType: "json",
    success: function(data) {
      // find the div dedicated to the side bar on the model.html template
      var containmentMeasuresDiv = document.getElementById(
        "containment_measures"
      );
      containmentMeasuresDiv.textContent = "";
      var divTitle = document.createElement("H5");
      divTitle.innerHTML = "Containment measures";
      containmentMeasuresDiv.append(divTitle);
      if (data != undefined) {
        // format each entry and append it to the containmentMeasuresDiv
        for (let i in data["Description of measure implemented"]) {
          containmentMeasuresDiv.appendChild(
            containment_entry(
              (date = data["date"][i]),
              (text = data["Description of measure implemented"][i]),
              (source_link = data["Source"][i])
            )
          );
        }
      } else {
        var emptyDatasetMsg = document.createElement("P");
        emptyDatasetMsg.innerHTML =
          "There is no containment measure in our database at the moment";
        containmentMeasuresDiv.appendChild(emptyDatasetMsg);
      }
    }
  });
}
