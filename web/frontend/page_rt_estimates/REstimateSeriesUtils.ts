import * as Plotly from "plotly.js";

import { Reported } from "../models";
import { REstimates } from "../models/rEstimates";

export const createTrace = (rEstimates: REstimates) => {
  const aboveStdTrace = {
    type: "scatter",
    fillcolor: "rgba(239,108,0,0.3)",
    line: {
      shape: "spline",
      smoothing: 0,
      color: "transparent",
    },
    x: rEstimates.date,
    y: rEstimates.meanR.map((mean, index) => mean + 2 * rEstimates.stdR[index]),
    showlegend: false,
    name: "Upper bound",
    hoverinfo: "none",
  } as Plotly.Data;

  const belowStdTrace = {
    type: "scatter",
    fill: "tonexty",
    fillcolor: "rgba(239,108,0,0.3)",
    line: {
      shape: "spline",
      smoothing: 0,
      color: "transparent",
    },
    x: rEstimates.date,
    y: rEstimates.meanR.map((mean, index) =>
      Math.max(mean - 2 * rEstimates.stdR[index], 0)
    ),
    showlegend: false,
    name: "Lower bound",
    hoverinfo: "none",
  } as Plotly.Data;

  const meanTrace = {
    type: "scatter",
    line: {
      shape: "spline",
      smoothing: 0,
      color: "#fff",
    },
    x: rEstimates.date,
    y: rEstimates.meanR,
    name: "Estimated R",
    hoverinfo: "y+text",
    hovertext: "Estimated R",
  } as Plotly.Data;

  return [aboveStdTrace, belowStdTrace, meanTrace];
};

export const createActiveCasesBars = (reported: Reported) => {
  return {
    x: reported.points.map((singleReported) => new Date(singleReported.date)),
    y: reported.points.map((singleReported, index) => {
      if (index >= 1) {
        return (
          reported.points[index].confirmed -
          reported.points[index - 1].confirmed
        );
      }

      return reported.points[index].confirmed;
    }),
    type: "bar",
    yaxis: "y2",
    marker: { color: "rgba(239,108,0,0.2)" },
    name: "Daily new cases",
    hoverlabel: {
      namelength: 30,
      font: {
        color: "#fff",
      },
    },
    hoverinfo: "x+y+text",
    hovertext: "Daily new cases",
  } as Plotly.Data;
};
