import * as Plotly from "plotly.js";

import { Reported } from "../models";
import { REstimates } from "../models/rEstimates";

export const createTrace = (rEstimates: REstimates) => {
  const meanR = rEstimates.enoughData.map((value, index) => {
    if (value === 0) {
      return undefined;
    }

    return rEstimates.meanR[index];
  });

  const predictedMeanR = rEstimates.enoughData.map((value, index) => {
    if (value === 1 && index > 0 && rEstimates.enoughData[index - 1] === 0) {
      return rEstimates.meanR[index];
    }

    if (
      value === 1 &&
      index + 1 < rEstimates.enoughData.length &&
      rEstimates.enoughData[index + 1] === 0
    ) {
      return rEstimates.meanR[index];
    }

    if (value === 1) {
      return undefined;
    }

    return rEstimates.meanR[index];
  });

  let rArrays: number[][] = [];
  let dateArrays: any[][] = [];
  let currentArray: number[] = [];
  let currentDateArray: any[] = [];

  rEstimates.enoughData.map((value, index) => {
    if (value) {
      currentArray.push(rEstimates.meanR[index]);
      currentDateArray.push(rEstimates.date[index]);
    } else {
      if (currentArray.length > 0) {
        rArrays.push([...currentArray]);
        dateArrays.push([...currentDateArray]);
        currentArray = [];
        currentDateArray = [];
      }
    }
  });

  if (currentArray.length > 0) {
    rArrays.push([...currentArray]);
    dateArrays.push([...currentDateArray]);
    currentArray = [];
    currentDateArray = [];
  }

  const aboveStdTraces = rArrays.map(
    (rArray, index) =>
      ({
        fillcolor: "rgba(239,108,0,0.3)",
        line: {
          shape: "spline",
          smoothing: 0,
          color: "transparent",
        },
        x: dateArrays[index],
        y: rArray.map((mean, index) =>
          mean ? mean + 2 * rEstimates.stdR[index] : undefined
        ),
        showlegend: false,
        name: "Upper bound",
        hoverinfo: "none",
      } as Plotly.Data)
  );

  const belowStdTraces = rArrays.map(
    (rArray, index) =>
      ({
        type: "scatter",
        fill: "tonexty",
        fillcolor: "rgba(239,108,0,0.3)",
        line: {
          shape: "spline",
          smoothing: 0,
          color: "transparent",
        },
        x: dateArrays[index],
        y: rArray.map((mean, index) =>
          mean ? Math.max(mean - 2 * rEstimates.stdR[index], 0) : undefined
        ),
        showlegend: false,
        name: "Lower bound",
        hoverinfo: "none",
      } as Plotly.Data)
  );

  const predictedMeanTrace = {
    type: "scatter",
    line: {
      shape: "spline",
      smoothing: 0,
      color: "rgba(255, 255, 255, 0.5)",
    },
    x: rEstimates.date,
    y: predictedMeanR,
    name: "Insufficient data",
    hoverinfo: "y+text",
    hovertext: "Estimated R",
  } as Plotly.Data;

  const meanTrace = {
    type: "scatter",
    line: {
      shape: "spline",
      smoothing: 0,
      color: "#fff",
    },
    x: rEstimates.date,
    y: meanR,
    name: "Estimated R",
    hoverinfo: "y+text",
    hovertext: "Estimated R",
  } as Plotly.Data;

  let returnArray = [];

  for (let i = 0; i < aboveStdTraces.length; i++) {
    returnArray.push(aboveStdTraces[i]);
    returnArray.push(belowStdTraces[i]);
  }

  return [...returnArray, meanTrace, predictedMeanTrace];
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
