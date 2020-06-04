import { Rates } from "./rates";
import { Estimation } from "./estimation";
import { Reported } from "./reported";
import { v4 } from "../../common/spec";
import { Thunk } from "./datastore";
import { Scenarios } from "./scenario";
import { REstimates } from "./rEstimates";

type Current = {
  infected?: number;
  beta0?: number;
  beta1?: number;
  date?: Date;
};

function parseCurrent(obj: v4.CurrentEstimate | null) {
  if (obj == null) {
    return {};
  } else if (typeof obj == "object") {
    return {
      infected: obj.Infectious_mean,
      beta0: obj.Beta0,
      beta1: obj.Beta1,
      date: obj.Date ? new Date(obj.Date) : undefined,
    };
  } else {
    return { infected: obj };
  }
}

export class Region {
  public scenariosDaily: Thunk<Scenarios>;
  public current: Current;
  public iso2?: string;
  public iso3?: string;
  public timezones: string[];
  public name: string;
  public population: number;
  public officialName?: string;
  public externalData: Thunk<ExternalData>;
  public rates?: Rates;
  public estimates?: Estimation;
  public reported?: Reported;
  public rEstimates?: REstimates;

  public constructor(data_root: string, public code: string, obj: v4.Region) {
    let data = obj.data;

    this.population = +obj.Population;
    this.current = parseCurrent(obj.CurrentEstimate);
    this.iso2 = obj.CountryCode;
    this.iso3 = obj.CountryCodeISOa3;
    this.timezones = obj.data.Timezones;
    this.name = obj.Name;
    this.officialName = obj.OfficialName;
    this.externalData = Thunk.fetchThen(`${data_root}/${obj.data_url}`, (res) =>
      res.json().then((obj) => new ExternalData(obj, this.population))
    );

    if (data.Rates) this.rates = new Rates(data.Rates);

    if (data.Foretold) this.estimates = new Estimation(data.Foretold);

    if (data.JohnsHopkins) this.reported = new Reported(data.JohnsHopkins);

    if (data.REstimates) this.rEstimates = new REstimates(data.REstimates);

    this.scenariosDaily = this.externalData.map(
      `scenarios ${this.code}, ${this.name}`,
      (obj) => {
        let out = obj.scenarios;
        if (!out) throw new Error("No scenarios found");
        return out;
      }
    );
  }

  get customModelDescription() {
    return this.externalData.then((obj) => obj.modelDescription);
  }

  async getScenario(identifier: string | null | undefined | number) {
    return (await this.scenariosDaily).get(identifier ?? 0);
  }

  async statistics(idx: string | null | undefined | number) {
    return (await this.getScenario(idx)).statistics;
  }
}

class ExternalData {
  public modelDescription?: string;
  public scenarios?: Scenarios;

  constructor(obj: v4.RegionExternalData, population: number) {
    this.modelDescription = obj.ModelDescription;
    this.scenarios = new Scenarios(obj.scenarios!, obj.models, population);
  }
}
