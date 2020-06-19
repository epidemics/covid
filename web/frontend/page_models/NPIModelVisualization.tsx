import * as Plotly from 'plotly.js';
import * as React from 'react';
import Plot from 'react-plotly.js';

import { makeConfig, makeLayout } from '../components/graph-common';
import { isTouchDevice } from '../helpers';
import { Region } from '../models';
import {
  createActiveCasesMarkers,
  createDailyInfectedCasesTrace,
  createDailyInfectedDeathsTrace,
  createDeathsCasesMarkers,
  createInterventionIcons,
  createInterventionLines,
  createPredictedDeathsTrace,
  createPredictedNewCasesTrace,
} from './NPIModelVisualizationUtils';

type ModelViewProps = {
  region: Region | null;
};

export function NPIModelVisualization(props: ModelViewProps) {
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
  layout.margin!.r = 20;
  layout.xaxis!.type = "date";
  layout.yaxis!.title = "Number of people";
  layout.yaxis!.type = "linear";
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
    layout.shapes = createInterventionLines(region.interventions);
    layout.xaxis!.range = [
      region.NPIModel.date[0],
      region.NPIModel.date[region.NPIModel.date.length - 1],
    ];

    layout.yaxis!.rangemode = "nonnegative";

    data = [
      ...createDailyInfectedCasesTrace(region.NPIModel),
      ...createDailyInfectedDeathsTrace(region.NPIModel),
      ...createPredictedNewCasesTrace(region.NPIModel),
      ...createPredictedDeathsTrace(region.NPIModel),
      createInterventionIcons(region.NPIModel, region.interventions),
      createActiveCasesMarkers(region.reported),
      createDeathsCasesMarkers(region.reported),
    ];
  }

  return (
    <>
      <h5 className="mitigation-heading">Short term forecast:</h5>
      <div>
        <div id="short_term_forecast_dataviz">
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
