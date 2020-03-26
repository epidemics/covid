/* global Promise:false Plotly:false d3:false */

const Y_SCALE = 10; // Going from per_1000_pops to per 100 (%)
const CRITICAL_CARE_RATE = 0.05; // rate of cases requiring critical care

function getUrlParams() {
  var urlString = window.location.href;
  var url = new URL(urlString);
  return {
    region: url.searchParams.get("selection") || "united kingdom",
    channel: url.searchParams.get("channel") || "main"
  };
}

const { channel } = getUrlParams();
var baseData, manualData, listOfRegions;
let selected = {
  region: getUrlParams().region,
  mitigation: "none"
};

function updateInfectionTotals() {
  if (typeof baseData === "undefined") return;

  const { population, data } = baseData.regions[selected.region];
  const dates = Object.keys(data.estimates.days);
  let maxDate = dates[0];
  dates.slice(1).forEach(date => {
    if (new Date(maxDate) < new Date(date)) {
      maxDate = date;
    }
  });
  const infections = data.estimates.days[maxDate];

  const formatDate = (date) => {

    const [year, month, day] = date.split("-").map(n => parseInt(n));

    const monthNames = [
      "Jan", "Feb", "Mar",
      "Apr", "May", "Jun",
      "Jul", "Aug", "Sep",
      "Oct", "Nov", "Dec"];

    const monthString = monthNames[month - 1];

    return `${monthString} ${day}, ${year}`;
  };


  d3.select("#infections-date").html(`(${formatDate(maxDate)})`);
  d3.select("#infections-confirmed").html(formatInfectionTotal(
    infections["JH_Confirmed"] - infections["JH_Recovered"] - infections["JH_Deaths"]
  ));
  d3.select("#infections-estimated").html(
    formatInfectionTotal(infections["FT_Infected"])
  );
  /* Temporarily swithed off - we do not have confidence intervals for non-FT estimates
  d3.select("#infections-estimated-ci").html(
    `${formatInfectionTotal(
      infections["FT_Infected_q05"]
    )} - ${formatInfectionTotal(infections["FT_Infected_q95"])}`
  );
  */
  d3.select("#infections-population").html(formatInfectionTotal(population));
}

const formatInfectionTotal = function (number) {
  if (typeof number !== "number" || Number.isNaN(number)) {
    return "&mdash;";
  }
  number = Math.round(number);
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
    bgcolor: "#22202888",
    font: {
      color: '#fff'
    }
  }
};

var plotlyConfig = {
  displaylogo: false,
  responsive: true,
  scrollZoom: false
};

Plotly.newPlot(plotyGraph, [], layout, plotlyConfig);

// Checks if the max and traces have been loaded and preprocessed for the given region;
// if not, loads them and does preprocessing; then caches it in the region object.
// Finally calls thenTracesMax(mitigationTraces, max_Y_val).
function loadGleamvizTraces(regionRec, thenTracesMax) {

  if (typeof regionRec.cached_gleam_traces === "undefined") {
    // Not cached, load and preprocess
    var tracesUrl = regionRec.data.infected_per_1000.traces_url;

    d3.json(
      `https://storage.googleapis.com/static-covid/static/${tracesUrl}`
    ).then(function (mitigationsData) {
      var highestVals = [];

      // Iterate over mitigations (groups)
      Object.values(mitigationsData).forEach(mitigationTraces => {
        // Iterate over Plotly traces in groups
        Object.values(mitigationTraces).forEach(trace => {

          // Scale all trace Ys to percent
          Object.keys(trace.y).forEach(i => {
            trace.y[i] = trace.y[i] / Y_SCALE;
          });
          highestVals.push(Math.max(...trace.y));

          // When x has length 1, extend it to a day sequence of len(y) days
          if (trace.x.length === 1) {
            var xStart = new Date(trace.x[0]);
            trace.x[0] = xStart;
            for (let i = 1; i < trace.y.length; ++i) {
              trace.x[i] = d3.timeDay.offset(xStart, i);
            }
          }

          trace["hoverlabel"] = { "namelength": -1 };
          trace["hovertemplate"] = "%{y:.2r}";
        });
      });
      var maxY = Math.max(...highestVals);



      // Cache the values in the region
      regionRec.cached_gleam_traces = mitigationsData;
      regionRec.cached_gleam_max_y = maxY;
      // Callback
      thenTracesMax(mitigationsData, maxY);
    });
  } else {
    // Callback
    thenTracesMax(regionRec.cached_gleam_traces, regionRec.cached_gleam_max_y);
  }
}

function getListOfRegions() {
  return Object.keys(baseData.regions).map(key => {
    return { key, name: baseData.regions[key].name };
  }).sort(function (a, b) {
    if (a.name < b.name) { return -1; }
    if (a.name > b.name) { return 1; }
    return 0;
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


// update the graph
function updatePlot(opt) {
  var mitigationIds = {
    none: "None",
    weak: "Low",
    moderate: "Medium",
    strong: "High"
  };

  if (typeof opt !== "undefined") {
    // assign value of the mitigation given by argument
    document.getElementById("mitigation-" + opt.mitigation).click();
    return; // click callback will re-activate the function
  }
  // find the current value of the mitigation
  Object.keys(mitigationIds).forEach(mitId => {
    if (document.getElementById("mitigation-" + mitId).checked) {
      selected.mitigation = mitigationIds[mitId];
    }
  });

  // update the name of the region in the text below the graph
  updateRegionInText(selected.region);

  // Load and preprocess the per-region graph data
  loadGleamvizTraces(baseData.regions[selected.region], function (mitigTraces, maxVal) {
    layout.yaxis.range = [0, maxVal];
    AddCriticalCareTrace(mitigTraces[selected.mitigation]);
    // redraw the lines on the graph
    Plotly.newPlot(plotyGraph, mitigTraces[selected.mitigation], layout, plotlyConfig);
  });
}

function AddCriticalCareTrace(traces) {
  // add the line only if it doesn't exist yet
  console.log(traces)

  let line_title = "Hospital critical care capacity (approximate)"

  const lastTrace = traces[traces.length - 1];
  if (lastTrace && lastTrace.name === line_title) return;

  const regionData = manualData.regions[selected.region];
  if (typeof regionData !== 'object') return;

  const capacity = regionData.beds_p_100k / 100 / Y_SCALE / CRITICAL_CARE_RATE;
  if (typeof capacity !== "number" || Number.isNaN(capacity)) return;

  /* NOTE: Temporarily disabled due to possible inconsistencies and misinterpretation. */
  traces.push({
    x: d3.extent(traces[0].x),
    y: [capacity, capacity],
    name: line_title,
    mode: "lines",
    line: { color: "#be3a40", dash: "solid", width: 1.6 },
    hoverinfo: 'y'
  });


}

// Load the basic data (estimates and graph URLs) for all generated countries
Promise.all([`data-${channel}-v3.json`, "data-manual-estimates-v1.json"].map(
  path => d3.json(`https://storage.googleapis.com/static-covid/static/${path}`)
)).then(data => {
  [baseData, manualData] = data;

  // populate the dropdown menu with countries from received data
  listOfRegions = getListOfRegions();
  listOfRegions.forEach(({ key, name }) => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.innerHTML = name;
    opt.selected = (key === selected.region);
    selectButton.appendChild(opt);
  });

  // Reported & Estimated Infections
  updateInfectionTotals();

  // initialize the graph
  updatePlot(selected);
});
