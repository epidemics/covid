import { Thunk } from "./models/datastore";
import { v4 } from "../common/spec";
import { Regions, MeasureInfo } from "./models";
import { STATIC_ROOT } from "../common/constants";

const CHANNEL_PARAM = "channel";

let url = new URL(window.location.href);
let paramChannel = url.searchParams.get(CHANNEL_PARAM);

export function makeDataStore(
  channel: string = paramChannel ?? DEFAULT_EPIFOR_CHANNEL
) {
  console.info(`Using channel ${channel}`);

  let mainv4 = Thunk.fetchJson<v4.Main>(
    `${STATIC_ROOT}/data-${channel}-v4.json`
  );

  return {
    countermeasureTags: mainv4.map(
      "parse_countermeasure_tags",
      ({ countermeasures: countermeasureTags }) => new MeasureInfo(countermeasureTags)
    ),
    regions: mainv4.map("parse_regions", ({ regions }) =>
      Regions.fromv4(regions)
    ),
    geoData: Thunk.fetchJson(`${STATIC_ROOT}/casemap-geo.json`),
    containments: Thunk.fetchJson(
      `${STATIC_ROOT}/data-testing-containments.json`
    ),
  };
}
