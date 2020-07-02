import * as React from "react";
import * as ReactDOM from "react-dom";

import { Alerts } from "../components/alerts";
import {
  LocationContext,
  makeFragmentLocationContext,
} from "../components/LocationContext";
import { RegionSelector } from "../components/RegionSelector";
import { makeDataStore } from "../ds";
import { getTimezone, getUrlParam } from "../helpers";
import {
  Datastore,
  MainInfo,
  Region,
  Regions,
  Scenario,
  useThunk,
} from "../models";
import { NPIModelVisualization } from "./NPIModelVisualization";
import { REstimateSeriesView } from "./REstimateSeriesView";

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

function init(): PageState {
  return {
    region: null,
    scenarioID: getUrlParam("scenario"),
  };
}

export function Page({ data }: { data: Datastore }) {
  const regions = useThunk<Regions>([], data.regions);

  const mainInfo = useThunk<MainInfo>({}, data.mainInfo);

  const [{ region }, dispatch] = React.useReducer(reducer, null, init);

  React.useEffect(() => {
    jQuery(".selected-region").text(region?.name ?? "the selected region");

    region?.customModelDescription.then((modelDescription) => {
      if (modelDescription) {
        jQuery(".custom-model-explanation").html(modelDescription).show();

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
    // we previously used `selection` as url param
    let urlParam = getUrlParam("region") ?? getUrlParam("selection");
    regions.forEach((region) => {
      if (region.code === urlParam) paramRegion = region;

      if (region.code === REGION_FALLBACK) fallbackRegion = region;

      if (timezone && region.timezones.includes(timezone))
        timezoneRegion = region;
    });

    // pick an initial region to display
    let initialRegion =
      paramRegion ?? timezoneRegion ?? fallbackRegion ?? regions[0];
    if (initialRegion)
      dispatch({ action: "switch_region", region: initialRegion });
  }, [regions]);

  // makes a context for giving urls to regions/scenarios
  let locationContext = makeFragmentLocationContext();

  return (
    <LocationContext.Provider value={locationContext}>
      <Alerts />
      <RegionSelector
        mainInfo={mainInfo}
        regions={regions}
        selected={region}
        id="regionDropdown"
        onSelect={(region, url) =>
          dispatch({ action: "switch_region", region, url })
        }
      />

      <hr />
      {region && region.rEstimates && (
        <>
          <REstimateSeriesView region={region} />
          <hr />
        </>
      )}
      {region && region.NPIModel && (
        <>
          <NPIModelVisualization region={region} />
          <hr />
        </>
      )}
    </LocationContext.Provider>
  );
}

let $root = document.getElementById("react-models");
if ($root) {
  ReactDOM.render(<Page data={makeDataStore()} />, $root);
}
