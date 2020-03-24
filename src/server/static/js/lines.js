/* global $:false d3:false Plotly:false */

const Y_SCALE = 10; // Going from per_1000_pops to per 100 (%)
const SCENARIOS = [
  {
    scenario: "COVID seasonality 0.85, Air traffic 0.20",
    label: "WEAK seasonality + <br />STRONGLY reduced air travel"
  }, {
    scenario: "COVID seasonality 0.70, Air traffic 0.20",
    label: "MEDIUM seasonality + <br />STRONGLY reduced air travel"
  }, {
    scenario: "COVID seasonality 0.50, Air traffic 0.20",
    label: "STRONG seasonality + <br />STRONGLY reduced air travel"
  }, {
    scenario: "COVID seasonality 0.85, Air traffic 0.70",
    label: "WEAK seasonality + <br />WEAKLY reduced air travel"
  }, {
    scenario: "COVID seasonality 0.70, Air traffic 0.70",
    label: "MEDIUM seasonality + <br />WEAKLY reduced air travel"
  }, {
    scenario: "COVID seasonality 0.50, Air traffic 0.70",
    label: "STRONG seasonality + <br />WEAKLY reduced air travel"
  }
];

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
    bgcolor: "#22202888",
    font: {
      color: '#fff'
    }
  }
};

var colors = ["#edcdab", "#edb77e", "#e97f0f", "#9ac9d9", "#5abbdb", "#007ca6"];

var plotlyConfig = {
  displaylogo: false,
  responsive: true,
  scrollZoom: false
};

Plotly.newPlot(plotyGraph, [], layout, plotlyConfig);


function getMaxYValueForRegion(mitigations) {
  var highestVals = [];
  Object.values(mitigations).forEach(mitigation => {
    Object.values(mitigation).forEach(values => {
      highestVals.push(Math.max(...values));
    });
  });
  return Math.max(...highestVals);
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
/* end from lines.js */

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
  "-gleam.json",
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

  // find the max value across all mitigations and update the axis range
  const yMax = getMaxYValueForRegion(
    linesData.regions[selectedRegion].data.infected_per_1000.mitigations
  );
  layout.yaxis.range = [0, yMax / Y_SCALE];

  var regionData =
    linesData.regions[selectedRegion].data.infected_per_1000.mitigations[
    mitigationValue
    ];

  const traces = [];

  var x;
  var xStart = new Date(linesData.regions[selectedRegion].data.infected_per_1000.start);

  var idx = 0;
  SCENARIOS.forEach(({ scenario, label }) => {
    // the x axis is the same for all traces so only defining it once
    if (typeof x === "undefined") {
      x = [];
      for (let i = 0; i < regionData[scenario].length; ++i) {
        x[i] = d3.timeDay.offset(xStart, i);
      }
    }
    // debugger;
    traces.push({
      x: x,
      y: regionData[scenario].map(y => y / Y_SCALE),
      mode: "lines",
      name: label,
      line: {
        dash: "solid",
        width: 2,
        color: colors[idx]
      },
      hoverlabel: { namelength: -1 }
    });
    idx = idx + 1;
  });
  // redraw the lines on the graph
  Plotly.newPlot(plotyGraph, traces, layout, plotlyConfig);
}
