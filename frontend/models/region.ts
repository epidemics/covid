import { Rates } from "./rates";
import { Estimation } from "./estimation";
import { Reported } from "./reported";
import { v4 } from "../../common/spec";
import { STATIC_ROOT } from "../../common/constants";
import { Thunk } from "./datastore";
import { Scenarios } from "./scenario";

type Current = { infected?: number; beta0?: number; beta1?: number };

export class Region {
  public scenariosDaily: Thunk<Scenarios>;

  private constructor(
    public code: string,
    public current: Current,
    public iso2: string | undefined,
    public iso3: string | undefined,
    public timezones: string[],
    public name: string,
    public population: number,
    public officialName: string | undefined,
    public externalData: Thunk<ExternalData>,
    public rates: Rates | undefined,
    public estimates: Estimation | undefined,
    public reported: Reported | undefined
  ) {
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

  static fromv4(code: string, obj: v4.Region) {
    let { Foretold, JohnsHopkins, Rates: rates } = obj.data;
    let population = +obj.Population;
    return new Region(
      code,
      parseCurrent(obj?.CurrentEstimate),
      obj.CountryCode,
      obj.CountryCodeISOa3,
      obj.data.Timezones,
      obj.Name,
      population, // obj.Population
      obj.OfficialName,
      // Thunk.fetchThen(`${STATIC_ROOT}/${obj.data.TracesV3}`, res =>
      //   res.json().then(ExternalData.fromv3)
      // ),
      Thunk.fetchThen(`${STATIC_ROOT}/${obj.data_url}`, (res) =>
        res.json().then((obj) => ExternalData.fromv4(obj, population))
      ),
      rates ? Rates.fromv4(rates) : undefined,
      Foretold ? Estimation.fromv4(Foretold) : undefined,
      JohnsHopkins ? Reported.fromv4(JohnsHopkins) : undefined
    );
  }
}

function parseCurrent(obj: v4.CurrentEstimate | null) {
  if (obj == null) {
    return {};
  } else if (typeof obj == "object") {
    return {
      infected: obj.Infectious_mean,
      beta0: obj.Beta0,
      beta1: obj.Beta1,
    };
  } else {
    return { infected: obj };
  }
}

interface ExternalData {
  modelDescription?: string;
  scenarios?: Scenarios;
}

const ExternalData = {
  fromv4(obj: v4.RegionExternalData, population: number): ExternalData {
    return {
      modelDescription: obj.ModelDescription,
      scenarios: Scenarios.fromv4(obj.scenarios!, obj.models, population),
    };
  },
};
