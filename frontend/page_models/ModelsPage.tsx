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
  makeFragmentLocationContext
} from "../components/LocationContext";

const REGION_FALLBACK = "united kingdom";

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

function init(): PageState {
  return {
    region: null,
    scenarioID: getUrlParam("scenario")
  };
}

export function Page() {
  const regions = useThunk<Regions>([], data.regions);

  const [{ region, scenarioID }, dispatch] = React.useReducer(
    reducer,
    null,
    init
  );

  const scenarios = useThunk<Scenarios | null>(null, region?.scenarios);

  let scenario = scenarios?.get(scenarioID ?? 0) ?? null;

  React.useEffect(() => {
    jQuery(".selected-region").text(region?.name ?? "the selected region");

    region?.customModelDescription.then(modelDescription => {
      if (modelDescription) {
        jQuery(".custom-model-explanation")
          .html(modelDescription)
          .show();

        jQuery(".model-explanation").hide();
      } else {
        jQuery(".model-explanation").show();
        jQuery(".custom-model-explanation").hide();
      }
    });
  }, [region]);

  // select a region to show upon receiving a list of regions
  React.useEffect(() => {
    if (region) {
      return;
    }

    // determine the users timezone
    const timezone = getTimezone();

    let fallbackRegion: Region | null = null;

    // the region which has our timezone
    let timezoneRegion: Region | null = null;

    let paramRegion: Region | null = null;
    regions.forEach(region => {
      if (region.code === getUrlParam("region")) paramRegion = region;

      if (region.code === REGION_FALLBACK) fallbackRegion = region;

      if (timezone && region.timezones.includes(timezone))
        timezoneRegion = region;
    });

    // pick an initial region to display
    let initialRegion = paramRegion ?? timezoneRegion ?? fallbackRegion;
    if (initialRegion)
      dispatch({ action: "switch_region", region: initialRegion });
  }, [regions]);

  // makes a context for giving urls to regions/scenarios
  let locationContext = makeFragmentLocationContext();

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
        id="regionDropdown"
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
      <hr />
    </LocationContext.Provider>
  );
}

let $root = document.getElementById("react-models");
if ($root) {
  ReactDOM.render(<Page />, $root);
}
