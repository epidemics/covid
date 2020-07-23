import * as React from 'react';
import Plot from 'react-plotly.js';

import { makeConfig } from '../components/graph-common';
import { Region } from '../models';
import { initializeVisualization } from './NPIModelVisualizationUtils';

type ModelViewProps = {
  region: Region | null;
};

export function NPIModelVisualization(props: ModelViewProps) {
  let { region } = props;
  const [scaleMode, setScaleMode] = React.useState<"linear" | "log">("log");

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

  const { data, layout } = React.useMemo(
    () => initializeVisualization(scaleMode, config, region),
    [scaleMode, config, region]
  );

  return (
    <>
      <h5 className="mitigation-heading">Short term forecast:</h5>
      <button onClick={() => setScaleMode("log")}>Log</button>
      <button onClick={() => setScaleMode("linear")}>Linear</button>
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
