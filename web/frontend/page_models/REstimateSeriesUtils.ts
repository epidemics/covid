import * as Plotly from 'plotly.js';

import { Reported } from '../models';
import { REstimates } from '../models/rEstimates';

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
    y: rEstimates.meanR.map((mean, index) =>
      Math.max(mean - 2 * rEstimates.stdR[index], 0)
    ),
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
    marker: { color: "rgba(239,108,0,0.1)" },
    name: "Current cases",
  } as Plotly.Data;
};
