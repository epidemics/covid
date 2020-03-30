/* global Promise:false Plotly:false d3:false */

const Y_SCALE = 10; // Going from per_1000_pops to per 100 (%)
const CRITICAL_CARE_RATE = 0.05; // rate of cases requiring critical care

const SELECTION_PARAM = "selection";
const MITIGATION_PARAM = "mitigation";
const CHANNEL_PARAM = "mitigation";

function getUrlParams() {
  let urlString = window.location.href;
  let url = new URL(urlString);
  return {
    region: url.searchParams.get(SELECTION_PARAM) || "united kingdom",
    channel: url.searchParams.get(CHANNEL_PARAM) || "main",
    mitigation: url.searchParams.get(MITIGATION_PARAM) || "none"
  };
}

let baseData, manualData;
let selected = getUrlParams();

function getMitigationId() {
  var mitigationIds = {
    none: "None",
    weak: "Low",
    moderate: "Medium",
    strong: "High"
  };

  return mitigationIds[selected.mitigation]
}

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
  d3.select("#infections-confirmed").html(formatAbsoluteInteger(
    infections["JH_Confirmed"] - infections["JH_Recovered"] - infections["JH_Deaths"]
  ));
  d3.select("#infections-estimated").html(
    formatAbsoluteInteger(infections["FT_Infected"])
  );
  /* Temporarily swithed off - we do not have confidence intervals for non-FT estimates
  d3.select("#infections-estimated-ci").html(
    `${formatInfectionTotal(
      infections["FT_Infected_q05"]
    )} - ${formatInfectionTotal(infections["FT_Infected_q95"])}`
  );
  */
  d3.select("#infections-population").html(formatAbsoluteInteger(population));
}

function updateStatistics() {
  if (typeof baseData === "undefined") return;

  const { population, data } = baseData.regions[selected.region];

  var mitigation = getMitigationId();
  const stats = data.mitigation_stats[mitigation]

  var total_infected = formatStatisticsLine(
    stats.TotalInfected_per1000_q05,
    stats.TotalInfected_per1000_q95,
    population
  );
  $("#total-infected").html(total_infected);

  var sim_infected = formatStatisticsLine(
    stats.MaxActiveInfected_per1000_q05,
    stats.MaxActiveInfected_per1000_q95,
    population
  );
  $("#sim-infected").html(sim_infected);
}

const formatBigInteger = function (value) {
  var labelValue = Math.round(value.toPrecision(2))
  // Nine Zeroes for Billions
  return Math.abs(Number(labelValue)) >= 1.0e+9
    ? Math.abs(Number(labelValue)) / 1.0e+9 + 'B'
    // Six Zeroes for Millions
    : Math.abs(Number(labelValue)) >= 1.0e+6
      ? Math.abs(Number(labelValue)) / 1.0e+6 + 'M'
      // Three Zeroes for Thousands
      : Math.abs(Number(labelValue)) >= 1.0e+3
        ? Math.abs(Number(labelValue)) / 1.0e+3 + 'K'
        : Math.abs(Number(labelValue))
}

const formatStatisticsLine = function (q05, q95, population) {
  var _q05 = formatBigInteger(q05 * (population / 1000));
  var _q95 = formatBigInteger(q95 * (population / 1000));
  var _q05_perc = formatPercentNumber(q05 / 10);
  var _q95_perc = formatPercentNumber(q95 / 10);
  return formatRange(_q05, _q95) + ' (' + formatRange(_q05_perc, _q95_perc) + '%)';
}

const formatRange = function (lower, upper) {
  if (lower == upper) {
    return "~" + lower;
  } else {
    return lower + "-" + upper;
  }
}

const formatPercentNumber = function (number) {
  // One decimal places for numbers < 10 %.
  // Two decimal places for numbers < 0.1 %.
  if (Math.abs(number) >= 10) {
    return String(Math.round(number));
  } else if (Math.abs(number) >= 0.1) {
    return String(Math.round(number * 10) / 10);
  } else {
    return String(Math.round(number * 100) / 100);
  }
}

const formatAbsoluteInteger = function (number) {
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
    /*  title: "Date",
     titlefont: {
       family: "DM Sans, sans-serif",
       size: 18,
       color: "white"
     }, */
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
          if (trace["hoverinfo"] !== "skip") {
            trace["hoverlabel"] = { "namelength": -1 };
            trace["hovertemplate"] = "%{y:.2r}";
          }
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

document.querySelectorAll("#mitigation input[type=radio]").forEach(elem => {
  if (elem.value === selected.mitigation) {
    elem.checked = true;
  }

  elem.addEventListener("click", () => {
    selected.mitigation = elem.value;
    updatePlot();
  });
});

// update the graph
function updatePlot() {
  let mitigationId = getMitigationId();

  // update the name of the region in the text below the graph
  updateRegionInText(selected.region)

  // update the summary statistics per selected mitigation strength
  updateStatistics()

  // Load and preprocess the per-region graph data
  loadGleamvizTraces(baseData.regions[selected.region], function (mitigTraces, maxVal) {
    layout.yaxis.range = [0, maxVal];
    AddCriticalCareTrace(mitigTraces[mitigationId]);
    // redraw the lines on the graph
    Plotly.newPlot(plotyGraph, mitigTraces[mitigationId], layout, plotlyConfig);
  });
}

function AddCriticalCareTrace(traces) {
  let line_title = "Hospital critical care capacity (approximate)"

  const lastTrace = traces[traces.length - 1];
  if (lastTrace && lastTrace.name === line_title) return;

  const regionData = manualData.regions[selected.region];
  if (typeof regionData !== 'object') return;

  const capacity = regionData.beds_p_100k / 100 / Y_SCALE / CRITICAL_CARE_RATE;
  if (typeof capacity !== "number" || Number.isNaN(capacity)) return;

  /* NOTE: Temporarily disabled due to possible inconsistencies and misinterpretation. */
  /*
  traces.push({
    x: d3.extent(traces[0].x),
    y: [capacity, capacity],
    name: line_title,
    mode: "lines",
    line: { color: "#be3a40", dash: "solid", width: 1.6 },
    hoverinfo: 'y'
  });
  */
}

function updateRegionInText(region) {
  var countryName = regionDict[region].name;
  jQuery(".selected-region").html(countryName);
}

function setGetParamUrl(key, value){
  var params = new URLSearchParams(window.location.search);
  params.set(key, value);
  var url =
    window.location.protocol +
    "//" +
    window.location.host +
    window.location.pathname +
    "?" +
    params.toString();

  return url;
}

function getRegionUrl(region){
  return setGetParamUrl(SELECTION_PARAM, region);
}

let $regionList = document.getElementById("regionList");
let $regionDropdownLabel = document.getElementById("regionDropdownLabel");
let $regionFilter = document.getElementById("regionFilter");
let $regionDropdown = document.getElementById("regionDropdown")

// contains all the regions for the purpose of the dropdown menu
let regionList = [];
let regionDict = {};

// the offset in the regionList of the currently focused region
let focusedRegionIdx = 0;
let filterQuery = "";

// listen for dropdown trigger
jQuery($regionDropdown).on("show.bs.dropdown", () => {
  // clear the fitler value
  $regionFilter.value = "";
  $($regionList).css("max-height", $(window).height() * 0.5);
})

jQuery($regionDropdown).on("shown.bs.dropdown", () => {
  if(filterQuery !== ""){
    filterQuery = "";
    reorderDropdown();
  }

  // and focus the filter field
  $regionFilter.focus();
})

// make the dropdown entry
function addRegionDropdown(region_key, name){
  const link = document.createElement("a");

  let url = getRegionUrl(region_key);

  link.innerHTML = name;
  link.href = url;
  link.addEventListener("click", evt => {
    evt.preventDefault();

    // change url
    if (history.pushState) {
      window.history.pushState({ path: url }, "", url);
    }

    // change the region
    changeRegion(region_key);
  })

  let item = {key: region_key, name, dropdownEntry: link};

  // add it to the dict and list
  regionDict[region_key] = item;
  regionList.push(item);
}

// the dropdown items are restorted depending on a search query
function reorderDropdown(){
  // we score each region item with how good the region name matches the query
  regionList.forEach(region => {
    region.score = string_score(region.name, filterQuery)
  });

  // then we sort the list
  regionList.sort((a, b) => {
    // first by score
    if (a.score < b.score) {
      return 1;
    }
    if (a.score > b.score) {
      return -1;
    }
    // then alphabetically
    if (a.name > b.name){
      return 1;
    }
    if (a.name < b.name){
      return -1;
    }
    return 0;
  })

  let bestScore = regionList[0].score;
  for(let i = 0; i < regionList.length; i++){
    let {score, dropdownEntry} = regionList[i];

    // re-add the entry, this sorts the dom elements
    $regionList.appendChild(dropdownEntry);

    // if we have good matches we only want to show those
    if(score < bestScore/1000){
      // correct the focus offset so it does not so something silly
      if(focusedRegionIdx >= i){
        focusedRegionIdx = i-1;
      }

      $regionList.removeChild(dropdownEntry);
      continue;
    }
  }
}

// update the look of the of the dropdown entries
function restyleDropdownElements() {
  regionList.forEach(({key, dropdownEntry}, index) => {
    className = "dropdown-item";

    // TODO maybe differentiate visually between 'current' and 'focused'
    if(key === selected.region){
      className += " active";
    }

    if(index === focusedRegionIdx){
      className += " active"; 

      // TODO something like this:
      // dropdownEntry.scrollIntoView(false);
    }

    dropdownEntry.className = className;
  })
}

$regionFilter.addEventListener("keyup", () => { 
  if(filterQuery === $regionFilter.value){
    // dont do anything if the query didnt change
    return;
  }

  filterQuery = $regionFilter.value;
  if(filterQuery !== ""){
    // focus the first element in the list
    focusedRegionIdx = 0;
  }

  reorderDropdown();
  restyleDropdownElements();
})

// listen on regionFilter events
$regionFilter.addEventListener("keydown", evt => {

  // on enter we select the currently highlighted entry
  if (evt.key === "Enter") {
    changeRegion(regionList[focusedRegionIdx].key);
    $($regionDropdown).dropdown('toggle')
  }

  else if (evt.key === "ArrowUp") {
    focusedRegionIdx = Math.max(focusedRegionIdx - 1, 0);

    restyleDropdownElements();
  }
  
  else if (evt.key === "ArrowDown") {
    focusedRegionIdx = Math.min(focusedRegionIdx + 1, regionList.length - 1);

    restyleDropdownElements();
  }
})

// populate the region dropdown label
// FIXME: this is kind of a hack and only looks nonsilly because the label is allcapsed
$regionDropdownLabel.innerHTML = selected.region;

// change the displayed region
function changeRegion(newRegion) {
  // update the global state
  selected.region = newRegion;

  // set the main label
  $regionDropdownLabel.innerHTML = regionDict[selected.region].name;

  // update the graph
  restyleDropdownElements();
  updatePlot();
  updateInfectionTotals();
}

// Load the basic data (estimates and graph URLs) for all generated countries
Promise.all([`data-${selected.channel}-v3.json`, "data-manual-estimates-v1.json"].map(
  path => d3.json(`https://storage.googleapis.com/static-covid/static/${path}`)
)).then(data => {
  [baseData, manualData] = data;

  // populate the dropdown menu with countries from received data
  let listOfRegions = Object.keys(baseData.regions);
  listOfRegions.forEach((key) => 
    addRegionDropdown(key, baseData.regions[key].name)
  );

  reorderDropdown();
  restyleDropdownElements();

  changeRegion(selected.region)
});