import * as React from "react";
import * as ReactDOM from "react-dom";
import {
  Regions,
  Region,
  useThunk,
  Datastore,
  Measure,
} from "../models";
import { getTimezone, getUrlParam } from "../helpers";
import { RegionSelector } from "../components/RegionSelector";
import { makeDataStore } from "../ds";
import {
  LocationContext,
  makeFragmentLocationContext,
} from "../components/LocationContext";
import { CurrentChart } from "./current-chart";
import { MeasureInfo } from "../models/countermeasures";

const REGION_FALLBACK = "united kingdom";

type PageState = {
  region: Region | null;
};
export type PageActions = {
  url?: string;
  action: "switch_region";
  region: Region | null;
};

type PageReducer = React.Reducer<PageState, PageActions>;
const reducer: PageReducer = (state: PageState, obj: PageActions) => {
  if (obj.url) window.history.pushState({ href: obj.url }, "", obj.url);

  switch (obj.action) {
    case "switch_region":
      let { region } = obj;
      return { ...state, region };
  }
};
export function MeasuresPage({ data }: { data: Datastore }) {
  const regions = useThunk<Regions>([], data.regions);
  const measureInfo = useThunk<MeasureInfo | null>(
    null,
    data.countermeasureTags
  );

  const [{ region }, dispatch] = React.useReducer(reducer, { region: null });

  React.useEffect(() => {
    if (!region || !measureInfo) return;

    console.log("measureInfo", measureInfo);

    let iso3 = region.iso3;
    if (!iso3) return;

    console.log("measures", region.measures);

    currentChart?.update(region, measureInfo);
  }, [measureInfo, region]);

  const [currentChart, setCurrentChart] = React.useState<CurrentChart>();

  const currentChartRef = React.useCallback((node) => {
    if (!node) return;
    setCurrentChart(new CurrentChart(node));
  }, []);

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
    regions.forEach((region) => {
      if (region.code === getUrlParam("region")) paramRegion = region;

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
      <RegionSelector
        regions={regions}
        selected={region}
        id="regionDropdown"
        onSelect={(region, url) =>
          dispatch({ action: "switch_region", region, url })
        }
      />

      <hr />
      <div ref={currentChartRef}></div>
      <hr />
    </LocationContext.Provider>
  );
}

let $root = document.getElementById("react-measures");
if ($root) {
  ReactDOM.render(<MeasuresPage data={makeDataStore()} />, $root);
}
