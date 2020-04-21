import * as React from "react";
import * as ReactDOM from "react-dom";
import { Regions, Thunk, Region, Scenario, Scenarios } from "../models";
import { getTimezone, getUrlParam } from "../helpers";
import { RegionSelector } from "../components/RegionSelector";
import { ModelView } from "./ModelView";
import { makeDataStore } from "../ds";
import { DismissableAlert } from "../components/DismissableAlert";

const REGION_FALLBACK = "united kingdom";
const SELECTION_PARAM = "selection";

type PageState = { region: Region | null; scenarioID?: string };
export type PageActions =
  | { action: "switch_region"; region: Region | null }
  | { action: "switch_scenario"; scenario: Scenario | null };

type PageReducer = React.Reducer<PageState, PageActions>;
const reducer: PageReducer = (state, action) => {
  switch (action.action) {
    case "switch_region":
      return { ...state, region: action.region };

    case "switch_scenario":
      return { ...state, scenarioID: action.scenario?.group };
  }
};

function useThunk<T>(init: T, promise: Thunk<T> | undefined | null): T {
  let [state, setState] = React.useState<T>(() => promise?.result ?? init);
  React.useEffect(() => {
    let result = promise?.result;
    if (result) {
      setState(result);
      return;
    }
    if (promise) promise.then(setState);
  }, [promise]);
  return state;
}

const data = makeDataStore();

export function Page() {
  const regions = useThunk<Regions>([], data.regions);

  const [{ region, scenarioID }, dispatch] = React.useReducer(reducer, {
    region: null,
  });

  const scenarios = useThunk<Scenarios | null>(null, region?.scenarios);

  let scenario = scenarios?.get(scenarioID ?? 0) ?? null;

  React.useEffect(() => {
    // determines the users timezone
    const tz = getTimezone();

    let fallbackRegion: Region | null = null;
    let tzRegion: Region | null = null;
    let paramRegion: Region | null = null;
    regions.forEach((region) => {
      if (region.code === getUrlParam(SELECTION_PARAM)) paramRegion = region;

      if (region.code === REGION_FALLBACK) fallbackRegion = region;

      if (tz && region.timezones.includes(tz)) tzRegion = region;
    });

    let region = paramRegion ?? tzRegion ?? fallbackRegion;
    if (region) dispatch({ action: "switch_region", region });
  }, [regions]);

  return (
    <>
      <DismissableAlert
        className="pro-bono-banner"
        storage={window.sessionStorage}
        dismissalDuration={{ days: 1 }}
        id="consultingAlert"
        revision="0"
      >
        <p>
          We're offering pro bono consulting services and custom forecasts for
          decision-makers. Please reach out{" "}
          <a
            href="http://epidemicforecasting.org/request-calculation"
            className="alert-link"
          >
            here
          </a>
          .
        </p>
      </DismissableAlert>

      <RegionSelector
        regions={regions}
        selected={region}
        onSelect={(region) => dispatch({ action: "switch_region", region })}
      />

      <hr />
      <ModelView
        region={region}
        scenario={scenario}
        scenarios={scenarios}
        dispatch={dispatch}
      />
    </>
  );
}

let $root = document.getElementById("react-root");
if ($root) {
  ReactDOM.render(<Page />, $root);
}
