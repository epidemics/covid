import * as Plotly from "plotly.js";
import * as React from "react";
import Plot from "react-plotly.js";

import { makeConfig, makeLayout } from "../components/graph-common";
import { isTouchDevice } from "../helpers";
import { Region } from "../models";
import { createActiveCasesBars, createTrace } from "./REstimateSeriesUtils";

type ModelViewProps = {
  region: Region | null;
};

export function REstimateSeriesView(props: ModelViewProps) {
  let { region } = props;

  // create a plotly config for the plot
  let { config } = React.useMemo(
    () =>
      makeConfig(() => {
        if (!region) {
          return {
            name: "plot",
            title: "COVID-19 Forecast",
            responsive: true,
          };
        } else {
          return {
            name: region.name,
            title: `COVID-19 Forecast for ${region.name}`,
            responsive: true,
          };
        }
      }),
    []
  );

  // create a layout and customize
  let layout = makeLayout();
  layout.autosize = true;
  layout.margin!.r = 60;
  layout.margin!.l = 60;
  layout.xaxis!.type = "date";
  layout.xaxis!.tickformat = "%B %d";
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

  layout.yaxis2 = {
    title: "Daily new cases",
    titlefont: { color: "#fff" },
    tickfont: { color: "#fff" },
    overlaying: "y",
    side: "right",
    rangemode: "nonnegative",
    tickformat: "n",
  };

  if (isTouchDevice()) {
    config.scrollZoom = true;
    layout.dragmode = "pan";
  }

  let data: Array<Plotly.Data> = [];
  if (region && region.rEstimates && region.reported) {
    if (region.rEstimates.date.length > 0) {
      layout.xaxis!.range = [
        region.rEstimates.date[0],
        region.rEstimates.date[region.rEstimates.date.length - 1],
      ];
    }

    data = [
      ...createTrace(region.rEstimates),
      createActiveCasesBars(region.reported),
    ];
  }

  const currentRValue =
    region && region.rEstimates
      ? region.rEstimates.meanR[region.rEstimates.meanR.length - 1]
      : undefined;

  return (
    <>
      <h5 className="mitigation-heading">
        Current effective reproduction number estimate:{" "}
        {currentRValue && currentRValue.toFixed(2)}
      </h5>

      <div>
        <div id="r_estimate_dataviz">
          <Plot
            style={{ width: "100%", height: "100%" }}
            data={data}
            layout={layout}
            config={config as any}
            useResizeHandler={true}
          />
        </div>
      </div>
    </>
  );
}
