import { v4 } from "../../spec";

export class CapacityInfo {
  private constructor(
    public capacityActivePercent: number,
    public capacityNewInfectionsPer1000: number,
    public criticalBedsPer100k: number,
    public source: string,
    public year: number
  ) {}

  static fromv4(capacity: v4.Capacity) {
    return new CapacityInfo(
      capacity.CapacityActiveInfectionPercent,
      capacity.CapacityNewInfectionsPerDayPer1000,
      capacity.CriticalBedsPer100k,
      capacity.Source,
      Math.round(capacity.Year)
    );
  }
}
