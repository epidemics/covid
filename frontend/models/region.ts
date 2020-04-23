import { Rates } from "./rates";
import { Estimation } from "./estimation";
import { Reported } from "./reported";
import { v4 } from "../../common/spec";
import { STATIC_ROOT } from "../../common/constants";
import { Thunk } from "./datastore";
import { Scenarios } from "./scenario";
import * as moment from "moment";

type Current = { infected?: number; beta0?: number; beta1?: number };

export interface Measure {
  tag: string;
  description: string;
  source: string;
  start_date: string;
  end_date: string | null;
  quantity?: number;
}

export class Region {
  public scenarios: Thunk<Scenarios>;
  public current: Current;
  public iso2: string | undefined;
  public iso3: string | undefined;
  public timezones: string[];
  public name: string;
  public population: number;
  public officialName: string | undefined;
  public rates?: Rates;
  public estimates?: Estimation;
  public reported?: Reported;

  private externalData: Thunk<ExternalData>;
  public measures: Measure[]; // TODO make private

  private constructor(public code: string, obj: v4.Region) {
    this.population = +obj.Population;
    this.current = parseCurrent(obj?.CurrentEstimate);
    this.iso2 = obj.CountryCode;
    this.iso3 = obj.CountryCodeISOa3;
    this.timezones = obj.data.Timezones;
    this.name = obj.Name;
    this.officialName = obj.OfficialName;

    let { Foretold, JohnsHopkins, Rates: rates, Countermeasures } = obj.data;

    this.measures = (Countermeasures ?? []).map(
      ({ tag, description, source, start_date, end_date, quantity }) => {
        return {
          tag,
          description,
          source,
          start_date,
          end_date: end_date ? end_date : null,
          quantity: quantity !== null ? +quantity : undefined,
        };
      }
    );

    this.rates = rates ? Rates.fromv4(rates) : undefined;
    this.estimates = Foretold ? Estimation.fromv4(Foretold) : undefined;
    this.reported = JohnsHopkins ? Reported.fromv4(JohnsHopkins) : undefined;

    this.externalData = Thunk.fetchThen(
      `${STATIC_ROOT}/${obj.data_url}`,
      (res) =>
        res.json().then((obj) => ExternalData.fromv4(obj, this.population))
    );

    this.scenarios = this.externalData.map(
      `scenarios ${this.code}, ${this.name}`,
      (obj) => {
        let out = obj.scenarios;
        if (!out) throw new Error("No scenarios found");
        return out;
      }
    );
  }

  // async getCountermeasures(
  //   tags: CountermeasureTags
  // ): Promise<Countermeasure[]> {
  //   return this.countermeasures;
  // }

  get customModelDescription() {
    return this.externalData.then((obj) => obj.modelDescription);
  }

  async getScenario(identifier: string | null | undefined | number) {
    return (await this.scenarios).get(identifier ?? 0);
  }

  async statistics(idx: string | null | undefined | number) {
    return (await this.getScenario(idx)).statistics;
  }

  static fromv4(code: string, obj: v4.Region) {
    return new Region(code, obj);
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
