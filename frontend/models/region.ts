import { Rates } from "./rates";
import { Estimation } from "./estimation";
import { Reported } from "./reported";
import { v4, v3 } from "../../common/spec";
import { ModelTraces } from "./model_traces";
import { STATIC_ROOT } from "../../common/constants";
import { Thunk } from "./datastore";
import { Scenarios } from "./scenario";

function getPopulation(ageDist?: { [bracket: string]: number }): number {
  if (!ageDist) return 0;

  let population = 0;
  Object.keys(ageDist).forEach(bracket => {
    population += ageDist[bracket];
  });
  return population;
}

export class Region {
  private _modelTraces: Thunk<ModelTraces>;

  private constructor(
    public code: string,
    public currentInfected: number,
    public iso2: string | undefined,
    public iso3: string | undefined,
    public timezones: string[],
    public name: string,
    public population: number,
    public officialName: string | undefined,
    private _externalData: Thunk<ExternalData>,
    public rates: Rates | undefined,
    public estimates: Estimation | undefined,
    public reported: Reported | undefined
  ) {
    this._modelTraces = _externalData.map(
      `model-traces ${code}, ${name}`,
      ({ getModelTraces }) => getModelTraces(this)
    );
  }

  get externalData() {
    return this._externalData.poll();
  }

  get modelTraces() {
    return this._modelTraces.poll();
  }

  get customModelDescription() {
    return this.externalData.then(obj => obj.modelDescription);
  }

  get scenarios() {
    return this.externalData.then(obj => {
      let out = obj.scenarios;
      if (!out) throw new Error("No scenarios found");
      return out;
    });
  }

  async getScenario(identifier: string | null | undefined | number) {
    return (await this.scenarios).get(identifier ?? 0);
  }

  async statistics(idx: string | null | undefined | number) {
    return (await this.getScenario(idx)).statistics;
  }

  static fromv4(code: string, obj: v4.Region) {
    let { Foretold, JohnsHopkins, Rates: rates } = obj.data;

    return new Region(
      code,
      obj.CurrentEstimate,
      obj.CountryCode,
      obj.CountryCodeISOa3,
      obj.data.Timezones,
      obj.Name,
      getPopulation(obj.data.AgeDist), // obj.Population
      obj.OfficialName,
      // Thunk.fetchThen(`${STATIC_ROOT}/${obj.data.TracesV3}`, res =>
      //   res.json().then(ExternalData.fromv3)
      // ),
      Thunk.fetchThen(`${STATIC_ROOT}/${obj.data_url}`, res =>
        res.json().then(ExternalData.fromv4)
      ),
      rates ? Rates.fromv4(rates) : undefined,
      Foretold ? Estimation.fromv4(Foretold) : undefined,
      JohnsHopkins ? Reported.fromv4(JohnsHopkins) : undefined
    );
  }
}

interface ExternalData {
  getModelTraces: (region: Region) => ModelTraces;
  modelDescription?: string;
  scenarios?: Scenarios;
}

const ExternalData = {
  fromv3(obj: v3.ExternalData): ExternalData {
    return {
      getModelTraces: function(region: Region) {
        return ModelTraces.fromv3(obj, region);
      }
    };
  },

  fromv4(obj: v4.RegionExternalData): ExternalData {
    return {
      getModelTraces: function(region: Region) {
        return ModelTraces.fromv4(obj.models, region);
      },
      modelDescription: obj.ModelDescription,
      scenarios: Scenarios.fromv4(obj.scenarios!, obj.models.statistics)
    };
  }
};
