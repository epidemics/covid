import * as React from "react";

type LocationChange = { [param: string]: string };

type LocationProvider = (change: LocationChange) => string;

// a react context which generates URL's for a given region/scenario
export const LocationContext = React.createContext<LocationProvider>(
  (_) => document.location.href
);

// a location context which stores the region and scenario in the url search params
export function makeFragmentLocationContext() {
  return function(changes: LocationChange) {
    let url = new URL(window.location.href);

    function update(target: string, value?: string | null) {
      if (value) {
        url.searchParams.set(target, value);
      } else if (value === null) {
        url.searchParams.delete(target);
      }
    }

    Object.keys(changes).forEach((key) => {
      update(key, changes[key]);
    });

    return url.href;
  };
}
