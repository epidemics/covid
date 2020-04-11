import * as d3 from "d3";
import * as Plotly from "plotly.js";
import { saveImage } from "../components/custom-plotly-image-saver";
import { RegionDropdown } from "../components/region-dropdown";
import { setGetParamUrl, isTouchDevice } from "../helpers";
import { makeConfig } from "../components/graph-common";
import { Region } from "../models";
import { ModelTraces } from "../models/model_traces";

const GLEAMVIZ_TRACE_SCALE = 1000; // it gives infections per 1000

const SELECTION_PARAM = "selection";
const MITIGATION_PARAM = "mitigation";
const REGION_FALLBACK = "united kingdom";

const MAX_CHART_WIDTH_RATIO = 2;
const MAX_CHART_HEIGHT_RATIO = 1;
const MIN_CHART_SIZE = 500;

let bounds = {
  y: [0, 0.099],
  x: ["2020-01-01", "2021-01-01"]
};

type Options = { mitigation: string; region: Region };

export class ModelPage {
  $container: HTMLElement;

  region: Region & { modelTraces?: ModelTraces };
  mitigation: string = "none"; // TODO strong type this

  chartInfo: any;

  constructor($container: HTMLElement, { mitigation, region }: Options) {
    this.$container = $container;
    this.mitigation = mitigation;
    this.region = region;

    this.initChart();

    this.update();
  }

  getMitigationId() {
    let mitigationIds = {
      none: "None",
      weak: "Low",
      moderate: "Medium",
      strong: "High"
    };

    return mitigationIds[this.mitigation];
  }

  setMitigation(value: string) {
    this.mitigation = value;
    this.update();
  }

  setRegion(region: Region) {
    this.region = region;
    this.update();
  }

  updateStatistics() {
    // const { population, stats } = this.region;
    // if(!estimates)
    //   return;
    // let mitigation = this.getMitigationId();
    // const stats = estimates.last;
    // let total_infected = formatStatisticsLine(
    //   stats.p05,
    //   stats.p95,
    //   population
    // );
    // $("#total-infected").html(total_infected);
    // TODO
    // let peak_infected = formatStatisticsLine(
    //   stats.MaxActiveInfected_per1000_q05,
    //   stats.MaxActiveInfected_per1000_q95,
    //   population
    // );
    // $("#sim-infected").html(peak_infected);
  }

  initChart() {
    let screenshotInfo = () => {
      let region = this.region;
      if (!region) {
        return {
          name: "plot",
          title: "COVID-19 Forecast"
        };
      } else {
        return {
          name: region.name,
          title: `COVID-19 Forecast for ${region.name}`
        };
      }
    };

    let $container = this.$container;

    this.chartInfo = makeConfig(bounds, screenshotInfo);
    let { config, layout, hook } = this.chartInfo;

    let size = this.calculateChartSize();
    layout.width = size.width;
    layout.height = size.height;

    layout.margin.r = 20;
    layout.xaxis.type = "date";
    layout.yaxis.title = "Active infections (% of population)";
    layout.yaxis.tickformat = ".1%";
    layout.yaxis.range = [...bounds.y];
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

    if (isTouchDevice()) {
      config.scrollZoom = true;
      layout.dragmode = "pan";
    }

    let makePlotlyResponsive = () => {
      let { layout } = this.chartInfo;

      d3.select("#my_dataviz.js-plotly-plot .plotly .svg-container").attr(
        "style",
        null
      );
      d3.selectAll("#my_dataviz.js-plotly-plot .plotly .main-svg")
        .attr("height", null)
        .attr("width", null)
        .attr("viewBox", `0 0 ${layout.width} ${layout.height}`);
    };

    Plotly.newPlot($container, [], layout, config).then(gd => {
      makePlotlyResponsive();
      gd.on("plotly_restyle", makePlotlyResponsive);
      gd.on("plotly_relayout", makePlotlyResponsive);
      hook(gd);
    });

    window.addEventListener("resize", () => {
      const size = this.calculateChartSize();
      if (size.width !== layout.width || size.height !== layout.height) {
        Object.assign(layout, size);
        Plotly.relayout($container, size);
      }
    });
  }

  calculateChartSize() {
    const idealWidth = this.$container.clientWidth;
    const idealHeight = window.innerHeight * 0.7;
    const maxWidth = idealHeight * MAX_CHART_WIDTH_RATIO;
    const maxHeight = idealWidth * MAX_CHART_HEIGHT_RATIO;
    return {
      width: Math.max(Math.min(idealWidth, maxWidth), MIN_CHART_SIZE),
      height: Math.max(Math.min(idealHeight, maxHeight), MIN_CHART_SIZE)
    };
  }

  // Checks if the max and traces have been loaded and preprocessed for the given region;
  // if not, loads them and does preprocessing; then caches it in the region object.
  // Finally calls thenTracesMax(mitigationTraces, max_Y_val).
  loadGleamvizTraces(): Promise<ModelTraces> {
    let modelTraces = this.region.modelTraces;
    if (modelTraces) {
      return Promise.resolve(modelTraces);
    }

    // Not cached, load and preprocess
    let tracesUrl = this.region.dataUrl;

    return d3
      .json(`https://storage.googleapis.com/static-covid/static/${tracesUrl}`)
      .then(data => {
        // TODO error handling

        let modelTraces = ModelTraces.fromv4(data.models);
        this.region.modelTraces = modelTraces; // cache model traces

        return modelTraces;
      });
  }

  // update the graph
  update() {
    Plotly.react(this.$container, [], this.chartInfo.layout);

    let mitigationId = this.getMitigationId();

    // update the name of the region in the text below the graph
    this.updateRegionInText();

    // update the summary statistics per selected mitigation strength
    this.updateStatistics();

    let { layout } = this.chartInfo;

    // Load and preprocess the per-region graph data
    this.loadGleamvizTraces().then(({ maxY, traces, xrange }: ModelTraces) => {
      maxY *= 1.01;

      layout.yaxis.range = [0, maxY];
      bounds.y = [0, maxY];
      // AddCriticalCareTrace(mitigTraces[mitigationId]);
      // redraw the lines on the graph

      console.log(traces);

      Plotly.addTraces(
        this.$container,
        traces.filter(
          trace => trace.customdata?.mitigation == mitigationId
        ) as any
      );
      bounds.x = [...xrange];
    });
  }

  // function AddCriticalCareTrace(traces) {
  //   let line_title = "Hospital critical care capacity (approximate)";

  //   const lastTrace = traces[traces.length - 1];
  //   if (lastTrace && lastTrace.name === line_title) return;
  // }

  updateRegionInText() {
    let countryName = this.region.name;
    jQuery(".selected-region").html(countryName);
  }
}
