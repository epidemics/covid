import * as moment from 'moment';
import * as React from 'react';
import { ButtonGroup, Form, ToggleButton } from 'react-bootstrap';
import Plot from 'react-plotly.js';

import { makeConfig } from '../components/graph-common';
import { Region } from '../models';
import { initializeVisualization, isSameDay } from './NPIModelVisualizationUtils';

type ModelViewProps = {
  region: Region | null;
  channel: string;
};

export function NPIModelVisualization(props: ModelViewProps) {
  let { region, channel } = props;

  const deathsLastMonth = React.useMemo(() => {
    if (region && region.NPIModel) {
      const targetDate = moment().subtract(1, "months").toDate();

      const lastMonthIndex = region.NPIModel.date.findIndex((date) =>
        isSameDay(date, targetDate)
      );

      return region.NPIModel.predictedDeathsMean
        .slice(lastMonthIndex)
        .reduce((acc, cur) => Math.max(acc, cur), 0);
    }

    return 0;
  }, [region]);

  const maxValue = React.useMemo(() => {
    if (region && region.NPIModel && region.reported) {
      const currentCases = region.reported.points.map(
        (singleReported, index) => {
          if (index >= 1) {
            return (
              region!.reported!.points[index].confirmed -
              region!.reported!.points[index - 1].confirmed
            );
          }

          return region!.reported!.points[index].confirmed;
        }
      );

      return [
        ...region.NPIModel.predictedDeathsUpper,
        ...region.NPIModel.predictedNewCasesUpper,
        ...region.NPIModel.dailyInfectedDeathsUpper,
        ...region.NPIModel.dailyInfectedCasesUpper,
        ...currentCases,
      ].reduce((acc, cur) => Math.max(acc, cur), 0);
    }

    return 0;
  }, [region]);

  const maxValueNormal = React.useMemo(() => {
    if (region && region.NPIModel && region.reported) {
      const targetDate = region.NPIModel.extrapolationDate;

      const extrapolationIndex = region.NPIModel.date.findIndex((date) =>
        isSameDay(date, targetDate)
      );

      const currentCases = region.reported.points.map(
        (singleReported, index) => {
          if (index >= 1) {
            return (
              region!.reported!.points[index].confirmed -
              region!.reported!.points[index - 1].confirmed
            );
          }

          return region!.reported!.points[index].confirmed;
        }
      );

      return [
        ...region.NPIModel.predictedDeathsUpper.slice(0, extrapolationIndex),
        ...region.NPIModel.predictedNewCasesUpper.slice(0, extrapolationIndex),
        ...region.NPIModel.dailyInfectedDeathsUpper.slice(
          0,
          extrapolationIndex
        ),
        ...region.NPIModel.dailyInfectedCasesUpper.slice(0, extrapolationIndex),
        ...currentCases,
      ].reduce((acc, cur) => Math.max(acc, cur), 0);
    }

    return 0;
  }, [region]);

  const determineInitialScale = (maxValue: number, maxValueNormal: number) =>
    maxValue * 0.2 > maxValueNormal || maxValue > 10000 ? "log" : "linear";

  const [scaleMode, setScaleMode] = React.useState<"linear" | "log">(
    determineInitialScale(maxValue, maxValueNormal)
  );

  const [showExtrapolated, setShowExtrapolated] = React.useState<boolean>(true);

  React.useEffect(() => {
    setScaleMode(determineInitialScale(maxValue, maxValueNormal));
  }, [maxValue, maxValueNormal]);

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

  const showDeaths = deathsLastMonth >= 100;

  const { data, layout } = React.useMemo(
    () =>
      initializeVisualization(
        scaleMode,
        config,
        region,
        maxValue,
        showExtrapolated,
        showDeaths,
        channel
      ),
    [scaleMode, config, region, maxValue, showExtrapolated]
  );

  return (
    <>
      <h5 className="mitigation-heading">Short term forecast:</h5>
      <div style={{ display: "flex", alignItems: "center" }}>
        <ButtonGroup toggle className="mr-2">
          <ToggleButton
            size="sm"
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
            size="sm"
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
        <Form.Check
          type="checkbox"
          checked={showExtrapolated}
          label="Show projection"
          onChange={() => setShowExtrapolated((prev) => !prev)}
        />
      </div>
      <div>
        <div id="short_term_forecast_dataviz">
          <Plot
            style={{ width: "100%", height: "600px" }}
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
