import { REstimates } from "../models/rEstimates";
import * as Plotly from "plotly.js";

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
    y: rEstimates.meanR.map((mean, index) => mean - 2 * rEstimates.stdR[index]),
    showlegend: false,
    name: "Lower bound",
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
  } as Plotly.Data;

  return [aboveStdTrace, belowStdTrace, meanTrace];
};
