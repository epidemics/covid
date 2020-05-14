import { v4 } from "../../common/spec";
import { Region } from "./region";

export type Regions = Array<Region>;

export const Regions = {
  from(obj: v4.Regions, data_root: string): Regions {
    let regions: Regions = [];
    Object.keys(obj).forEach((code) => {
      regions.push(new Region(data_root, code, obj[code]));
    });
    return regions;
  },
};
