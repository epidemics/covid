/* global $:false d3:false Plotly:false */

const Y_SCALE = 10; // Going from per_1000_pops to per 100 (%)

function getUrlParams(data) {
  var urlString = window.location.href;
  var url = new URL(urlString);
  return {
    region: url.searchParams.get("selection") || "united kingdom",
    channel: url.searchParams.get("channel") || "main"
  };
}

const { channel } = getUrlParams();
var linesData, estimatesData, listOfRegions;
let selected = {
  region: getUrlParams().region,
  mitigation: "none"
};

// Reported & Estimated Infections
d3.json(
  `https://storage.googleapis.com/static-covid/static/data-${channel}-estimates-v1.json`
).then(function (data) {
  estimatesData = data;
  updateInfectionTotals();
});

function updateInfectionTotals() {
  if (typeof estimatesData === "undefined") return;

  const { population, data } = estimatesData.regions[selected.region];
  const dates = Object.keys(data.estimates.days);
  let maxDate = dates[0];
  dates.slice(1).forEach(date => {
    if (new Date(maxDate) < new Date(date)) {
      maxDate = date;
    }
  });
  const infections = data.estimates.days[maxDate];
  console.log(maxDate)
  console.log(typeof maxDate)

  formatDate = (date) => {

    var [year, month_id, day] = date.split("-")

    let month_names = ["Jan", "Feb", "Mar",
      "Apr", "May", "Jun",
      "Jul", "Aug", "Sep",
      "Oct", "Nov", "Dec"]

    let month_string = month_names[month_id - 1]

    return month_string + " " + day + ", " + year
  }

  d3.select("#infections-date").html(`(${formatDate(maxDate)})`);
  d3.select("#infections-confirmed").html(formatInfectionTotal(
    infections["JH_Confirmed"] - infections["JH_Recovered"] - infections["JH_Deaths"]
  ));
  d3.select("#infections-estimated").html(
    formatInfectionTotal(infections["FT_Infected"])
  );
  d3.select("#infections-estimated-ci").html(
    `${formatInfectionTotal(
      infections["FT_Infected_q05"]
    )} - ${formatInfectionTotal(infections["FT_Infected_q95"])}`
  );
  d3.select("#infections-population").html(formatInfectionTotal(population));
}

const formatInfectionTotal = function (number) {
  if (typeof number !== "number" || Number.isNaN(number)) {
    return "&mdash;";
  }
  if (number < 10000 && number > -10000) {
    return String(number);
  } else {
    return number.toLocaleString();
  }
};

// dropdown of countries
var selectButton = document.getElementById("selectButton");

// graph
var plotyGraph = document.getElementById("my_dataviz");

// graph layout
var layout = {
  height: 600,
  //margin: { t: 0 },
  paper_bgcolor: "#222028",
  plot_bgcolor: "#222028",
  xaxis: {
    type: "date",
    title: "Date",
    titlefont: {
      family: "DM Sans, sans-serif",
      size: 18,
      color: "white"
    },
    ticks: "outside",
    tickfont: {
      family: "DM Sans, sans-serif",
      size: 14,
      color: "white"
    },
    tick0: 0,
    dtick: 0.0,
    ticklen: 8,
    tickwidth: 1,
    tickcolor: "#fff"
  },
  yaxis: {
    title: "Active infections (% of population)",
    titlefont: {
      family: "DM Sans, sans-serif",
      size: 18,
      color: "white"
    },
    tickfont: {
      family: "DM Sans, sans-serif",
      size: 14,
      color: "white"
    },
    ticks: "outside",
    tick0: 0,
    dtick: 0.0,
    ticklen: 8,
    tickwidth: 1,
    tickcolor: "#fff",
    showline: true,
    linecolor: "#fff",
    linewidth: 1,
    showgrid: false,
    zeroline: true,
    zerolinecolor: "#fff",
    zerolinewidth: 1,

    range: [0, 1]
  },
  showlegend: true,
  legend: {
    x: 1,
    xanchor: "right",
    y: 1,
    yanchor: "top",
    bgcolor: "#22202888"
  }
};

var plotlyConfig = {
  displaylogo: false,
  responsive: true,
  scrollZoom: false
};

Plotly.newPlot(plotyGraph, [], layout, plotlyConfig);

// Checks if the max and traces have been loaded and preprocessed for the given
// region; if not, loads them and does preprocessing; then caches it in the region object.
// Finally calls then_traces_max(mitigation_traces, max_Y_val).
function loadGleamvizTraces(regionRec, then_traces_max) {

  if (typeof regionRec.cached_gleam_traces === "undefined") {
    // Not cached, load and preprocess
    var traces_url = regionRec.data.infected_per_1000.traces_url;
    d3.json(
      `https://storage.googleapis.com/static-covid/static/${traces_url}`
    ).then(function (mitigations_data) {
      var highestVals = [];

      // Iterate over mitigations (groups)
      Object.values(mitigations_data).forEach(mitigation_traces => {
        // Iterate over Plotly traces in groups
        Object.values(mitigation_traces).forEach(trace => {

          // Scale all trace Ys to percent
          Object.keys(trace.y).forEach(i => {
            trace.y[i] = trace.y[i] / Y_SCALE;
          });
          highestVals.push(Math.max(...trace.y));

          // When x has length 1, extend it to a day sequence of len(y) days
          if (trace.x.length == 1) {
            var xStart = new Date(trace.x[0]);
            for (let i = 1; i < trace.y.length; ++i) {
              trace.x[i] = d3.timeDay.offset(xStart, i);
            }
          }
        });
      });
      var max_y = Math.max(...highestVals);
      // Cache the values in the region
      regionRec.cached_gleam_traces = mitigations_data;
      regionRec.cached_gleam_max_y = max_y;
      // Callback
      then_traces_max(mitigations_data, max_y);
    });
  } else {
    // Callback
    then_traces_max(regionRec.cached_gleam_traces, regionRec.cached_gleam_max_y);
  }
}

function getListOfRegions(regions) {
  return Object.keys(regions).map(key => {
    return { key, name: regions[key].name };
  });
}

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

function updateRegionInText(region) {
  var countryName = listOfRegions.find(c => c.key === region).name;
  var regionSpans = jQuery(".selected-region");
  for (let i = 0; i < regionSpans.length; i++) {
    regionSpans[i].innerHTML = countryName;
  }
}

// triggered by change of region in the drop down menu
function changeRegion() {
  // recover the option that has been chosen
  selected.region = selectButton.value;
  // change url param
  setGetParam("selection", selected.region);
  // update the graph
  updatePlot();
  updateInfectionTotals();
}

// load the data used for the graph
jQuery.getJSON(
  "https://storage.googleapis.com/static-covid/static/data-" +
  (channel ? channel : "main") +
  "-gleam-v2.json",
  function (data) {
    linesData = data;
    // populate the dropdown menu with countries from received data
    listOfRegions = getListOfRegions(data.regions);
    listOfRegions.forEach(({ key, name }) => {
      const opt = document.createElement("option");
      opt.value = key;
      opt.innerHTML = name;
      selectButton.appendChild(opt);
    });
    // initialize the graph
    updatePlot(selected);
  }
);



// update the graph
function updatePlot(opt) {
  var mitigationValue, selectedRegion;
  var mitigationIds = {
    none: "None",
    weak: "Low",
    moderate: "Medium",
    strong: "High"
  };

  if (typeof opt !== "undefined") {
    // assign value of the mitigation given by argument
    document.getElementById("mitigation-" + opt.mitigation).click();
    mitigationValue = mitigationIds[opt.mitigation];

    // assign value of the region given by argument
    selectedRegion = opt.region;
    document.getElementById("selectButton").value = selectedRegion;
  } else {
    // find the current value of the mitigation
    Object.keys(mitigationIds).forEach(mitId => {
      if (document.getElementById("mitigation-" + mitId).checked) {
        mitigationValue = mitigationIds[mitId];
      }
    });
    // find the current value of the selected region
    selectedRegion = document.getElementById("selectButton").value;

    // update the selected variable
    selected = {
      region: selectedRegion,
      mitigation: mitigationValue
    };
  }

  // update the name of the region in the text below the graph
  updateRegionInText(selectedRegion);

  // Load and preprocess the per-region graph data
  loadGleamvizTraces(linesData.regions[selectedRegion], function (mitig_traces, max_val) {
    layout.yaxis.range = [0, max_val];
    // redraw the lines on the graph
    Plotly.newPlot(plotyGraph, mitig_traces[mitigationValue], layout, plotlyConfig);
  });
}


