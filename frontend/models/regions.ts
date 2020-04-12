import * as v4 from "./v4";
import { Region } from "./region";

export type Regions = {
  [code: string]: Region;
};

export const Regions = {
  fromv4: (obj: v4.Root): Regions => {
    let regions: Regions = {};
    Object.keys(obj.regions).forEach(code => {
      regions[code] = Region.fromv4(code, obj.regions[code]);
    });
    return regions;
  }
};
