import * as moment from 'moment';
import * as Plotly from 'plotly.js';

import { v4 } from '../../common/spec';
import { makeLayout } from '../components/graph-common';
import { isTouchDevice } from '../helpers';
import { Region, Reported } from '../models';
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

const createAboveStdTrace = (dates: Date[], values: number[], color: string) =>
  ({
    ...commonDeviationLineProps,
    fillcolor: color,
    x: dates,
    y: values,
  } as Plotly.Data);

const createBelowStdTrace = (dates: Date[], values: number[], color: string) =>
  ({
    ...commonDeviationLineProps,
    fill: "tonexty",
    fillcolor: color,
    x: dates,
    y: values,
  } as Plotly.Data);

const createAboveAndBelow = (
  dates: Date[],
  valuesAbove: number[],
  valuesBelow: number[],
  color: string,
  extrapolatedIndex: number,
  showExtrapolated: boolean
) => {
  const normalDates = dates.slice(0, extrapolatedIndex);
  const normalValuesAbove = valuesAbove.slice(0, extrapolatedIndex);
  const normalValuesBelow = valuesBelow.slice(0, extrapolatedIndex);

  const extrapolatedDates = dates.slice(extrapolatedIndex, dates.length);
  const extrapolatedValuesAbove = valuesAbove.slice(
    extrapolatedIndex,
    valuesAbove.length
  );
  const extrapolatedValuesBelow = valuesBelow.slice(
    extrapolatedIndex,
    valuesBelow.length
  );

  if (showExtrapolated) {
    return [
      createAboveStdTrace(
        [...normalDates, ...extrapolatedDates],
        [...normalValuesAbove, ...extrapolatedValuesAbove],
        color
      ),
      createBelowStdTrace(
        [...normalDates, ...extrapolatedDates],
        [...normalValuesBelow, ...extrapolatedValuesBelow],
        color
      ),
    ];
  }

  return [
    createAboveStdTrace(normalDates, normalValuesAbove, color),
    createBelowStdTrace(normalDates, normalValuesBelow, color),
  ];
};

export function isSameDay(d1: Date, d2: Date) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

const createBaseTrace = (
  dates: Date[],
  values: number[],
  color: string,
  text: string,
  extrapolatedIndex: number,
  showExtrapolated: boolean
) => {
  let data = { dates: [], values: [] } as { dates: any[]; values: any[] };
  let extrapolatedData = { dates: [], values: [] } as {
    dates: any[];
    values: any[];
  };

  data.dates = dates.slice(0, extrapolatedIndex);
  data.values = values.slice(0, extrapolatedIndex);

  extrapolatedData.dates = dates.slice(extrapolatedIndex, dates.length);
  extrapolatedData.values = values.slice(extrapolatedIndex, values.length);

  const standardTrace = {
    x: data.dates,
    y: data.values,
    line: {
      shape: "spline",
      smoothing: 0,
      color,
    },
    name: text,
    hovertext: text,
    hoverinfo: "y+x+text",
  } as Plotly.Data;

  const extraTrace = {
    x: extrapolatedData.dates,
    y: extrapolatedData.values,
    line: {
      shape: "spline",
      smoothing: 0,
      dash: "dash",
      color,
    },
    name: text,
    hovertext: text,
    hoverinfo: "y+x+text",
    showlegend: false,
  } as Plotly.Data;

  if (showExtrapolated) {
    return [standardTrace, extraTrace];
  } else {
    return [standardTrace];
  }
};

const lowerBound = (data: number[]) => {
  return data.map((value) =>
    Math.max(value, 1) === 1 ? Math.round(value) : value
  );
};

export const extrapolationText = (
  scaleMode: "linear" | "log",
  maxValue: number,
  extrapolationDate: Date
) => {
  const yPosition =
    scaleMode === "log"
      ? Math.pow(10, Math.log10(maxValue) * 0.998)
      : maxValue * 0.998;

  const extraTrace = {
    x: [extrapolationDate],
    y: [yPosition],
    mode: "text",
    text: ["                projection >"],
    textfont: {
      color: "#fff",
      family: "monospace",
    },
    showlegend: false,
  } as Plotly.Data;

  return extraTrace;
};

export const createDailyInfectedCasesTrace = (
  NPIModel: NPIModel,
  extrapolatedIndex: number,
  showExtrapolated: boolean
) => {
  const aboveAndBelowStdTrace = createAboveAndBelow(
    NPIModel.date,
    NPIModel.dailyInfectedCasesUpper,
    NPIModel.dailyInfectedCasesLower,
    "rgba(65, 180, 209,0.3)",
    extrapolatedIndex,
    showExtrapolated
  );

  const baseTrace = createBaseTrace(
    NPIModel.date,
    NPIModel.dailyInfectedCasesMean,
    "#41b4d1",
    "Daily infected cases",
    extrapolatedIndex,
    showExtrapolated
  );

  return [...aboveAndBelowStdTrace, ...baseTrace];
};

export const createDailyInfectedDeathsTrace = (
  NPIModel: NPIModel,
  extrapolatedIndex: number,
  showExtrapolated: boolean
) => {
  const aboveAndBelowStdTrace = createAboveAndBelow(
    NPIModel.date,
    NPIModel.dailyInfectedDeathsUpper,
    NPIModel.dailyInfectedDeathsLower,
    "rgba(157, 24, 214,0.3)",
    extrapolatedIndex,
    showExtrapolated
  );

  const baseTrace = createBaseTrace(
    NPIModel.date,
    NPIModel.dailyInfectedDeathsMean,
    "#9d18d6",
    "Daily infected deaths",
    extrapolatedIndex,
    showExtrapolated
  );

  return [...aboveAndBelowStdTrace, ...baseTrace];
};

export const createPredictedNewCasesTrace = (
  NPIModel: NPIModel,
  extrapolatedIndex: number,
  showExtrapolated: boolean
) => {
  const aboveAndBelowStdTrace = createAboveAndBelow(
    NPIModel.date,
    NPIModel.predictedNewCasesUpper,
    NPIModel.predictedNewCasesLower,
    "rgba(201, 58, 58,0.3)",
    extrapolatedIndex,
    showExtrapolated
  );

  const baseTrace = createBaseTrace(
    NPIModel.date,
    NPIModel.predictedNewCasesMean,
    "#c93a3a",
    "Daily predicted new cases",
    extrapolatedIndex,
    showExtrapolated
  );

  return [...aboveAndBelowStdTrace, ...baseTrace];
};

export const createPredictedDeathsTrace = (
  NPIModel: NPIModel,
  extrapolatedIndex: number,
  showExtrapolated: boolean
) => {
  const aboveAndBelowStdTrace = createAboveAndBelow(
    NPIModel.date,
    NPIModel.predictedDeathsUpper,
    NPIModel.predictedDeathsLower,
    "rgba(201, 217, 24,0.3)",
    extrapolatedIndex,
    showExtrapolated
  );

  const baseTrace = createBaseTrace(
    NPIModel.date,
    NPIModel.predictedDeathsMean,
    "#c9d918",
    "Daily predicted deaths",
    extrapolatedIndex,
    showExtrapolated
  );

  return [...aboveAndBelowStdTrace, ...baseTrace];
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
  interventions: v4.Intervention[],
  scaleMode: "log" | "linear",
  maxValue: number
) => {
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

  const yPosition =
    scaleMode === "log"
      ? Math.pow(10, Math.log10(maxValue) / 1.3)
      : maxValue / 1.3;

  return {
    x: interventions.map((intervention) => new Date(intervention.dateStart)),
    y: interventions.map((intervention) => yPosition),
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
      size: 9,
    },
    hoverlabel: {
      font: {
        color: "#fff",
      },
    },
    showlegend: false,
  } as Plotly.Data;
};

export const createActiveCasesMarkers = (
  reported: Reported,
  extrapolatedIndex: number,
  showExtrapolated: boolean
) => {
  const dates = reported.points.map((singleReported) => singleReported.date);
  const values = reported.points.map((singleReported, index) => {
    if (index >= 1) {
      return (
        reported.points[index].confirmed - reported.points[index - 1].confirmed
      );
    }

    return reported.points[index].confirmed;
  });

  const normalDates = dates.slice(0, extrapolatedIndex);
  const normalvalues = values.slice(0, extrapolatedIndex);

  const extrapolatedDates = dates.slice(extrapolatedIndex, dates.length);
  const extrapolatedValues = values.slice(extrapolatedIndex, values.length);

  let x: any[];
  let y: any[];

  if (showExtrapolated) {
    x = [...normalDates, ...extrapolatedDates];
    y = [...normalvalues, ...extrapolatedValues];
  } else {
    x = normalDates;
    y = normalvalues;
  }

  return {
    x,
    y,
    mode: "markers",
    name: "Daily current cases",
    hovertext: "Daily current cases",
    hoverinfo: "y+text",
    marker: {
      color: "#c93a3a",
    },
  } as Plotly.Data;
};

export const createDeathsCasesMarkers = (
  reported: Reported,
  extrapolatedIndex: number,
  showExtrapolated: boolean
) => {
  const dates = reported.points.map((singleReported) => singleReported.date);
  const values = reported.points.map((singleReported, index) => {
    if (index >= 1) {
      return reported.points[index].deaths - reported.points[index - 1].deaths;
    }

    return reported.points[index].deaths;
  });

  const normalDates = dates.slice(0, extrapolatedIndex);
  const normalvalues = values.slice(0, extrapolatedIndex);

  const extrapolatedDates = dates.slice(extrapolatedIndex, dates.length);
  const extrapolatedValues = values.slice(extrapolatedIndex, values.length);

  let x: any[];
  let y: any[];

  if (showExtrapolated) {
    x = [...normalDates, ...extrapolatedDates];
    y = [...normalvalues, ...extrapolatedValues];
  } else {
    x = normalDates;
    y = normalvalues;
  }

  return {
    x,
    y,
    mode: "markers",
    marker: {
      color: "#c9d918",
    },
    name: "Daily current deaths",
    hovertext: "Daily current deaths",
    hoverinfo: "y+text",
  } as Plotly.Data;
};

const createExtrapolationArea = (startDate: Date, endDate: Date) => {
  return {
    type: "rect",
    x0: startDate,
    y0: 0,
    x1: endDate,
    yref: "paper",
    y1: 1,
    fillcolor: "#2c2933",
    line: {
      color: "rgba(55, 128, 191, 0.5)",
      width: 0,
    },
    layer: "below",
  } as Plotly.Shape;
};

export const initializeVisualization = (
  scaleMode: "linear" | "log",
  config: Partial<Plotly.Config>,
  region: Region | null,
  maxValue: number,
  showExtrapolated: boolean,
  showDeaths: boolean,
  channel: string
) => {
  // create a layout and customize
  let layout = makeLayout();
  layout.autosize = true;
  layout.margin!.r = 20;
  layout.xaxis!.type = "date";
  layout.xaxis!.showgrid = false;
  layout.yaxis!.title = "Number of people";
  layout.yaxis!.type = scaleMode;
  layout.yaxis!.showgrid = false;
  layout.yaxis!.showline = false;
  layout.showlegend = true;
  layout.legend = {
    x: 0,
    xanchor: "left",
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
  if (region && region.NPIModel && region.reported && region.interventions) {
    const targetDate = region.NPIModel.extrapolationDate;

    const extrapolationIndex = region.NPIModel.date.findIndex((date) =>
      isSameDay(date, targetDate)
    );

    layout.shapes = [...createInterventionLines(region.interventions)];

    if (showExtrapolated) {
      layout.shapes.push(
        createExtrapolationArea(
          region.NPIModel.date[extrapolationIndex],
          region.NPIModel.date[region.NPIModel.date.length - 1]
        )
      );
    }

    const monthAheadDate = moment(targetDate).add(1, "months").toDate();

    const monthAheadIndex = region.NPIModel.date.findIndex((date) =>
      isSameDay(date, monthAheadDate)
    );

    const lastItemIndex =
      channel === "model" ? monthAheadIndex : region.NPIModel.date.length - 1;

    layout.xaxis!.range = [
      region.NPIModel.date[0],
      showExtrapolated
        ? region.NPIModel.date[lastItemIndex]
        : region.NPIModel.date[extrapolationIndex - 1],
    ];

    layout.yaxis!.rangemode = "nonnegative";

    data = [
      ...createDailyInfectedCasesTrace(
        region.NPIModel,
        extrapolationIndex,
        showExtrapolated
      ),
      ...createDailyInfectedDeathsTrace(
        region.NPIModel,
        extrapolationIndex,
        showExtrapolated
      ),
      ...createPredictedNewCasesTrace(
        region.NPIModel,
        extrapolationIndex,
        showExtrapolated
      ),
      createInterventionIcons(
        region.NPIModel,
        region.interventions,
        scaleMode,
        maxValue
      ),
      createActiveCasesMarkers(
        region.reported,
        extrapolationIndex,
        showExtrapolated
      ),
      createDeathsCasesMarkers(
        region.reported,
        extrapolationIndex,
        showExtrapolated
      ),
    ];

    if (channel !== "model" || showDeaths) {
      data = [
        ...data,
        ...createPredictedDeathsTrace(
          region.NPIModel,
          extrapolationIndex,
          showExtrapolated
        ),
      ];
    }

    showExtrapolated &&
      data.push(
        extrapolationText(
          scaleMode,
          maxValue,
          region.NPIModel.date[extrapolationIndex]
        )
      );

    data = data.map((dataItem) => ({
      ...dataItem,
      y: lowerBound(dataItem.y! as number[]),
    }));
  }

  return { data, layout };
};
