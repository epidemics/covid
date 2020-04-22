import * as moment from "moment";
import * as d3 from "d3";
import * as Plotly from "plotly.js";
import { parseMeasures, MeasureItem } from "./measures";
import { makeConfig, Bounds, makeLayout } from "../components/graph-common";
import { isTouchDevice } from "../helpers";
import { Region, EstimationPoint } from "../models";

const GRAPH_HEIGHT = 600;

let bounds: Bounds = {
  y: [0, 0.099],
  x: ["2020-01-01", "2020-01-01"]
};

let layout = makeLayout(bounds);
let { config, hook } = makeConfig();

config.responsive = true;
layout.height = GRAPH_HEIGHT;

layout.xaxis!.type = "date";
layout.yaxis!.title = "Symptomatic patients";
layout.yaxis!.tickformat = ".1s";
layout.yaxis!.range = bounds.y;
layout.yaxis!.type = "log";
layout.yaxis!.domain = [0, 1];
layout.barmode = "overlay";
layout.yaxis2 = {
  domain: [0, 0],
  tickfont: {
    family: "DM Sans, sans-serif",
    size: 14,
    color: "white"
  },
  automargin: true // FIXME
};
layout.showlegend = true;
layout.legend = {
  x: 1,
  xanchor: "right",
  y: 0,
  yanchor: "bottom",
  bgcolor: "#22202888",
  font: {
    color: "#fff"
  }
};
layout.grid = { rows: 2, columns: 1, pattern: "independent" };
layout.hovermode = "closest";

if (isTouchDevice()) {
  config.scrollZoom = true;
  layout.dragmode = "pan";
}

function applyVariance(mean: number, vars: Array<number>, sigma: number) {
  let totalVar = 0;
  vars.forEach(v => {
    totalVar += v * v;
  });

  let val = mean * Math.exp(sigma * Math.sqrt(totalVar));
  return val;
}

const INCUBATION_PERIOD = 5;
const ONSET_TO_DEATH = 9;

type Mode = "percentage" | "absolute";

export function addEstimatedCases(
  region: Region,
  opts: { mode?: Mode; addCI?: boolean; smoothing?: number }
) {
  let smoothing = opts.smoothing ?? 1;
  let mode = opts.mode ?? "percentage";
  let addCI = opts.addCI ?? true;

  const estimationPoints = region.estimates?.points;
  if (!estimationPoints) return;

  let scaleFactor = 1;
  if (mode == "percentage") {
    scaleFactor = region.population;
  }
  let timeseries: TimeseriesCI = [];
  let max = 0;
  estimationPoints.forEach((point: EstimationPoint) => {
    let { date, mean, p05, p95 } = point;

    let low = p05 / scaleFactor;
    let high = p95 / scaleFactor;
    mean /= scaleFactor;

    max = Math.max(max, high);

    timeseries.push({ date, low, mean, high });
  });

  let { meanTrace, errorTrace } = makeErrorTrace(
    {
      color: "white",
      fillcolor: "rgba(255,255,255,0.2)",
      name: "Cumulative Infected (est.)",
      smoothing
    },
    timeseries
  );

  let traces = [meanTrace];
  if (addCI) traces.push(errorTrace);

  return { traces, estimated: timeseries, range: [1, max] };
}

export function addHistoricalCases(
  gd: Plotly.PlotlyHTMLElement,
  region: Region,
  opts: { mode: Mode; addCI?: boolean; cases?: boolean }
) {
  let showCI = opts.addCI ?? true;
  let showCases = opts.cases ?? true;
  let mode = opts.mode ?? "percentage";

  // this is the standard deviation (for plotting) in the log of cfr
  // for example with `log_cfr_var = 0.69` we get
  //    lower confidence bound `= cfr / exp(0.69) = cfr / 2`
  //    upper conficence bound `= cfr * exp(0.69) = 2 cfr`
  let log_cfr_var = 0.69; // exp(0.69) = 2

  const cfr = region.rates?.cfr;
  const timeseries = region.reported?.points;

  if (!timeseries || !cfr) return;

  let scaleFactor = 1;
  if (mode == "percentage") {
    scaleFactor = region.population;
  }

  let cv = 3;
  let retrodicted: TimeseriesCI = [];
  let reported: Array<{
    date: Date;
    confirmed: number;
    deaths: number;
  }> = [];
  let max = 0;
  timeseries.forEach((point: any) => {
    let { date, confirmed, deaths } = point;

    if (point.confirmed > 0) {
      reported.push({
        date,
        confirmed: confirmed / scaleFactor,
        deaths: deaths / scaleFactor
      });
      max = Math.max(max, point.confirmed);
    }

    if (deaths > 0) {
      let mean = deaths / cfr;
      let low = applyVariance(mean, [log_cfr_var, cv / Math.sqrt(deaths)], -1);
      let high = applyVariance(mean, [log_cfr_var, cv / Math.sqrt(deaths)], 1);

      max = Math.max(max, high);

      retrodicted.push({
        date: moment(date)
          .subtract(ONSET_TO_DEATH, "days")
          .toDate(),
        low: low / scaleFactor,
        mean: mean / scaleFactor,
        high: high / scaleFactor
      });
    }
  });

  let { errorTrace, meanTrace } = makeErrorTrace(
    {
      color: "white",
      fillcolor: "rgba(255,255,255,0.2)",
      name: "Cumulative Infected (est.)"
    },
    retrodicted
  );

  let reportedXs: Array<Date> = [];
  let reportedYs: Array<number> = [];
  let lastConfirmed = 0;
  reported.forEach(({ date, confirmed }) => {
    if (lastConfirmed !== confirmed) {
      reportedXs.push(date);
      reportedYs.push(confirmed);
      lastConfirmed = confirmed;
    }
  });

  let reportedConfirmed: Plotly.Data = {
    mode: "markers",
    x: reportedXs,
    y: reportedYs,
    line: { color: "#fff" },
    type: "scatter",
    name: "Confirmed",
    marker: { size: 3 },
    hovertemplate: "Confirmed: %{y:,d}<br />Date: %{x}"
  };

  let traces = [meanTrace];

  if (showCI) traces.push(errorTrace);

  if (showCases) traces.push(reportedConfirmed);

  // redraw the lines on the graph
  Plotly.addTraces(gd, traces);

  return { retrodicted, reported, range: [1, max] };
}

type TimeseriesCI = Array<{
  date: Date;
  low: number;
  mean: number;
  high: number;
}>;

function makeErrorTrace(
  opts: {
    color: string;
    fillcolor: string;
    name: string;
    smoothing?: number;
  },
  data: TimeseriesCI
): { [name: string]: Plotly.Data } {
  let { color, fillcolor, name } = opts;
  let smoothing = opts.smoothing ?? 0;

  let errorYs: Array<number> = [];
  let errorXs: Array<Date> = [];
  let meanYs: Array<number> = [];
  let meanXs: Array<Date> = [];

  data.forEach(({ date, high, mean }) => {
    errorYs.push(high);
    errorXs.push(date);

    meanYs.push(mean);
    meanXs.push(date);
  });

  for (let i = data.length - 1; i >= 0; i--) {
    let { date, low } = data[i];
    errorYs.push(low);
    errorXs.push(date);
  }

  // error bars
  let errorTrace: Plotly.Data = {
    y: errorYs,
    x: errorXs,
    mode: "lines",
    line: { color: "transparent" },
    fillcolor: fillcolor,
    fill: "tozerox",
    type: "scatter",
    showlegend: false,
    hoverinfo: "skip"
  };

  let shape: "spline" | "linear" = smoothing > 0 ? "spline" : "linear";

  let f = d3.format(".2s");
  // estimation
  let meanTrace: Plotly.Data = {
    mode: "lines",
    x: meanXs,
    y: meanYs,
    line: { color: color, shape, smoothing },
    type: "scatter",
    name: name,
    hoverinfo: "text",
    text: data.map(
      ({ date, low, high }) =>
        `${name}: ${f(low)}-${f(high)}<br />Date: ${date.toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "short",
            day: "numeric"
          }
        )}`
    )
  };

  return { meanTrace, errorTrace };
}

export class CurrentChart {
  mode: Mode;
  $container: Plotly.PlotlyHTMLElement;
  graphDomain: [number, number] = [0, 1];
  measureDomain: [number, number] = [0, 0];

  constructor($container: HTMLElement, mode: Mode = "absolute") {
    this.mode = mode;
    this.$container = $container as Plotly.PlotlyHTMLElement;
    Plotly.newPlot($container, [], layout, config).then(hook);

    this.initEvents();
  }

  update(region: Region, measureData: any) {
    Plotly.react(this.$container, [], layout, config);

    this.updateHistorical(region);

    // addCurrentTraces(function (traces) {
    //   // redraw the lines on the graph
    //   Plotly.addTraces($container, traces);
    //   //addCriticalCareTrace(currentGraph, d3.extent(traces[0].x));
    // })

    if (measureData) this.updateMeasures(measureData);
  }

  updateHistorical(region: Region) {
    let traces = addEstimatedCases(region, { mode: this.mode })?.traces;
    if (traces) Plotly.addTraces(this.$container, traces);

    let data = addHistoricalCases(this.$container, region, {
      mode: this.mode
    });

    if (!data) return;

    let { retrodicted, range: yrange } = data;

    // function mkDeltaTrace(name, other) {
    //   return {
    //     x: [],
    //     y: [],
    //     name: `Δ ${name}`,
    //     histfunc: "sum",
    //     marker: {
    //       color: "rgba(255, 100, 102, 0.7)",
    //       line: {
    //         color: "rgba(255, 100, 102, 1)",
    //         width: 1
    //       }
    //     },
    //     autobinx: false,
    //     xbins:{size: "D1"},
    //     hovertemplate: "+%{y}",
    //     opacity: 0.5,
    //     type: "histogram",
    //     ...other
    //   }
    // }

    // let predictedDeltas = mkDeltaTrace("Predicted");
    // for(let i = 1; i < retrodicted.length; i++){
    //   let delta = retrodicted[i].mean - retrodicted[i-1].mean;
    //   predictedDeltas.x.push(retrodicted[i].date);
    //   predictedDeltas.y.push(delta);
    // }

    // let confirmedDeltas = mkDeltaTrace("Confirmed");
    // let deathsDeltas = mkDeltaTrace("Deaths");
    // for(let i = 1; i < reported.length; i++){
    //   let {date, confirmed, deaths} = reported[i];

    //   confirmedDeltas.x.push(date);
    //   confirmedDeltas.y.push(confirmed - reported[i-1].confirmed);

    //   deathsDeltas.x.push(date);
    //   deathsDeltas.y.push(deaths - reported[i-1].deaths);
    // }

    // Plotly.addTraces(currentGraph, [predictedDeltas, deathsDeltas, confirmedDeltas]);

    let startDate = new Date("2020-03-01");
    if (retrodicted.length != 0) {
      startDate = retrodicted[0].date;
    }

    let endDate = moment().toDate();

    bounds.x = [startDate, endDate];
    bounds.y = yrange.map(n => Math.log(n) / Math.log(10)) as [number, number];

    Plotly.relayout(this.$container, {
      "xaxis.range": [bounds.x[0], bounds.x[1]],
      "yaxis.range": [bounds.y[0], bounds.y[1]]
    });
  }

  initEvents() {
    this.$container.on("plotly_unhover", () => {
      Plotly.relayout(this.$container, {
        shapes: []
      });
    });

    this.$container.on("plotly_hover", evt => {
      let hit = evt.points[0] as { customdata?: MeasureItem } | undefined;
      let measure = hit?.customdata;
      let measureShapes: Array<Partial<Plotly.Shape>> = [];

      if (!measure || !measure.start || !measure.end) return;

      let { start, end } = measure;
      measureShapes.push({
        type: "line",
        yref: "paper",
        x0: moment(start).valueOf(),
        y0: 0,
        x1: moment(start).valueOf(),
        y1: 1,
        line: { color: "white" },
        opacity: 0.5
      });

      measureShapes.push({
        type: "rect",
        yref: "paper",
        x0: moment(start)
          .add(INCUBATION_PERIOD, "days")
          .toDate(),
        y0: this.graphDomain[0],
        x1: moment(end)
          .add(INCUBATION_PERIOD, "days")
          .toDate(),
        y1: this.graphDomain[1],
        fillcolor: "white",
        line: { color: "transparent" },
        opacity: 0.1
      });

      Plotly.relayout(this.$container, {
        shapes: measureShapes
      });
    });
  }

  updateMeasures(measureData: any) {
    let measures = parseMeasures(measureData);

    let measureTrace = {
      base: [] as Array<number>,
      x: [] as Array<number>,
      y: [] as Array<string>,
      hoverinfo: "text",
      textposition: "inside",
      text: [] as Array<string>,
      yaxis: "y2",
      showlegend: false,
      type: "bar",
      orientation: "h",
      marker: { color: [] } as Partial<Plotly.ScatterMarker>,
      customdata: [] as Array<any>
    };

    measures.periods.forEach(info => {
      let { measure, color, label, start, replaced } = info;

      let x0 = moment(start).valueOf();
      let x1 = moment(replaced)
        .add({ days: 1 })
        .valueOf(); // add a day to prevent non overlap

      measureTrace.base.push(x1);
      measureTrace.x.push(x0 - x1);
      measureTrace.text.push(label);
      measureTrace.customdata.push(info);
      measureTrace.y.push(measure);
      (measureTrace.marker.color as string[]).push(color.css());
    });

    // let measuresTraces = []
    // measures.forEach(({start, type}) => {
    //   start = moment(start);
    //   let end = moment(start).add(10,"days");

    //   //measuresTraces.push();

    //   measuresTraces.push({
    //     base: start.valueOf(),
    //     x: end.valueOf()-start.valueOf(),
    //     y: type,
    //     yaxis: "y2",
    //     type: 'bar',
    //     orientation: 'h',
    //     marker: {color: "rgba(255,255,255,0.3)"},
    //     hoverinfo: "y"
    //   });
    // })

    this.resize(measures.count);

    Plotly.addTraces(this.$container, measureTrace as Plotly.Data);
  }

  resize(measureCount: number) {
    let height = GRAPH_HEIGHT;
    if (measureCount === 0) {
      this.measureDomain = [0, 0];
      this.graphDomain = [0, 1];
    } else {
      this.measureDomain = [0, 0.05 * measureCount];
      this.graphDomain = [0.05 * measureCount + 0.1, 1];
      height /= 1 - 0.05 * measureCount - 0.1;
    }

    Plotly.relayout(this.$container, {
      "legend.y": this.graphDomain[0],
      "yaxis.domain": this.graphDomain,
      "yaxis2.domain": this.measureDomain,
      height
    });
  }
}
