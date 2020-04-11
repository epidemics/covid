import { RatesInfo } from "./rates";
import { EstimationInfo } from "./estimation";
import { ReportedInfo } from "./reported";

export class Region {
  private constructor(
    public key: string,
    public iso2: string,
    public iso3: string,
    public timezones: [string],
    public name: string,
    public population: null | number,
    public officialName: string,
    public dataUrl: string,
    public rates: RatesInfo | null,
    public estimates: EstimationInfo | null,
    public reported: ReportedInfo | null
  ) {}

  static fromv4(code: string, obj: any) {
    return new Region(
      code,
      obj.CountryCode,
      obj.CountryCodeISOa3,
      obj.data.Timezones,
      obj.Name,
      obj.Population,
      obj.OfficialName,
      obj.data_url,
      RatesInfo.fromv4(obj.data.Rates),
      EstimationInfo.fromv4(obj.data.Foretold),
      ReportedInfo.fromv4(obj.data.JohnsHopkins)
    );
  }
}
