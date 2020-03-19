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

// set the dimensions and margins of the graph

var chartDiv = document.getElementById("my_dataviz"); //Mati: this doesn't seem to be doing anythnig

// set the dimensions and margins of the graph
var margin = { top: 10, right: 100, bottom: 30, left: 100 },
  width = 800,
  height = 675;
// append the svg object to the body of the page
var svg = d3
  .select("#my_dataviz")
  .attr("class", "row")
  .style("width", "100%")
  .append("div")
  .attr("class", "col-md-9 col-sm-12")
  .append("svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", `0 0 ${width + 150} ${height + 75}`)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Legend
d3.select("#my_dataviz")
  .append("div")
  .attr("class", "col-md-3 col-sm-12")
  .style("padding", "0px")
  .append("div")
  .attr("class", "legend")
  .append("div")
  .html(
    `<span class="color1">
      Weak seasonality
      <br/>
      Weak reduction in air travel
    </span>
    <br>
    <br>
    <span class="color2">
      Medium seasonality
      <br/>
      Weak reduction in air travel
    </span>
    <br>
    <br>
    <span class="color3">
      Strong seasonality
      <br/>
      Weak reduction in air travel
    </span>
    <br>
    <br>
    <span class="color4">
      Weak seasonality
      <br/>
      Strong reduction in air travel
    </span>
    <br>
    <br>
    <span class="color5">
      Medium seasonality
      <br/>
      Strong reduction in air travel
    </span>
    <br>
    <br>
    <span class="color6">
      Strong seasonality
      <br/>
      Strong reduction in air travel
    </span>`
  );

function getCountries(data) {
  return [...new Set(data.map(d => d.Country))];
}

function getSelectedCountry(data) {
  var url_string = window.location.href;
  var url = new URL(url_string);
  var c = url.searchParams.get("selection");
  return c && data.map(c => c.key).includes(c) ? c : "hong kong city";
}

function getMaxYValueForCountry(mitigations) {
  var highestVals = [];
  for (m in mitigations) {
    for (a in mitigations[m]) {
      highestVals.push(Math.max(...mitigations[m][a]));
    }
  }
  return Math.max(...highestVals);
}

function getListOfScenarios(activeData) {
  return Object.keys(activeData);
}

function getListOfRegions(regions) {
  return Object.keys(regions).map(k => {
    return { key: k, value: regions[k].name }
  })
}

var url_string = window.location.href;
var url = new URL(url_string);
var channel = url.searchParams.get('channel')


d3.json("https://storage.googleapis.com/static-covid/static/data-" + (channel ? channel : 'main') +"-gleam.json")
.then(function(data) {

  // console.log('json data', data)
  var listOfCountries = getListOfRegions(data.regions);
  var selected = {
    country: getSelectedCountry(listOfCountries),
    mitigation: "None"
  };
  var infectedPer1000 = data.regions[selected.country].data.infected_per_1000;
  var activeData = infectedPer1000.mitigations[selected.mitigation];
  console.log('activeData data', activeData)
  // console.log('infectedPer1000 data', getMaxYValueForCountry(infectedPer1000.mitigations, selected.country))

  // add the options to the button
  d3.select("#selectButton")
    .selectAll("myOptions")
    .data(listOfCountries)
    .enter()
    .append("option")
    .text(function (d) {
      return d.value;
    }) // text showed in the menu
    .attr("value", function (d) {
      return d.key;
    })
    .sort(); // corresponding value returned by the button

  var tomorrow = d3.timeDay.ceil(new Date());
  var xDomain = [
    tomorrow,
    d3.timeDay.offset(
      tomorrow, activeData[Object.keys(activeData)[0]].length - 1)
  ];

  // Add X axis --> it is a date format
  var x = d3
    .scaleTime()
    .range([0, width])
    .domain(xDomain);
  svg
    .append("g")
    .style("font-size", "20px")
    .attr("transform", "translate(0," + height + ")")
    .call(
      d3
        .axisBottom(x)
        .ticks(6)
        .tickFormat(d3.timeFormat("%b %Y"))
    );

  // text label for the x axis
  svg
    .append("text")
    .classed("xlabel", true)
    .style("fill", "#a9a9ac")
    .attr(
      "transform",
      "translate(" + width / 2 + " ," + (height + margin.top + 40) + ")"
    )
    .style("text-anchor", "middle")
    .text("Date");

  var yDomain = [
    0,
    getMaxYValueForCountry(infectedPer1000.mitigations, selected.country) / 10
  ];

  // Add Y axis
  var y = d3
    .scaleLinear()
    .domain(yDomain)
    .range([height, 0]);
  var yAxis = svg
    .append("g")
    .style("font-size", "20px")
    .call(
      d3.axisLeft(y).ticks(10) //TODO: consider adding: .tickFormat(d3.format(".0%"))
    );

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
    .text("Active infections as a percentage of the population");

  // Set font size for axis labels
  svg.style("font-size", "22px");

  function drawLine(lineData, color) {
    return svg
      .append("g")
      .append("path")
      .datum(lineData)
      // .attr(
      //   "d",
      //   d3
      //     .line()
      //     .x(function (d, i) {
      //       return x(d3.timeDay.offset(new Date(), i));
      //     })
      //     .y(function (d) {
      //       return y(+d/10);
      //     })
      // )
      .attr("stroke", color)
      .style("stroke-width", 2)
      .style("fill", "none");
  }

  var lines = {};
  /* Previous color scheme, saving in comment for reference
  var colors = [
    "#753def",
    "#ef3d3d",
    "#ef993d",
    "#9edf5c",
    "#5cdfd3",
    "#cf5cdf"
  ];
*/
  var colors = [
    "#edcdab",
    "#edb77e",
    "#ed810e",
    "#9ac9d9",
    "#5abbdb",
    "#007ca6"
  ];

  getListOfScenarios(activeData).forEach((s, i) => {
    lines[s] = drawLine(activeData[s], colors[i]);
  });

  // create crosshairs
  var crosshair = svg.append("g").attr("class", "line");

  // create vertical line
  crosshair
    .append("line")
    .attr("id", "crosshairX")
    .attr("class", "crosshair");

  // create horizontal line
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
    .on("mouseover", function () {
      crosshair.style("display", null);
    })
    .on("mouseout", function () {
      tooltip.style("opacity", 0);
      crosshair.style("display", "none");
    })
    .on("mousemove", function () {
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

      const oneDay = 864e5; // milliseconds
      const diffDays = Math.round(Math.abs((mouseDate - new Date()) / oneDay)); // number of days in the future
      const scenarios = getListOfScenarios(activeData);
      const hoveredValues = scenarios.map(s => {
        return activeData[s][diffDays];
      });
      tooltip
        .style("opacity", 1)
        .html(hoveredValues.map((h, i) => `<span class="color${i+1}">${h}</span>`).join("<br>")) //TODO: `<span class="color${i}">h</span>` // scenarios[i] + ": " +
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY - 28 + "px");
    });

  //initialization
  update({ country: selected.country });
  d3.select("#selectButton").property("value", selected.country);
  // update the containment measures with the new selected country
  var countryName = listOfCountries.find(c => c.key == selected.country).value
  update_containment_measures(countryName);
  update_country_in_text(countryName);

  // A function that update the chart
  function update() {
    yDomain[1] = getMaxYValueForCountry(
      infectedPer1000.mitigations,
      selected.country
    ) / 10;
    y = y.domain(yDomain);
    function updateLine(myLine, lineData) {
      myLine
        .datum(lineData)
        .transition()
        .duration(1000)
        .attr(
          "d",
          d3
            .line()
            .x(function (d, i) {
              return x(d3.timeDay.offset(new Date(), i));
            })
            .y(function (d) {
              return y(+d/10);
            })
        );
    }

    yAxis
      .transition()
      .duration(1000)
      .call(d3.axisLeft(y).ticks(10));

    for (l in lines) {
      updateLine(lines[l], activeData[l]);
    }
  }

  // When the button is changed, run the updateChart function
  d3.select("#selectButton").on("change", function (d) {
    // recover the option that has been chosen
    selected.country = d3.select(this).property("value");
    // change url param
    setGetParam("selection", selected.country);
    infectedPer1000 = data.regions[selected.country].data.infected_per_1000;
    activeData = infectedPer1000.mitigations[selected.mitigation];

    var countryName = listOfCountries.find(c => c.key == selected.country).value
    // run the updateChart function with this selected option
    update();
    // update the containment measures with the new selected country
    update_containment_measures(countryName);
    // update the name of the country in the text below the graph
    update_country_in_text(countryName);
  });

  d3.select(".beta-0").on("click", function () {
    selected.mitigation = "None";
    activeData = infectedPer1000.mitigations[selected.mitigation];
    update();
  });
  d3.select(".beta-03").on("click", function () {
    selected.mitigation = "High";
    activeData = infectedPer1000.mitigations[selected.mitigation];
    update();
  });
  d3.select(".beta-04").on("click", function () {
    selected.mitigation = "Medium";
    activeData = infectedPer1000.mitigations[selected.mitigation];
    update();
  });
  d3.select(".beta-05").on("click", function () {
    selected.mitigation = "Low";
    activeData = infectedPer1000.mitigations[selected.mitigation];
    update();
  });
});

function update_country_in_text(selectedCountry) {
  var countrySpans = jQuery(".selected-country");
  for (i = 0; i < countrySpans.length; i++) {
    countrySpans[i].innerHTML = selectedCountry;
  }
}

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
  console.log('selecteddOption', selectedOption)
  jQuery.get({
    url: "/get_containment_measures",
    data: { country: selectedOption },
    dataType: "json",
    success: function (data) {
      // find the div dedicated to the side bar on the model.html template
      var containmentMeasuresDiv = document.getElementById(
        "containment_measures"
      );
      containmentMeasuresDiv.textContent = "";
      var divTitle = document.createElement("H5");
      divTitle.innerHTML = "Containment measures";

      containmentMeasuresDiv.append(divTitle);
      var containmentMeasuresSource = document.createElement("a");
      var linkText = document.createTextNode("(data source)");
      containmentMeasuresSource.appendChild(linkText);
      containmentMeasuresSource.title = "(data source)";
      containmentMeasuresSource.href =
        "https://www.notion.so/977d5e5be0434bf996704ec361ad621d?v=aa8e0c75520a479ea48f56cb4c289b7e";
      containmentMeasuresDiv.append(containmentMeasuresSource);

      if (data != undefined) {
        data.forEach(function (item, index) {
          containmentMeasuresDiv.appendChild(
            containment_entry(
              (date = item["date"]),
              (text = item["Description of measure implemented"]),
              (source_link = item["Source"])
            )
          );
        });
      } else {
        var emptyDatasetMsg = document.createElement("P");
        emptyDatasetMsg.innerHTML =
          "There is no containment measure in our database at the moment";
        containmentMeasuresDiv.appendChild(emptyDatasetMsg);
      }
    }
  });
}
