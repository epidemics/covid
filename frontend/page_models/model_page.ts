import * as d3 from "d3";
import * as Plotly from "plotly.js";
import { isTouchDevice } from "../helpers";
import { makeConfig, Bounds, ChartInfo } from "../components/graph-common";
import { Region, Scenario } from "../models";
import { ModelTraces } from "../models/model_traces";
import { addEstimatedCases } from "../page_measures/current-chart";

const MAX_CHART_WIDTH_RATIO = 2;
const MAX_CHART_HEIGHT_RATIO = 1;
const MIN_CHART_SIZE = 500;

let bounds: Bounds = {
  y: [0, 0.099],
  x: ["2020-01-01", "2021-01-01"] as [string, string]
};

type Options = { mitigation: string; region: Region };

export class ModelPage {
  $container: Plotly.PlotlyHTMLElement;

  region: Region;
  mitigation: string = "none"; // TODO strong type this

  chartInfo: ChartInfo;
  showEstimates: boolean = false;

  constructor($container_: HTMLElement, { mitigation, region }: Options) {
    this.mitigation = mitigation;
    this.region = region;
    this.$container = $container_ as Plotly.PlotlyHTMLElement;
    let $container = this.$container;

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

    this.chartInfo = makeConfig(bounds, screenshotInfo);
    let { config, layout, hook } = this.chartInfo;

    let size = this.calculateChartSize();
    layout.width = size.width;
    layout.height = size.height;

    layout.margin!.r = 20;
    layout.xaxis!.type = "date";
    layout.yaxis!.title = "Active infections (% of population)";
    layout.yaxis!.tickformat = ".1%";
    layout.yaxis!.range = [...bounds.y];
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

    this.update(true);
  }

  getMitigationId() {
    let mitigationIds: { [key: string]: string } = {
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
    this.update(true);
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

  // update the graph
  async update(resetAxis: boolean = false) {
    Plotly.react(this.$container, [], this.chartInfo.layout);

    if (this.showEstimates) {
      addEstimatedCases(this.$container, this.region, {
        mode: "percentage",
        addCI: false
      });
    }

    let mitigationId = this.getMitigationId();

    // update the name of the region in the text below the graph
    this.updateRegionInText();

    // update the summary statistics per selected mitigation strength
    this.updateStatistics();

    this.region.customModelDescription.then(modelDescription => {
      if (modelDescription) {
        $(".custom-model-explanation")
          .html(modelDescription)
          .show();

        $(".model-explanation").hide();
      } else {
        $(".model-explanation").show();
        $(".custom-model-explanation").hide();
      }
    });

    this.region.customMitigations.then(raw => {
      const defaultScenarios: Array<Scenario> = [
        { id: "none", name: "0%" },
        { id: "weak", name: "20%" },
        { id: "moderate", name: "50%" },
        { id: "strong", name: "80%" }
      ];
      const scenarios = raw ?? defaultScenarios;

      $(".mitigation-strength-button").hide();

      scenarios.forEach(scenario => {
        // let $scenario =
        $(`#mitigation-${scenario.id}`).show();

        // TODO name and description
        // if (scenario.description) {
        //   $scenario
        //     .find(".mitigation-strength-explanation")
        //     .html(scenario.description);
        // }
      });
    });

    // Load and preprocess the per-region graph data
    this.region.modelTraces.then(({ maxY, traces, xrange }: ModelTraces) => {
      maxY *= 1.01;

      let start = this.showEstimates ? new Date("2020-02-01") : xrange[0];

      if (resetAxis) {
        Plotly.relayout(this.$container, {
          "yaxis.range": [0, maxY],
          "xaxis.range": [start, xrange[1]]
        });

        bounds.y = [0, maxY];
        bounds.x = [xrange[0], xrange[1]];
      }
      // AddCriticalCareTrace(mitigTraces[mitigationId]);
      // redraw the lines on the graph
      Plotly.addTraces(
        this.$container,
        traces.filter(trace => trace?.mitigation == mitigationId)
      );
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
