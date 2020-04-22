import * as React from "react";
import * as ReactDOM from "react-dom";
import { Regions, Region, Scenario, Scenarios, useThunk } from "../models";
import { getTimezone, getUrlParam } from "../helpers";
import { RegionSelector } from "../components/RegionSelector";
import { ModelView } from "./ModelView";
import { makeDataStore } from "../ds";
import { DismissableAlert } from "../components/DismissableAlert";
import {
  LocationContext,
  makeFragmentLocationContext,
} from "../components/LocationContext";

const REGION_FALLBACK = "united kingdom";
const params = {
  regionCode: "region",
  scenarioID: "scenario",
};

type PageState = {
  region: Region | null;
  scenarioID: string | null;
};
export type PageActions = { url?: string } & (
  | { action: "switch_region"; region: Region | null }
  | { action: "switch_scenario"; scenario: Scenario | null }
);

type PageReducer = React.Reducer<PageState, PageActions>;
const reducer: PageReducer = (state: PageState, obj: PageActions) => {
  if (obj.url) window.history.pushState({ href: obj.url }, "", obj.url);

  switch (obj.action) {
    case "switch_region":
      let { region } = obj;
      return { ...state, region };

    case "switch_scenario":
      let { scenario } = obj;
      return { ...state, scenarioID: scenario?.group ?? null };
  }
};

const data = makeDataStore();

function init(param: string): PageState {
  return {
    region: null,
    scenarioID: getUrlParam(param),
  };
}

export function Page() {
  const regions = useThunk<Regions>([], data.regions);

  const [{ region, scenarioID }, dispatch] = React.useReducer(
    reducer,
    params.scenarioID,
    init
  );

  const scenarios = useThunk<Scenarios | null>(null, region?.scenarios);

  let scenario = scenarios?.get(scenarioID ?? 0) ?? null;

  React.useEffect(() => {
    // determines the users timezone
    const tz = getTimezone();

    let fallbackRegion: Region | null = null;
    let tzRegion: Region | null = null;
    let paramRegion: Region | null = null;
    regions.forEach((region) => {
      if (region.code === getUrlParam(params.regionCode)) paramRegion = region;

      if (region.code === REGION_FALLBACK) fallbackRegion = region;

      if (tz && region.timezones.includes(tz)) tzRegion = region;
    });

    let region = paramRegion ?? tzRegion ?? fallbackRegion;
    if (region) dispatch({ action: "switch_region", region });
  }, [regions]);

  let locationContext = makeFragmentLocationContext(params);

  return (
    <LocationContext.Provider value={locationContext}>
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
        onSelect={(region, url) =>
          dispatch({ action: "switch_region", region, url })
        }
      />

      <hr />
      <ModelView
        region={region}
        scenario={scenario}
        scenarios={scenarios}
        dispatch={dispatch}
      />
    </LocationContext.Provider>
  );
}

let $root = document.getElementById("react-root");
if ($root) {
  ReactDOM.render(<Page />, $root);
}
