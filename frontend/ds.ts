import { Thunk, Datastore } from "./models/datastore";
import { v4 } from "../common/spec";
import { Regions } from "./models";
import { STATIC_ROOT } from "../common/constants";

export function makeDataStore(channel: string = DEFAULT_CHANNEL) {
  let mainv4 = Thunk.fetchJson<v4.Main>(
    `${STATIC_ROOT}/data-${channel}-v4.json`
  );

  return new Datastore({
    regions: mainv4.map("parse_regions", ({ regions }) =>
      Regions.fromv4(regions)
    ),
    geoData: Thunk.fetchJson(`${STATIC_ROOT}/casemap-geo.json`),
    containments: Thunk.fetchJson(
      `${STATIC_ROOT}/data-testing-containments.json`
    )
  });
}
