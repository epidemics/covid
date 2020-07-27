import * as Plotly from "plotly.js";

import { v4 } from "../../common/spec";
import { Reported } from "../models";
import { NPIModel } from "../models/NPIModel";

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
    hovertext: "Daily infected cases",
    hoverinfo: "y+x+text",
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
    hovertext: "Daily infected deaths",
    hoverinfo: "y+text",
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
    hovertext: "Daily predicted new cases",
    hoverinfo: "y+text",
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
    hovertext: "Daily predicted deaths",
    hoverinfo: "y+text",
  } as Plotly.Data;

  return [aboveStdTrace, belowStdTrace, meanTrace];
};

export const createInterventionLines = (interventions: v4.Intervention[]) => {
  return interventions.map((intervention) => ({
    type: "line",
    x0: new Date(intervention.dateStart),
    y0: 0,
    x1: new Date(intervention.dateStart),
    yref: "paper",
    y1: 1,
    line: {
      color: "rgba(55, 128, 191, 0.5)",
      width: 1,
    },
    layer: "below",
  })) as Plotly.Shape[];
};

export const createInterventionIcons = (
  NPIModel: NPIModel,
  interventions: v4.Intervention[]
) => {
  const maxValue = [
    ...NPIModel.predictedDeathsUpper,
    ...NPIModel.predictedNewCasesUpper,
    ...NPIModel.dailyInfectedDeathsUpper,
    ...NPIModel.dailyInfectedCasesUpper,
  ].reduce((acc, cur) => Math.max(acc, cur), 0);

  const mapTypeToIcon = (type: string) => {
    const icons = {
      "Healthcare Infection Control": '<span style="color: red">\uf7f2</span>',
      "Mask Wearing": '<span style="color: black">\uf963</span>',
      "Symptomatic Testing": '<span style="color: mediumblue">\uf492</span>',
      "Gatherings <1000": '<span style="color: lightgrey">\uf0c0</span>',
      "Gatherings <100": '<span style="color: grey">\uf0c0</span>',
      "Gatherings <10": '<span style="color: black">\uf0c0</span>',
      "Some Businesses Suspended": '<span style="color: orange">\uf07a</span>',
      "Most Businesses Suspended": '<span style="color: red">\uf07a</span>',
      "School Closure": '<span style="color: black">\uf19d</span>',
      "Stay Home Order": '<span style="color: black">\uf965</span>',
      "Travel Screen/Quarantine": '<span style="color: orange">plane</span>',
      "Travel Bans": '<span style="color: red">plane</span>',
      "Public Transport Limited": '<span style="color: lightgrey">bus</span>',
      "Internal Movement Limited":
        '<span style="color: lightgrey">child</span>',
      "Public Information Campaigns":
        '<span style="color: lightgrey">newspaper</span>',
      X: '<span style="color: lightgrey">X</span>',
    } as {
      [key: string]: string;
    };

    return icons[type];
  };

  const mapTypeToOrder = (type: string) => {
    const icons = {
      "Healthcare Infection Control": 1,
      "Mask Wearing": 2,
      "Symptomatic Testing": 3,
      "Gatherings <1000": 4,
      "Gatherings <100": 5,
      "Gatherings <10": 6,
      "Some Businesses Suspended": 7,
      "Most Businesses Suspended": 8,
      "School Closure": 9,
      "Stay Home Order": 10,
      X: 11,
      "Travel Screen/Quarantine": 12,
      "Travel Bans": 13,
      "Public Transport Limited": 14,
      "Internal Movement Limited": 15,
      "Public Information Campaigns": 16,
    } as {
      [key: string]: number;
    };

    return icons[type];
  };

  return {
    x: interventions.map((intervention) => new Date(intervention.dateStart)),
    y: interventions.map((intervention) => maxValue / 1.4),
    text: interventions.map((intervention) =>
      intervention.type.length > 0
        ? intervention.type
            .sort((typeA, typeB) =>
              mapTypeToOrder(typeA) > mapTypeToOrder(typeB) ? 1 : -1
            )
            .reduce((acc, type) => `${acc}<br>${mapTypeToIcon(type)}`, "")
        : mapTypeToIcon("X")
    ),
    hovertext: interventions.map((intervention) =>
      intervention.type.length > 0
        ? intervention.type
            .sort((typeA, typeB) =>
              mapTypeToOrder(typeA) > mapTypeToOrder(typeB) ? 1 : -1
            )
            .reduce((acc, type) => `${acc}<br>${type}`, "")
        : "All restriction canceled"
    ),
    mode: "text",
    textfont: {
      color: "#fff",
      family: "emoji_font",
    },
    hoverlabel: {
      font: {
        color: "#fff",
      },
    },
    showlegend: false,
  } as Plotly.Data;
};

export const createActiveCasesMarkers = (reported: Reported) => {
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
    name: "Daily current cases",
    hovertext: "Daily current cases",
    hoverinfo: "y+text",
  } as Plotly.Data;
};

export const createDeathsCasesMarkers = (reported: Reported) => {
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
    marker: {
      color: "#c9d918",
    },
    name: "Daily current deaths",
    hovertext: "Daily current deaths",
    hoverinfo: "y+text",
  } as Plotly.Data;
};
