import { v4 } from "../../common/spec";
import { Region } from "./region";

export type Regions = Array<Region>;

export const Regions = {
  fromv4(obj: v4.Regions): Regions {
    let regions: Regions = [];
    Object.keys(obj).forEach(code => {
      regions.push(Region.fromv4(code, obj[code]));
    });
    return regions;
  }
};
