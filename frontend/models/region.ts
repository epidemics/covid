import { RatesInfo } from "./rates";
import { EstimationInfo } from "./estimation";
import { ReportedInfo } from "./reported";

function getPopulation(ageDist?: { [bracket: string]: number }): number {
  if (!ageDist) return 0;

  let population = 0;
  Object.keys(ageDist).forEach(bracket => {
    population += ageDist[bracket];
  });
  return population;
}

export class Region {
  private constructor(
    public key: string,
    public iso2: string,
    public iso3: string,
    public timezones: [string],
    public name: string,
    public population: number,
    public officialName: string,
    public dataUrl: string,
    public rates: RatesInfo | undefined,
    public estimates: EstimationInfo | undefined,
    public reported: ReportedInfo | undefined
  ) {}

  static fromv4(code: string, obj: any) {
    return new Region(
      code,
      obj.CountryCode,
      obj.CountryCodeISOa3,
      obj.data.Timezones,
      obj.Name,
      getPopulation(obj.data.AgeDist), // obj.Population
      obj.OfficialName,
      obj.data_url,
      RatesInfo.fromv4(obj.data.Rates),
      EstimationInfo.fromv4(obj.data.Foretold),
      ReportedInfo.fromv4(obj.data.JohnsHopkins)
    );
  }
}
