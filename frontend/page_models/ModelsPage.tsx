import * as React from "react";
import * as ReactDOM from "react-dom";
import {
  Regions,
  Region,
  Scenario,
  Scenarios,
  useThunk,
  Datastore,
  MainInfo,
} from "../models";
import { getTimezone, getUrlParam } from "../helpers";
import { RegionSelector } from "../components/RegionSelector";
import { ModelView } from "./ModelView";
import { makeDataStore } from "../ds";
import {
  LocationContext,
  makeFragmentLocationContext,
} from "../components/LocationContext";
import { Alerts } from "../components/alerts";
import { REstimateSeriesView } from "./REstimateSeriesView";
import { QuestionTooltip } from "../components/QuestionTooltip";
import {
  classNames,
  formatAbsoluteInteger,
  formatSIInteger,
  formatDate,
} from "../helpers";

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

  const [{ region, scenarioID }, dispatch] = React.useReducer(
    reducer,
    null,
    init
  );

  const formatCurrentInfected = formatSIInteger(3);

  const scenarios = useThunk<Scenarios | null>(null, region?.scenariosDaily);

  let scenario = scenarios?.get(scenarioID ?? 0) ?? null;

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
      <REstimateSeriesView region={region} />
      <hr />
      <div className="top-row">
        <div className="active-infections-block">
          {region?.current ? (
            <>
              <span className="number-subheader" id="infections-date">
                <span style={{ color: "#aaa" }}>Model last updated on:</span>{" "}
                {region?.current?.date ?? mainInfo.generated ? (
                  formatDate(region?.current?.date ?? mainInfo.generated)
                ) : (
                  <>&mdash;</>
                )}
              </span>
              <div className="active-infections">
                Active Infections:{" "}
                <span
                  className="infections-estimated"
                  id="infections-estimated"
                >
                  {region.current.infected ? (
                    formatCurrentInfected(region.current.infected)
                  ) : (
                    <>&mdash;</>
                  )}
                </span>
                <a
                  href="#case-count-explanation"
                  aria-label="Explanation about the case count"
                >
                  <QuestionTooltip />
                </a>
              </div>
            </>
          ) : (
            ""
          )}
          <div className="infections-confirmed">
            <span style={{ color: "#aaa" }}>Confirmed Infections:</span>{" "}
            <span id="infections-confirmed">
              {formatAbsoluteInteger(region?.reported?.last?.confirmed)}
            </span>
          </div>
        </div>

        <div className="population-block">
          <div className="number-subheader">Population</div>
          <div className="infections-population">
            <span id="infections-population">
              {formatAbsoluteInteger(region?.population)}
            </span>
          </div>
        </div>
      </div>
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

let $root = document.getElementById("react-models");
if ($root) {
  ReactDOM.render(<Page data={makeDataStore()} />, $root);
}
