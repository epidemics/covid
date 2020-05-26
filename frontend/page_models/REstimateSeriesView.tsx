import * as React from "react";
import { Region } from "../models";
import { isTouchDevice } from "../helpers";
import { makeConfig, makeLayout } from "../components/graph-common";
import * as Plotly from "plotly.js";
import Plot from "react-plotly.js";
import { createTrace } from "./REstimateSeriesUtils";

const MAX_CHART_WIDTH_RATIO = 2;
const MAX_CHART_HEIGHT_RATIO = 1;
const MIN_CHART_SIZE = 500;

type ModelViewProps = {
  region: Region | null;
};

export function REstimateSeriesView(props: ModelViewProps) {
  let { region } = props;

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

  // create a plotly config for the plot
  let { config } = React.useMemo(
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

  // create a layout and customize
  let layout = makeLayout();

  layout.width = width;
  layout.height = height;

  layout.margin!.r = 20;
  layout.xaxis!.type = "date";
  layout.yaxis!.title = "R estimation";
  layout.yaxis!.type = "linear";
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

  let data: Array<Plotly.Data> = [];
  if (region) {
    data = createTrace(region?.rEstimates!);
  }

  return (
    <>
      <h5 className="mitigation-heading">
        Effective reproduction number estimate:
      </h5>
      <div>
        <div ref={rescale}>
          <Plot style={{}} data={data} layout={layout} config={config as any} />
        </div>
      </div>
    </>
  );
}
