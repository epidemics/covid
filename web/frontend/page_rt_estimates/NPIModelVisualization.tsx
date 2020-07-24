import * as React from "react";
import { ButtonGroup, ToggleButton } from "react-bootstrap";
import Plot from "react-plotly.js";

import { makeConfig } from "../components/graph-common";
import { Region } from "../models";
import { initializeVisualization } from "./NPIModelVisualizationUtils";

type ModelViewProps = {
  region: Region | null;
};

export function NPIModelVisualization(props: ModelViewProps) {
  let { region } = props;

  const maxValue = React.useMemo(() => {
    if (region && region.NPIModel) {
      return [
        ...region.NPIModel.predictedDeathsUpper,
        ...region.NPIModel.predictedNewCasesUpper,
        ...region.NPIModel.dailyInfectedDeathsUpper,
        ...region.NPIModel.dailyInfectedCasesUpper,
      ].reduce((acc, cur) => Math.max(acc, cur), 0);
    }

    return 0;
  }, [region]);

  const determineInitialScale = (maxValue: number) =>
    maxValue > 10000 ? "log" : "linear";

  const [scaleMode, setScaleMode] = React.useState<"linear" | "log">(
    determineInitialScale(maxValue)
  );

  React.useEffect(() => {
    setScaleMode(determineInitialScale(maxValue));
  }, [maxValue]);

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
    () => initializeVisualization(scaleMode, config, region, maxValue),
    [scaleMode, config, region, maxValue]
  );

  return (
    <>
      <h5 className="mitigation-heading">Short term forecast:</h5>
      <ButtonGroup toggle>
        <ToggleButton
          type="radio"
          variant="secondary"
          name="yScale"
          checked={scaleMode === "linear"}
          value="1"
          onChange={() => setScaleMode("linear")}
        >
          Linear
        </ToggleButton>
        <ToggleButton
          type="radio"
          variant="secondary"
          name="yScale"
          checked={scaleMode === "log"}
          value="1"
          onChange={() => setScaleMode("log")}
        >
          Log
        </ToggleButton>
      </ButtonGroup>
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
