import * as React from "react";

type LocationChange = {
  regionCode?: string | null;
  scenarioID?: string | null;
};

type LocationProvider = (change: LocationChange) => string;

export const LocationContext = React.createContext<LocationProvider>(
  (_) => document.location.href
);

export function makeFragmentLocationContext(target: {
  regionCode: string;
  scenarioID: string;
}) {
  return function(values: LocationChange) {
    let url = new URL(window.location.href);

    function update(target: string, value?: string | null) {
      if (value) {
        url.searchParams.set(target, value);
      } else if (value === null) {
        url.searchParams.delete(target);
      }
    }

    update(target.regionCode, values.regionCode);
    update(target.scenarioID, values.scenarioID);

    return url.href;
  };
}
