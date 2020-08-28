import { STATIC_ROOT } from "../common/constants";
import { v4 } from "../common/spec";
import { Regions } from "./models";
import { Datastore, MainInfo, Thunk } from "./models/datastore";

const CHANNEL_PARAM = "channel";

let url = new URL(window.location.href);
let paramChannel = url.searchParams.get(CHANNEL_PARAM);

export function makeDataStore(
  channel: string = paramChannel ?? DEFAULT_EPIFOR_CHANNEL
): Datastore {
  console.info(`Using channel ${channel}`);

  let data_root = `${STATIC_ROOT}/v4/${channel}`;

  let mainv4 = Thunk.fetchJson<v4.Main>(`${data_root}/data-v4.json`);
  const npi = Thunk.fetchJson<v4.NpiMain>(
    `${data_root}/latest_npi-results.json`
  );

  return {
    mainInfo: mainv4.map<MainInfo>(
      "info",
      ({ generated, created, created_by, date_resample, comment }) => {
        return {
          generated: generated ? new Date(generated) : undefined,
          created: created ? new Date(created) : undefined,
          created_by,
          date_resample,
          comment: comment ?? undefined,
        };
      }
    ),
    regions: mainv4.map("parse_regions", ({ regions }) => {
      return npi.map(
        "parse_npi_regions",
        (npiData) => {
          return Regions.from(regions, npiData.regions, data_root);
        },
        () => {
          return Regions.from(regions, {}, data_root);
        }
      );
    }),
    geoData: Thunk.fetchJson(`${STATIC_ROOT}/casemap-geo.json`),
    containments: Thunk.fetchJson(
      `${STATIC_ROOT}/data-testing-containments.json`
    ),
  };
}
