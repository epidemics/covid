import { RatesInfo } from "./rates";
import { EstimationInfo } from "./estimation";
import { ReportedInfo } from "./reported";
import { v4 } from "../../spec";

function getPopulation(ageDist?: { [bracket: string]: number }): number {
  if (!ageDist) return 0;

  let population = 0;
  Object.keys(ageDist).forEach(bracket => {
    population += ageDist[bracket];
  });
  return population;
}

const ONSET_TO_DEATH = 10;

export class Region {
  private constructor(
    public key: string,
    public iso2: string | undefined,
    public iso3: string | undefined,
    public timezones: string[],
    public name: string,
    public population: number,
    public officialName: string | undefined,
    public dataUrl: string,
    public dataUrlV3: string,
    public rates: RatesInfo | undefined,
    public estimates: EstimationInfo | undefined,
    public reported: ReportedInfo | undefined
  ) {}

  currentActiveInfected(): number | void {
    // default to fortold mean estimate
    let est = this.estimates?.now()?.mean;
    if (est) return est;

    // otherwise use this
    let cfr = this.rates?.cfr;
    let reports = this.reported?.points;
    if (!cfr || !reports) return;

    let l = reports.length;
    let deathsNow = reports[l - 1].deaths + 0.001; // add epsilon to prevent NaN's
    let retrodictedInfected = deathsNow / cfr;
    let growthSinceThen = Math.min(
      deathsNow / reports[l - ONSET_TO_DEATH].deaths,
      4
    );
    let cases = Math.max(
      retrodictedInfected * growthSinceThen,
      reports[l - 1].confirmed
    );
    return cases - reports[l - 1].recovered;
  }

  static fromv4(code: string, obj: v4.Region) {
    let { Foretold, JohnsHopkins } = obj.data;

    return new Region(
      code,
      obj.CountryCode,
      obj.CountryCodeISOa3,
      obj.data.Timezones,
      obj.Name,
      getPopulation(obj.data.AgeDist), // obj.Population
      obj.OfficialName,
      obj.data_url,
      obj.data.TracesV3,
      RatesInfo.fromv4(obj.data.Rates),
      Foretold ? EstimationInfo.fromv4(Foretold) : undefined,
      JohnsHopkins ? ReportedInfo.fromv4(JohnsHopkins) : undefined
    );
  }
}
