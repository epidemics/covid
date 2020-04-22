import * as React from "react";
import { Scenario, Region, Scenarios, Stat } from "../models";
import { formatStatisticsLine, classNames, isTouchDevice } from "../helpers";
import { PageActions } from "./Page";
import { makeConfig, makeLayout } from "../components/graph-common";
import * as Plotly from "plotly.js";
import Plot from "react-plotly.js";
import { LocationContext } from "../components/LocationContext";

const MAX_CHART_WIDTH_RATIO = 2;
const MAX_CHART_HEIGHT_RATIO = 1;
const MIN_CHART_SIZE = 500;

type ModelViewProps = {
  region: Region | null;
  scenario: Scenario | null;
  scenarios: Scenarios | null;
  dispatch: React.Dispatch<PageActions>;
  showEstimates?: boolean;
};

export function ModelView(props: ModelViewProps) {
  let { scenario, region, scenarios } = props;
  // const showEstimates = props.showEstimates ?? false;

  let location = React.useContext(LocationContext);

  const scenarioPicker = (
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
                  url: location({ scenarioID: scenario.group }),
                })
              }
            />
          ))
        : null}
    </div>
  );

  let layout = makeLayout(scenarios?.bounds);

  let { config, hook } = makeConfig(scenarios?.bounds, () => {
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
  });

  let [{ width, height, node }, setDimensions] = React.useState<{
    node?: HTMLElement;
    width?: number;
    height?: number;
  }>({});

  function rescale(node: HTMLElement | null) {
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
  }

  let makeResponsive = () => {
    if (!node) return;

    (node.querySelector(".svg-container") as HTMLElement).removeAttribute(
      "style"
    );

    let mainSvg = node.querySelector(".main-svg") as SVGSVGElement;
    mainSvg.removeAttribute("width");
    mainSvg.removeAttribute("height");
    mainSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  };

  // listen for
  let containerRef = React.useCallback(rescale, []);

  // also attach a listener for window resize
  React.useEffect(() => {
    let resizeHandler = () => {
      if (node) rescale(node);
    };
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, [node]);

  layout.width = width;
  layout.height = height;

  layout.margin!.r = 20;
  layout.xaxis!.type = "date";
  layout.yaxis!.title = "Active infections (% of population)";
  layout.yaxis!.tickformat = ".1%";
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

  return (
    <>
      <h5 className="mitigation-strength-heading">
        Explore global and national mitigation strength:
        <a href="#mitigation-measures-explanation">
          <span className="question-tooltip">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="18"
              viewBox="0 0 24 24"
              width="18"
            >
              <path d="M0 0h24v24H0z" fill="none" />
              <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z" />
            </svg>
          </span>
        </a>
      </h5>

      <div className="mitigation-strength" id="mitigation">
        {scenarioPicker}

        <div className="graph-column">
          <div id="my_dataviz" ref={containerRef}>
            <Plot
              data={scenario?.traces ?? []}
              layout={layout}
              config={config as any}
              onUpdate={(_: any, gd: Plotly.PlotlyHTMLElement) =>
                makeResponsive()
              }
              onInitialized={(_: any, gd: Plotly.PlotlyHTMLElement) => {
                hook(gd);
              }}
              onRelayout={() => makeResponsive()}
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
