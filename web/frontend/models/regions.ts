import { v4 } from "../../common/spec";
import { Region } from "./region";

export type Regions = Array<Region>;

export const Regions = {
  from(obj: v4.Regions, npiRegions: v4.NpiRegions, data_root: string): Regions {
    let regions: Regions = [];
    Object.keys(obj).forEach((code) => {
      const region = obj[code];
      let npiRegion = npiRegions[code];

      if (
        npiRegion &&
        Object.keys(npiRegion.data).length === 0 &&
        npiRegion.data.constructor === Object
      ) {
        npiRegion = undefined;
      }

      regions.push(new Region(data_root, code, region, npiRegion));
    });
    return regions;
  },
};
