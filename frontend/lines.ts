import { guessRegion } from "./tz_lookup";
import * as d3 from "d3";
import * as Plotly from "plotly.js";
import { saveImage } from "./custom-plotly-image-saver";
//import { updateCurrentGraph } from "./measures/current-chart";
import { RegionDropdown } from "./region-dropdown";
import { setGetParamUrl } from "./helpers";
import { makeConfig } from "./graph-common";

const GLEAMVIZ_TRACE_SCALE = 1000; // it gives infections per 1000
const CRITICAL_CARE_RATE = 0.05; // rate of cases requiring critical care

const SELECTION_PARAM = "selection";
const MITIGATION_PARAM = "mitigation";
const CHANNEL_PARAM = "channel";
const REGION_FALLBACK = "united kingdom";

const MAX_CHART_WIDTH_RATIO = 2;
const MAX_CHART_HEIGHT_RATIO = 1;
const MIN_CHART_SIZE = 500;

function controlModelVisualization($container: HTMLElement) {
  function getUrlParams() {
    let urlString = window.location.href;
    let url = new URL(urlString);
    return {
      region:
        url.searchParams.get(SELECTION_PARAM) ||
        guessRegion({ fallback: REGION_FALLBACK }),
      channel: url.searchParams.get(CHANNEL_PARAM) || "main",
      mitigation: url.searchParams.get(MITIGATION_PARAM) || "none"
    };
  }

  let dropdown = new RegionDropdown(
    document.getElementById("regionDropdown"),
    key => changeRegion(key, true)
  );

  let baseData;
  let measureData;
  let selected = getUrlParams();

  function getMitigationId() {
    let mitigationIds = {
      none: "None",
      weak: "Low",
      moderate: "Medium",
      strong: "High"
    };

    return mitigationIds[selected.mitigation];
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

    const formatDate = date => {
      const [year, month, day] = date.split("-").map(n => parseInt(n));

      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ];

      const monthString = monthNames[month - 1];

      return `${monthString} ${day}, ${year}`;
    };

    d3.select("#infections-date").html(`${formatDate(maxDate)}`);
    d3.select("#infections-confirmed").html(
      formatAbsoluteInteger(
        infections["JH_Confirmed"] -
          infections["JH_Recovered"] -
          infections["JH_Deaths"]
      )
    );
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

    let mitigation = getMitigationId();
    const stats = data.mitigation_stats[mitigation];

    let total_infected = formatStatisticsLine(
      stats.TotalInfected_per1000_q05,
      stats.TotalInfected_per1000_q95,
      population
    );
    $("#total-infected").html(total_infected);

    let sim_infected = formatStatisticsLine(
      stats.MaxActiveInfected_per1000_q05,
      stats.MaxActiveInfected_per1000_q95,
      population
    );
    $("#sim-infected").html(sim_infected);
  }

  const formatBigInteger = d3.format(".2s");

  const formatStatisticsLine = function(q05, q95, population) {
    let _q05 = formatBigInteger(q05 * (population / 1000));
    let _q95 = formatBigInteger(q95 * (population / 1000));
    let _q05_perc = formatPercentNumber(q05 / 1000);
    let _q95_perc = formatPercentNumber(q95 / 1000);
    return (
      formatRange(_q05, _q95) + " (" + formatRange(_q05_perc, _q95_perc) + ")"
    );
  };

  const formatRange = function(lower, upper) {
    if (lower == upper) {
      return "~" + lower;
    } else {
      return lower + "-" + upper;
    }
  };

  const formatPercentNumber = d3.format(".2p");

  const formatAbsoluteInteger = function(number) {
    if (typeof number !== "number" || isNaN(number)) {
      return "&mdash;";
    }
    number = Math.round(number);
    if (number < 10000 && number > -10000) {
      return String(number);
    } else {
      return number.toLocaleString();
    }
  };

  let screenshotInfo = () => {
    let regions = baseData.regions;

    if (!(selected.region in regions)) {
      return { name: "plot", title: "COVID-19 Forecast" };
    }

    return {
      name: "plot",
      title: `COVID-19 Forecast for ${regions[selected.region].name}`
    };
  };

  let bounds = {
    y: [0, 0.099],
    x: ["2020-01-01", "2021-01-01"]
  };

  let { config, layout, hook } = makeConfig(bounds, screenshotInfo);

  let size = calculateChartSize();
  layout.width = size.width;
  layout.height = size.height;

  layout.margin.r = 20;
  layout.xaxis.type = "date";
  layout.yaxis.title = "Active infections (% of population)";
  layout.yaxis.tickformat = ".1%";
  layout.yaxis.range = bounds.y;
  layout.showlegend = true;
  layout.legend = {
    x: 1,
    xanchor: "right",
    y: 1,
    yanchor: "top",
    bgcolor: "#22202888",
    font: {
      color: "#fff"
    }
  };

  function isTouchDevice() {
    return !!(
      ("ontouchstart" in window || navigator.maxTouchPoints) // works on most browsers
    ); // works on IE10/11 and Surface
  }

  if (isTouchDevice()) {
    config.scrollZoom = true;
    layout.dragmode = "pan";
  }

  function calculateChartSize() {
    const idealWidth = $container.clientWidth;
    const idealHeight = window.innerHeight * 0.7;
    const maxWidth = idealHeight * MAX_CHART_WIDTH_RATIO;
    const maxHeight = idealWidth * MAX_CHART_HEIGHT_RATIO;
    return {
      width: Math.max(Math.min(idealWidth, maxWidth), MIN_CHART_SIZE),
      height: Math.max(Math.min(idealHeight, maxHeight), MIN_CHART_SIZE)
    };
  }

  function makePlotlyResponsive() {
    d3.select("#my_dataviz .js-plotly-plot .plotly .svg-container").attr(
      "style",
      null
    );
    d3.selectAll("#my_dataviz .js-plotly-plot .plotly .main-svg")
      .attr("height", null)
      .attr("width", null)
      .attr("viewBox", `0 0 ${layout.width} ${layout.height}`);
  }

  Plotly.newPlot($container, [], layout, config).then(gd => {
    makePlotlyResponsive();
    gd.on("plotly_restyle", makePlotlyResponsive);
    gd.on("plotly_relayout", makePlotlyResponsive);
    hook(gd);
  });

  window.addEventListener("resize", () => {
    const size = calculateChartSize();
    if (size.width !== layout.width || size.height !== layout.height) {
      Object.assign(layout, size);
      console.log($container);

      Plotly.relayout($container, size);
    }
  });

  // formats like d3 "s" except it keeps things integer
  function formatSIInteger(precision: number): (n: number) => string {
    const formatInt = d3.format("d");
    const formatSI = d3.format(`.${precision}s`);

    return (number: number) => {
      number = Math.round(number);
      // we want to show SI number, but it has to be integer
      if (number < Math.pow(10, precision))
        // for small numbers just use the decimal formatting
        return formatInt(number);
      // otherwise use the SI formatting
      else return formatSI(number);
    };
  }

  // Checks if the max and traces have been loaded and preprocessed for the given region;
  // if not, loads them and does preprocessing; then caches it in the region object.
  // Finally calls thenTracesMax(mitigationTraces, max_Y_val).
  function loadGleamvizTraces(regionRec, thenTracesMax) {
    if (regionRec.cache) {
      thenTracesMax(
        regionRec.cache.traces,
        regionRec.cache.maxY,
        regionRec.cache.xrange
      );
    }

    // Not cached, load and preprocess
    let tracesUrl = regionRec.data.infected_per_1000.traces_url;

    d3.json(
      `https://storage.googleapis.com/static-covid/static/${tracesUrl}`
    ).then(data => {
      // TODO error handling

      const STRIDE = 2;

      let result = { traces: [], maxY: -Infinity, xrange: null };
      const formatPop = formatSIInteger(3);

      // Iterate over mitigations (groups)
      Object.keys(data).forEach(key => {
        // Iterate over Plotly traces in groups
        data[key].forEach(traceData => {
          let trace = {
            ...traceData,
            text: [],
            _mitigation: key,
            x: [],
            y: []
          };

          trace.line.shape = "spline";

          result.traces.push(trace);

          for (let i = 0; i < traceData.y.length; i += STRIDE) {
            trace.y.push(traceData.y[i] / GLEAMVIZ_TRACE_SCALE);
            trace.text.push(
              formatPop(
                (traceData.y[i] / GLEAMVIZ_TRACE_SCALE) * regionRec.population
              )
            );
          }
          result.maxY = Math.max(result.maxY, ...trace.y);

          // When x has length 1, extend it to a day sequence of len(y) days
          if (traceData.x.length === 1) {
            let xStart = new Date(traceData.x[0]);
            traceData.x[0] = xStart;
            for (let i = 1; i < traceData.y.length; i += STRIDE) {
              trace.x.push(d3.timeDay.offset(xStart, i));
            }
          } else {
            for (let i = 1; i < traceData.y.length; i += STRIDE) {
              trace.x.push(traceData.x[i]);
            }
          }

          if (traceData["hoverinfo"] !== "skip") {
            trace.hoverlabel = { namelength: -1 };
            trace.hovertemplate = "%{text}<br />%{y:.2%}";
          }

          if (!result.xrange) {
            result.xrange = [trace.x[0], trace.x[trace.x.length - 1]];
          }
        });
      });

      // Cache the values in the region
      regionRec.cached = result;

      // Callback
      thenTracesMax(result.traces, result.maxY, result.xrange);
    });
  }

  $("#mitigation input[type=radio]").each(
    (_index: number, elem: HTMLInputElement): void | false => {
      if (elem.value === selected.mitigation) {
        elem.checked = true;
      }

      elem.addEventListener("click", () => {
        selected.mitigation = elem.value;
        updatePlot();
      });
    }
  );

  // update the graph
  function updatePlot() {
    Plotly.react($container, [], layout);

    let mitigationId = getMitigationId();

    // update the name of the region in the text below the graph
    updateRegionInText(selected.region);

    // update the summary statistics per selected mitigation strength
    updateStatistics();

    let regionData = baseData.regions[selected.region];
    //let measures = measureData[regionData.iso_alpha_3];
    //updateCurrentGraph(regionData, measures);

    // Load and preprocess the per-region graph data
    loadGleamvizTraces(regionData, (traces, maxVal, xrange) => {
      layout.yaxis.range = [0, maxVal];

      bounds.y = [0, maxVal];
      // AddCriticalCareTrace(mitigTraces[mitigationId]);
      // redraw the lines on the graph

      Plotly.addTraces(
        $container,
        traces.filter(trace => trace._mitigation == mitigationId)
      );
      bounds.x = xrange;
    });
  }

  // function AddCriticalCareTrace(traces) {
  //   let line_title = "Hospital critical care capacity (approximate)";

  //   const lastTrace = traces[traces.length - 1];
  //   if (lastTrace && lastTrace.name === line_title) return;
  // }

  function updateRegionInText(region) {
    let countryName = baseData.regions[region].name;
    jQuery(".selected-region").html(countryName);
  }

  function getRegionUrl(region) {
    return setGetParamUrl(SELECTION_PARAM, region);
  }

  // change the displayed region
  function changeRegion(newRegion, pushState) {
    if (!(newRegion in baseData.regions)) {
      newRegion = REGION_FALLBACK;
      pushState = false;
    }

    // update the global state
    selected.region = newRegion;

    // change url
    if (history.pushState && pushState) {
      let path = getRegionUrl(newRegion);
      window.history.pushState({ path }, "", path);
    }

    // update the dropdown
    dropdown.update(newRegion, baseData.regions[selected.region].name);

    // update the graph
    updatePlot();
    updateInfectionTotals();
  }

  let sources = [
    `data-${selected.channel}-v3.json`,
    `data-testing-containments.json`
  ];

  // Load the basic data (estimates and graph URLs) for all generated countries
  Promise.all(
    sources.map(path =>
      d3.json(`https://storage.googleapis.com/static-covid/static/${path}`)
    )
  ).then(data => {
    [baseData, measureData] = data;

    // populate the dropdown menu with countries from received data
    let listOfRegions = Object.keys(baseData.regions);
    listOfRegions.forEach(key =>
      dropdown.addRegionDropdown(
        key,
        getRegionUrl(key),
        baseData.regions[key].name
      )
    );

    dropdown.reorderDropdown();
    dropdown.restyleDropdownElements();

    // initialize the graph
    changeRegion(selected.region, false);

    // initialize the select picker
    $('[data-toggle="tooltip"]').tooltip();
  });
}

let $container = document.getElementById("my_dataviz");
if ($container) {
  controlModelVisualization($container);
}
