import { guessRegion } from "./tz_lookup";
import * as d3 from "d3";
import * as Plotly from "plotly.js";
import { string_score } from "./string_score";
import { saveImage } from "./custom-plotly-image-saver";
import { updateCurrentGraph } from "./current-chart";

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

  let ybounds: Range = [0, 0.099];
  let xbounds: Range = [null, null];

  // graph layout
  let layout: Partial<Plotly.Layout> = {
    ...calculateChartSize(),
    margin: { r: 20, t: 40 },
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
      tickcolor: "#fff",
      rangeselector: { visible: true }
    },
    yaxis: {
      title: "Active infections (% of population)",
      titlefont: {
        family: "DM Sans, sans-serif",
        size: 16,
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
      tickformat: ".1%",
      tickcolor: "#fff",
      showline: true,
      linecolor: "#fff",
      linewidth: 1,
      showgrid: false,
      zeroline: true,
      zerolinecolor: "#fff",
      zerolinewidth: 1,
      // this way the axis does not change width on data load
      range: [...ybounds]
    },
    showlegend: true,
    legend: {
      x: 1,
      xanchor: "right",
      y: 1,
      yanchor: "top",
      bgcolor: "#22202888",
      font: {
        color: "#fff"
      }
    }
  };

  const DOWNLOAD_PLOT_SCALE = 2;
  let getDownloadPlotTitle = () => {
    let regions = baseData.regions;

    if (!(selected.region in regions)) {
      return "COVID-19 Forecast";
    }

    return `COVID-19 Forecast for ${regions[selected.region].name}`;
  };

  let customToImage: Plotly.ModeBarButton = {
    name: "Download plot",
    title: "Download plot",
    icon: Plotly.Icons.camera,
    click: gd =>
      saveImage(gd, {
        name: selected.region,
        scale: DOWNLOAD_PLOT_SCALE,
        width: 800,
        height: 600,
        format: "png",
        background: "black",
        compose: ($canvas, plot, width, height) => {
          $canvas.width = width;
          $canvas.height = height;
          let ctx = $canvas.getContext("2d");

          ctx.filter = "invert(1)";
          ctx.drawImage(plot, 0, 0);

          const LINE_SPACING = 0.15;

          let y = 0;
          function drawCenteredText(text, size) {
            y += (1 + LINE_SPACING) * size;
            ctx.font = `${Math.round(size)}px "DM Sans"`;
            let x = (width - ctx.measureText(text).width) / 2;
            ctx.fillText(text, x, y);
            y += LINE_SPACING * size;
          }

          ctx.fillStyle = "white";
          drawCenteredText(getDownloadPlotTitle(), 20 * DOWNLOAD_PLOT_SCALE);

          ctx.fillStyle = "light gray";
          drawCenteredText(
            "by epidemicforecasting.org",
            12 * DOWNLOAD_PLOT_SCALE
          );
        }
      })
  };

  let customResetView: Plotly.ModeBarButton = {
    name: "Reset view",
    title: "Reset axis",
    icon: Plotly.Icons.autoscale,
    click: gd => {
      Plotly.relayout(gd, {
        "yaxis.range": [...ybounds],
        "xaxis.range": [...xbounds]
      } as any);
    }
  };

  let config: Partial<Plotly.Config> = {
    displaylogo: false,
    responsive: false,
    displayModeBar: true,
    modeBarButtonsToAdd: [customToImage, customResetView],
    modeBarButtonsToRemove: ["toImage", "resetScale2d", "autoScale2d"]
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

  type Range = [number, number];

  function ensureZero() {
    let shouldUpdate = false;
    let range = layout.yaxis.range as Range;
    if (range[0] < ybounds[0]) {
      range[1] += ybounds[0] - range[0];
      range[0] = ybounds[0];
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      Plotly.relayout($container, {
        "yaxis.range": range
      });
    }
  }

  function makePlotlyResponsive() {
    d3.select("#my_dataviz .js-plotly-plot .plotly .svg-container").attr("style", null);
    d3.selectAll("#my_dataviz .js-plotly-plot .plotly .main-svg")
      .attr("height", null)
      .attr("width", null)
      .attr("viewBox", `0 0 ${layout.width} ${layout.height}`);
  }

  function renderChart(traces = []) {
    Plotly.react($container, traces, layout, config).then(makePlotlyResponsive);
  }

  renderChart();
  // `on` is not part of the HTMLElement interface, but Plotly adds it
  // @ts-ignore
  $container.on("plotly_restyle", makePlotlyResponsive);
  // @ts-ignore
  $container.on("plotly_relayout", () => {
    ensureZero();
    makePlotlyResponsive();
  });

  window.addEventListener("resize", () => {
    const size = calculateChartSize();
    if (size.width !== layout.width || size.height !== layout.height) {
      Object.assign(layout, size);
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
    let mitigationId = getMitigationId();

    // update the name of the region in the text below the graph
    updateRegionInText(selected.region);

    // update the summary statistics per selected mitigation strength
    updateStatistics();

    let regionData = baseData.regions[selected.region];
    let measures = measureData[regionData.iso_alpha_3];

    updateCurrentGraph(regionData, measures);

    // Load and preprocess the per-region graph data
    loadGleamvizTraces(
      baseData.regions[selected.region],
      (traces, maxVal, xrange) => {
        layout.yaxis.range = [0, maxVal];
        ybounds = [0, maxVal];
        // AddCriticalCareTrace(mitigTraces[mitigationId]);
        // redraw the lines on the graph
        renderChart(traces.filter(trace => trace._mitigation == mitigationId));
        xbounds = xrange;
      }
    );
  }

  // function AddCriticalCareTrace(traces) {
  //   let line_title = "Hospital critical care capacity (approximate)";

  //   const lastTrace = traces[traces.length - 1];
  //   if (lastTrace && lastTrace.name === line_title) return;
  // }

  function updateRegionInText(region) {
    let countryName = regionDict[region].name;
    jQuery(".selected-region").html(countryName);
  }

  function setGetParamUrl(key, value) {
    let params = new URLSearchParams(window.location.search);
    params.set(key, value);
    let url =
      window.location.protocol +
      "//" +
      window.location.host +
      window.location.pathname +
      "?" +
      params.toString();

    return url;
  }

  function getRegionUrl(region) {
    return setGetParamUrl(SELECTION_PARAM, region);
  }

  let $regionList = document.getElementById("regionList");
  let $regionDropdownLabel = document.getElementById("regionDropdownLabel");
  let $regionFilter = document.getElementById(
    "regionFilter"
  ) as HTMLInputElement;
  let $regionDropdown = document.getElementById(
    "regionDropdown"
  ) as HTMLButtonElement;

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
  });

  jQuery($regionDropdown).on("shown.bs.dropdown", () => {
    if (filterQuery !== "") {
      filterQuery = "";
      reorderDropdown();
    }

    // and focus the filter field
    $regionFilter.focus();
  });

  // make the dropdown entry
  function addRegionDropdown(region_key, name) {
    const link = document.createElement("a");

    link.innerHTML = name;
    link.href = getRegionUrl(region_key);
    link.addEventListener("click", evt => {
      evt.preventDefault();

      // change the region
      changeRegion(region_key, true);
    });

    let item = { key: region_key, name, dropdownEntry: link };

    // add it to the dict and list
    regionDict[region_key] = item;
    regionList.push(item);
  }

  // the dropdown items are restorted depending on a search query
  function reorderDropdown() {
    // we score each region item with how good the region name matches the query
    regionList.forEach(region => {
      region.score = string_score(region.name, filterQuery);
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
      if (a.name > b.name) {
        return 1;
      }
      if (a.name < b.name) {
        return -1;
      }
      return 0;
    });

    let bestScore = regionList[0].score;
    for (let i = 0; i < regionList.length; i++) {
      let { score, dropdownEntry } = regionList[i];

      // re-add the entry, this sorts the dom elements
      $regionList.appendChild(dropdownEntry);

      // if we have good matches we only want to show those
      if (score < bestScore / 1000) {
        // correct the focus offset so it does not so something silly
        if (focusedRegionIdx >= i) {
          focusedRegionIdx = i - 1;
        }

        $regionList.removeChild(dropdownEntry);
        continue;
      }
    }
  }

  // update the look of the of the dropdown entries
  function restyleDropdownElements() {
    regionList.forEach(({ key, dropdownEntry }, index) => {
      let className = "dropdown-item";

      // TODO maybe differentiate visually between 'current' and 'focused'
      if (key === selected.region) {
        className += " active";
      }

      if (index === focusedRegionIdx) {
        className += " active";

        // TODO something like this:
        // dropdownEntry.scrollIntoView(false);
      }

      dropdownEntry.className = className;
    });
  }

  $regionFilter.addEventListener("keyup", () => {
    if (filterQuery === $regionFilter.value) {
      // dont do anything if the query didnt change
      return;
    }

    filterQuery = $regionFilter.value;
    if (filterQuery !== "") {
      // focus the first element in the list
      focusedRegionIdx = 0;
    }

    reorderDropdown();
    restyleDropdownElements();
  });

  // listen on regionFilter events
  $regionFilter.addEventListener("keydown", evt => {
    // on enter we select the currently highlighted entry
    if (evt.key === "Enter") {
      changeRegion(regionList[focusedRegionIdx].key, true);
      $($regionDropdown).dropdown("toggle");
    } else if (evt.key === "ArrowUp") {
      focusedRegionIdx = Math.max(focusedRegionIdx - 1, 0);

      restyleDropdownElements();
    } else if (evt.key === "ArrowDown") {
      focusedRegionIdx = Math.min(focusedRegionIdx + 1, regionList.length - 1);

      restyleDropdownElements();
    }
  });

  // populate the region dropdown label
  // FIXME: this is kind of a hack and only looks nonsilly because the label is allcapsed
  $regionDropdownLabel.innerHTML = selected.region;

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

    // set the main label
    $regionDropdownLabel.innerHTML = regionDict[selected.region].name;

    // update the graph
    restyleDropdownElements();
    updatePlot();
    updateInfectionTotals();
  }

  let sources = [
    `data-${selected.channel}-v3.json`,
    `data-${selected.channel}-containments.json`  
  ]

  // Load the basic data (estimates and graph URLs) for all generated countries
  Promise.all(sources.map(path =>
      d3.json(`https://storage.googleapis.com/static-covid/static/${path}`)
    )
  ).then(data => {
    [baseData, measureData] = data;

    // populate the dropdown menu with countries from received data
    let listOfRegions = Object.keys(baseData.regions);
    listOfRegions.forEach(key =>
      addRegionDropdown(key, baseData.regions[key].name)
    );

    reorderDropdown();
    restyleDropdownElements();

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
