/* global $:true d3:true Plotly:true */

var url_string = window.location.href;
var url = new URL(url_string);
var channel = url.searchParams.get("channel") || "main";

var dataJSON = null;
var listOfRegions = null;
var selected = {
  country: url.searchParams.get("selection") || "france",
  mitigation: "none"
};

// Reported & Estimated Infections
var estimatesData;

d3.json(
  `https://storage.googleapis.com/static-covid/static/data-${channel}-estimates-v1.json`
).then(function(data) {
  estimatesData = data;
  updateInfectionTotals();
});

function updateInfectionTotals() {
  if (typeof estimatesData === "undefined") return;

  const { population, data } = estimatesData.regions[selected.country];
  const dates = Object.keys(data.estimates.days);
  let maxDate = dates[0];
  dates.slice(1).forEach(date => {
    if (new Date(maxDate) < new Date(date)) {
      maxDate = date;
    }
  });
  const infections = data.estimates.days[maxDate];

  d3.select("#infections-date").html(`(${maxDate})`);
  d3.select("#infections-confirmed").html(
    formatInfectionTotal(infections["JH_Confirmed"])
  );
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

const formatInfectionTotal = function(number) {
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
  height: 675,
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
    title: "Active infections as a percentage of the population",
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
  }
};

var colors = ["#edcdab", "#edb77e", "#e97f0f", "#9ac9d9", "#5abbdb", "#007ca6"];

var plotlyConfig = {
  displaylogo: false,
  responsive: true,
  scrollZoom: true
};

Plotly.newPlot(plotyGraph, [], layout, plotlyConfig);

/* start from lines.js */
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


function getListOfRegions(regions) {
  return Object.keys(regions).map(k => {
    return { key: k, value: regions[k].name };
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

function update_country_in_text(selectedCountry) {
  var countrySpans = jQuery(".selected-country");
  for (i = 0; i < countrySpans.length; i++) {
    countrySpans[i].innerHTML = selectedCountry;
  }
}

// triggered by change of country in the drop down menu
function country_change() {
  // recover the option that has been chosen
  selected.country = selectButton.value;
  // change url param
  setGetParam("selection", selected.country);
  var countryName = listOfCountries.find(c => c.key == selected.country).value;
  // update the graph
  update_plot();
  // update the name of the country in the text below the graph
  update_country_in_text(countryName);
  updateInfectionTotals();
}

// load the data used for the graph
jQuery.getJSON(
  "https://storage.googleapis.com/static-covid/static/data-" +
    (channel ? channel : "main") +
    "-gleam.json",
  function(data) {
    dataJSON = data;
    // populate the dropdown menu with countries from received data
    listOfCountries = getListOfRegions(data.regions);
    var region = null;
    for (k in listOfCountries) {
      region = listOfCountries[k];
      var opt = document.createElement("option");
      opt.value = region.key;
      opt.innerHTML = region.value;
      selectButton.appendChild(opt);
    }
    // initialize the graph
    update_plot((opt = selected));
  }
);



// update the graph
function update_plot(opt = null) {
  var mitigation_value = null;
  var mitigation_ids = {
    none: "None",
    weak: "Low",
    moderate: "Medium",
    strong: "High"
  };

  if (opt != undefined) {
    // assign value of the mitigation given by argument
    document.getElementById("mitigation-" + opt.mitigation).click();
    mitigation_value = mitigation_ids[opt.mitigation];

    // assign value of the country given by argument
    var selectedCountry = opt.country;
    document.getElementById("selectButton").value = selectedCountry;
  } else {
    // find the current value of the mitigation
    for (mit_id in mitigation_ids) {
      if (document.getElementById("mitigation-" + mit_id).checked) {
        mitigation_value = mitigation_ids[mit_id];
      }
    }
    // find the current value of the selected country
    var selectedCountry = document.getElementById("selectButton").value;

    // update the selected variable
    selected = {
      country: selectedCountry,
      mitigation: mitigation_value
    };
  }

  // find the max value across all mitigations and update the axis range
  y_max = getMaxYValueForCountry(
    dataJSON.regions[selectedCountry].data.infected_per_1000.mitigations
  );
  layout.yaxis.range = [0, y_max];

  var countryData =
    dataJSON.regions[selectedCountry].data.infected_per_1000.mitigations[
      mitigation_value
    ];

  const traces = [];

  var x = null;
  var x_start = dataJSON.regions[selectedCountry].data.infected_per_1000.start;

  var idx = 0;
  getScenariosWithLabels(countryData).forEach(({ scenario, label }) => {
    // the x axis is the same for all traces so only defining it once
    if (x == undefined) {
      x = new Array(countryData[scenario].length);
      for (i = 0; i < countryData[scenario].length; ++i) {
        x[i] = new Date(x_start);
        x[i].setDate(x[i].getDate() + i);
      }
    }
    traces.push({
      x: x,
      y: countryData[scenario],
      mode: "lines",
      name: label,
      line: {
        dash: "solid",
        width: 2,
        color: colors[idx]
      },
      hoverlabel: {namelength :-1}
    });
    idx = idx + 1;
  });
  // redraw the lines on the graph
  Plotly.newPlot(plotyGraph, traces, layout, plotlyConfig);
}

function getScenariosWithLabels(countryData) {
  const labels = [
    'WEAK seasonality + <br />WEAK reduced air travel',
    'MEDIUM seasonality + <br />STRONG reduced air travel',
    'STRONG seasonality + <br />WEAK reduced air travel',
    'WEAK seasonality + <br />STRONG reduced air travel',
    'MEDIUM seasonality + <br />WEAK reduced air travel',
    'STRONG seasonality + <br />STRONG reduced air travel'
  ];

  const paramSets = Object.keys(countryData).map(getScenarioParameters);
  const sortedParamSets = paramSets.sort((a, b) => {
    return parseFloat(b['COVID seasonality']) - parseFloat(a['COVID seasonality']);
  }).sort((a, b) => {
    return parseFloat(a['Air traffic']) - parseFloat(b['Air traffic']);
  });
  return sortedParamSets.map((params, i) => ({
    scenario: `COVID seasonality ${params['COVID seasonality']
              }, Air traffic ${params['Air traffic']}`,
    label: labels[i]
  }));
}

function getScenarioParameters(scenario) {
  const params = {};
  scenario.split(', ').forEach(part => {
    const match = /^(?<param>[^\d\.]+) (?<value>[\d\.]+)$/.exec(part);
    params[match.groups.param] = match.groups.value;
  });
  return params;
}
