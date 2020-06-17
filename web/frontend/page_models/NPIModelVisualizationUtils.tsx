import * as Plotly from 'plotly.js';

import { Reported } from '../models';
import { NPIModel } from '../models/NPIModel';

const line = {
  shape: "spline",
  smoothing: 0,
  color: "transparent",
};

const commonDeviationLineProps = {
  line,
  type: "scatter",
  showlegend: false,
  hoverinfo: "none",
};

export const createDailyInfectedCasesTrace = (NPIModel: NPIModel) => {
  const aboveStdTrace = {
    ...commonDeviationLineProps,
    fillcolor: "rgba(65, 180, 209,0.3)",
    x: NPIModel.date,
    y: NPIModel.dailyInfectedCasesUpper,
  } as Plotly.Data;

  const belowStdTrace = {
    ...commonDeviationLineProps,
    fill: "tonexty",
    fillcolor: "rgba(65, 180, 209,0.3)",
    x: NPIModel.date,
    y: NPIModel.dailyInfectedCasesLower,
  } as Plotly.Data;

  const meanTrace = {
    x: NPIModel.date,
    y: NPIModel.dailyInfectedCasesMean,
    line: {
      shape: "spline",
      smoothing: 0,
      color: "#41b4d1",
    },
    name: "Daily infected cases",
  } as Plotly.Data;

  return [aboveStdTrace, belowStdTrace, meanTrace];
};

export const createDailyInfectedDeathsTrace = (NPIModel: NPIModel) => {
  const aboveStdTrace = {
    ...commonDeviationLineProps,
    fillcolor: "rgba(157, 24, 214,0.3)",
    x: NPIModel.date,
    y: NPIModel.dailyInfectedDeathsUpper,
  } as Plotly.Data;

  const belowStdTrace = {
    ...commonDeviationLineProps,
    fill: "tonexty",
    fillcolor: "rgba(157, 24, 214,0.3)",
    x: NPIModel.date,
    y: NPIModel.dailyInfectedDeathsLower,
  } as Plotly.Data;

  const meanTrace = {
    type: "scatter",
    line: {
      shape: "spline",
      smoothing: 0,
      color: "#9d18d6",
    },
    x: NPIModel.date,
    y: NPIModel.dailyInfectedDeathsMean,
    name: "Daily infected deaths",
  } as Plotly.Data;

  return [aboveStdTrace, belowStdTrace, meanTrace];
};

export const createPredictedNewCasesTrace = (NPIModel: NPIModel) => {
  const aboveStdTrace = {
    ...commonDeviationLineProps,
    fillcolor: "rgba(201, 58, 58,0.3)",
    x: NPIModel.date,
    y: NPIModel.predictedNewCasesUpper,
  } as Plotly.Data;

  const belowStdTrace = {
    ...commonDeviationLineProps,
    fill: "tonexty",
    fillcolor: "rgba(201, 58, 58,0.3)",
    x: NPIModel.date,
    y: NPIModel.predictedNewCasesLower,
  } as Plotly.Data;

  const meanTrace = {
    type: "scatter",
    line: {
      shape: "spline",
      smoothing: 0,
      color: "#c93a3a",
    },
    x: NPIModel.date,
    y: NPIModel.predictedNewCasesMean,
    name: "Daily predicted new cases",
  } as Plotly.Data;

  return [aboveStdTrace, belowStdTrace, meanTrace];
};

export const createPredictedDeathsTrace = (NPIModel: NPIModel) => {
  const aboveStdTrace = {
    ...commonDeviationLineProps,
    fillcolor: "rgba(201, 217, 24,0.3)",
    x: NPIModel.date,
    y: NPIModel.predictedDeathsUpper,
  } as Plotly.Data;

  const belowStdTrace = {
    ...commonDeviationLineProps,
    fill: "tonexty",
    fillcolor: "rgba(201, 217, 24,0.3)",
    x: NPIModel.date,
    y: NPIModel.predictedDeathsLower,
  } as Plotly.Data;

  const meanTrace = {
    type: "scatter",
    line: {
      shape: "spline",
      smoothing: 0,
      color: "#c9d918",
    },
    x: NPIModel.date,
    y: NPIModel.predictedDeathsMean,
    name: "Daily predicted deaths",
  } as Plotly.Data;

  return [aboveStdTrace, belowStdTrace, meanTrace];
};

export const createInterventionLines = (NPIModel: NPIModel) => {
  const interventions = [
    {
      type: "Gatherings banned (100)",
      date: "2020-03-22T00:00:00+00:00",
    },
    {
      type: "Gatherings banned (100)",
      date: "2020-02-22T00:00:00+00:00",
    },
    {
      type: "Gatherings banned (100)",
      date: "2020-04-22T00:00:00+00:00",
    },
  ];

  return interventions.map((intervention) => ({
    type: "line",
    x0: new Date(intervention.date),
    y0: 0,
    x1: new Date(intervention.date),
    yref: "paper",
    y1: 1,
    line: {
      color: "rgb(55, 128, 191)",
      width: 2,
    },
    layer: "below",
  })) as Plotly.Shape[];
};

export const createInterventionIcons = (NPIModel: NPIModel) => {
  const maxValue = [
    ...NPIModel.predictedDeathsUpper,
    ...NPIModel.predictedNewCasesUpper,
    ...NPIModel.dailyInfectedDeathsUpper,
    ...NPIModel.dailyInfectedCasesUpper,
  ].reduce((acc, cur) => Math.max(acc, cur), 0);

  const interventions = [
    {
      type: "hospital",
      date: "2020-03-22T00:00:00+00:00",
    },
    {
      type: "ppl",
      date: "2020-02-22T00:00:00+00:00",
    },
    {
      type: "school",
      date: "2020-04-22T00:00:00+00:00",
    },
  ];

  return {
    x: interventions.map((intervention) => new Date(intervention.date)),
    y: interventions.map((intervention) => maxValue / 2),
    text: interventions.map((intervention) => "\uf7f2<br>\uf7f2"),
    hovertext: interventions.map((intervention) => intervention.type),
    mode: "text",
    textfont: {
      color: "#fff",
      family: "emoji_font",
    },
    hoverlabel: {
      font: {
        color: "#fff",
        family: "emoji_font",
      },
    },
    showlegend: false,
  } as Plotly.Data;
};

export const createActiveCasesMarker = (reported: Reported) => {
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
    mode: "markers",
    showlegend: false,
  } as Plotly.Data;
};

export const createDeathsCasesMarker = (reported: Reported) => {
  return {
    x: reported.points.map((singleReported) => new Date(singleReported.date)),
    y: reported.points.map((singleReported, index) => {
      if (index >= 1) {
        return (
          reported.points[index].deaths - reported.points[index - 1].deaths
        );
      }

      return reported.points[index].deaths;
    }),
    mode: "markers",
    showlegend: false,
    marker: {
      color: "#c9d918",
    },
  } as Plotly.Data;
};
