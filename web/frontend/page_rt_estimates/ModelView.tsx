import * as Plotly from "plotly.js";
import * as React from "react";
import Plot from "react-plotly.js";

import { Bounds, makeConfig, makeLayout } from "../components/graph-common";
import { LocationContext } from "../components/LocationContext";
import { QuestionTooltip } from "../components/QuestionTooltip";
import {
  classNames,
  formatAbsoluteInteger,
  formatDate,
  formatSIInteger,
  formatStatisticsLine,
  isTouchDevice,
} from "../helpers";
import { MainInfo, Region, Scenario, Scenarios, Stat } from "../models";
import { addEstimatedCases } from "../page_measures/current-chart";
import { PageActions } from "./RtEstimatesPage";

const MAX_CHART_WIDTH_RATIO = 2;
const MAX_CHART_HEIGHT_RATIO = 1;
const MIN_CHART_SIZE = 500;

type PlotKind = "cumulative" | "active";

const plotKinds: { cumulative: string; active: string } = {
  active: "Actively-spreading",
  cumulative: "Total",
};

type ModelViewProps = {
  region: Region | null;
  scenario: Scenario | null;
  scenarios: Scenarios | null;
  dispatch: React.Dispatch<PageActions>;
  showEstimates?: boolean;
  showHealthcareCapacity?: boolean;
  mainInfo: MainInfo;
};

let initialBounds: Bounds = {
  y: [0, 0.099],
  x: ["2020-01-01", "2021-01-01"] as [string, string],
};

export function ModelView(props: ModelViewProps) {
  let { scenario, region, scenarios, mainInfo } = props;
  const showEstimates = props.showEstimates ?? false;
  const showHealthcareCapacity = props.showHealthcareCapacity ?? false;

  const [plotKind, setPlotKind] = React.useState<PlotKind>("active");

  let location = React.useContext(LocationContext);

  let [{ width, height, node }, setDimensions] = React.useState<{
    node?: HTMLElement;
    width?: number;
    height?: number;
  }>({});

  // the rescale callback, will be used as an callback ref
  const rescale = React.useCallback((node: HTMLElement | null) => {
    if (!node) {
      setDimensions({ width, height });
      return;
    }
    const idealWidth = node.clientWidth;
    const idealHeight = window.innerHeight * 0.7;
    const maxWidth = idealHeight * MAX_CHART_WIDTH_RATIO;
    const maxHeight = idealWidth * MAX_CHART_HEIGHT_RATIO;
    setDimensions({
      node,
      width: Math.max(Math.min(idealWidth, maxWidth), MIN_CHART_SIZE),
      height: Math.max(Math.min(idealHeight, maxHeight), MIN_CHART_SIZE),
    });
  }, []);

  // call rescale on window resize
  React.useEffect(() => {
    let resizeHandler = () => {
      if (node) rescale(node);
    };
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, [node]);

  // store a reference to the plotlyHtmlElement, needed below
  let [plotlyHtmlElement, setPlotlyHtmlElement] = React.useState<
    Plotly.PlotlyHTMLElement
  >();

  // pick the bounds depending on the type of plot
  let bounds: Bounds | undefined;
  if (plotKind == "cumulative") {
    bounds = scenarios?.boundsCumulative;
  } else if (plotKind == "active") {
    bounds = scenarios?.boundsActive;
  }

  // attach the bounds to the plotly HTML element, this is then used
  // by the reset axis button.
  React.useEffect(() => {
    if (plotlyHtmlElement) {
      // @ts-ignore
      plotlyHtmlElement.bounds = bounds;
    }
  }, [plotlyHtmlElement, bounds]);

  // create a plotly config for the plot
  let { config, hook } = React.useMemo(
    () =>
      makeConfig(() => {
        if (!region) {
          return {
            name: "plot",
            title: "COVID-19 Forecast",
          };
        } else {
          return {
            name: region.name,
            title: `COVID-19 Forecast for ${region.name}`,
          };
        }
      }),
    []
  );

  let makeResponsive = () => {
    if (!node) return;

    (node.querySelector(
      "#my_dataviz .svg-container"
    ) as HTMLElement).removeAttribute("style");

    let mainSvg = node.querySelector("#my_dataviz .main-svg") as SVGSVGElement;
    mainSvg.removeAttribute("width");
    mainSvg.removeAttribute("height");
    mainSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  };

  // create a layout and customize
  let layout = makeLayout(bounds ?? initialBounds);

  layout.width = width;
  layout.height = height;

  layout.margin!.r = 20;
  layout.xaxis!.type = "date";
  layout.yaxis!.title = `${plotKinds[plotKind]} infections (% of population)`;
  layout.yaxis!.tickformatstops = [
    { enabled: true, dtickrange: [null, 0.001], value: ".2p" },
    { enabled: true, dtickrange: [0.001, 0.01], value: ".1%" },
    { enabled: true, dtickrange: [0.01, null], value: ".0%" },
  ];
  layout.showlegend = true;
  layout.legend = {
    x: 1,
    xanchor: "right",
    y: 1,
    yanchor: "top",
    bgcolor: "#22202888",
    font: {
      color: "#fff",
    },
  };

  if (isTouchDevice()) {
    config.scrollZoom = true;
    layout.dragmode = "pan";
  }

  let data: Array<Plotly.Data>;
  if (!scenario) {
    data = [];
  } else if (plotKind === "active") {
    data = scenario.tracesActive.slice();
  } else if (plotKind == "cumulative") {
    data = scenario.tracesCumulative.slice();
  } else {
    throw new Error("Unreachable");
  }

  if (showEstimates && region) {
    let out = addEstimatedCases(region, {
      mode: "percentage",
      addCI: false,
    });

    if (out) {
      data.push(...out.traces);
    }
  }

  if (showHealthcareCapacity) {
    // TODO
    // let line_title = "Hospital critical care capacity (approximate)";
    // const lastTrace = traces[traces.length - 1];
    // if (lastTrace && lastTrace.name === line_title) return;
  }

  const plotKindPicker = (
    <div
      className="plot-kind btn-group btn-group-sm"
      role="group"
      aria-label="Plot kind"
    >
      {Object.keys(plotKinds).map((kind: PlotKind) => (
        <button
          type="button"
          key={kind}
          onClick={() => setPlotKind(kind)}
          className={classNames("btn btn-secondary", {
            active: plotKind === kind,
          })}
          style={{ fontSize: "12px" }}
        >
          {plotKinds[kind]}
        </button>
      ))}
    </div>
  );

  const formatCurrentInfected = formatSIInteger(3);

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h5 className="mitigation-heading">
          Explore global and national mitigation strength:
          <a
            href="#mitigation-measures-explanation"
            aria-label="Explanation about mitigation strength"
          >
            <QuestionTooltip />
          </a>
        </h5>

        {plotKindPicker}
      </div>
      <div className="top-row">
        <div className="active-infections-block">
          {region?.current ? (
            <>
              <span className="number-subheader" id="infections-date">
                <span style={{ color: "#aaa" }}>Model last updated on:</span>{" "}
                {region?.current?.date ?? mainInfo.generated ? (
                  formatDate(region?.current?.date ?? mainInfo.generated)
                ) : (
                  <>&mdash;</>
                )}
              </span>
              <div className="active-infections">
                Active Infections:{" "}
                <span
                  className="infections-estimated"
                  id="infections-estimated"
                >
                  {region.current.infected ? (
                    formatCurrentInfected(region.current.infected)
                  ) : (
                    <>&mdash;</>
                  )}
                </span>
                <a
                  href="#case-count-explanation"
                  aria-label="Explanation about the case count"
                >
                  <QuestionTooltip />
                </a>
              </div>
            </>
          ) : (
            ""
          )}
          <div className="infections-confirmed">
            <span style={{ color: "#aaa" }}>Confirmed Infections:</span>{" "}
            <span id="infections-confirmed">
              {formatAbsoluteInteger(region?.reported?.last?.confirmed)}
            </span>
          </div>
        </div>

        <div className="population-block">
          <div className="number-subheader">Population</div>
          <div className="infections-population">
            <span id="infections-population">
              {formatAbsoluteInteger(region?.population)}
            </span>
          </div>
        </div>
      </div>

      <div className="mitigation-strength" id="mitigation">
        <div className="mitigation-strength-buttons">
          {scenarios
            ? scenarios.map((scenario: Scenario) => (
                <ScenarioButton
                  key={scenario.group}
                  scenario={scenario}
                  selected={scenario == props.scenario}
                  onSelect={(scenario) =>
                    props.dispatch({
                      action: "switch_scenario",
                      scenario,
                      url: location({ scenario: scenario.group }),
                    })
                  }
                />
              ))
            : null}
        </div>

        <div className="graph-column">
          <div id="my_dataviz" ref={rescale}>
            <Plot
              style={{}}
              data={data}
              layout={layout}
              config={config as any}
              onUpdate={(_: any, gd: Plotly.PlotlyHTMLElement) =>
                makeResponsive()
              }
              onInitialized={(_: any, gd: Plotly.PlotlyHTMLElement) => {
                setPlotlyHtmlElement(gd);
                hook(gd);
              }}
            />
          </div>
          <div className="projections-row">
            <div className="total-infected">
              <span className="number-subheader">Total Infected by 2021</span>
              <span className="total-infected-number">
                {showStatistics(
                  scenario?.statistics?.totalInfected,
                  region?.population
                )}
              </span>
            </div>
            <div className="sim-infected">
              <span className="number-subheader sim-infected-subheader">
                Peak Active Infections
              </span>
              <span className="sim-infected-number">
                {showStatistics(
                  scenario?.statistics?.maxActiveInfected,
                  region?.population
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function showStatistics(stat?: Stat, population?: number) {
  if (!stat || !population) return <>&mdash;</>;

  return formatStatisticsLine(stat.q05, stat.q95, population);
}

type ScenarioButtonProps = {
  scenario: Scenario;
  selected: boolean;
  onSelect: (scenario: Scenario) => void;
};

function ScenarioButton({ scenario, selected, onSelect }: ScenarioButtonProps) {
  return (
    <div
      className="mitigation-strength-button"
      id={`mitigation-${scenario.group}`}
    >
      <label
        className={classNames({
          btn: true,
          "btn-secondary": true,
          active: selected,
        })}
      >
        <input
          type="radio"
          name="mitigation"
          onChange={() => onSelect(scenario)}
        />
        {scenario.name ?? `Scenario ${scenario.group}`}
        <div className="mitigation-strength-explanation">
          {scenario.description ?? ""}
        </div>
      </label>
    </div>
  );
}
