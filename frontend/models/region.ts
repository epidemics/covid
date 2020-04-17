import { Rates } from "./rates";
import { Estimation } from "./estimation";
import { Reported } from "./reported";
import { v4, v3 } from "../../common/spec";
import { ModelTraces } from "./model_traces";
import { STATIC_ROOT } from "../../common/constants";
import { Thunk } from "./datastore";

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
    public currentInfected: number,
    public iso2: string | undefined,
    public iso3: string | undefined,
    public timezones: string[],
    public name: string,
    public population: number,
    public officialName: string | undefined,
    private externalData: Thunk<ExternalData>,
    public rates: Rates | undefined,
    public estimates: Estimation | undefined,
    public reported: Reported | undefined
  ) {}

  get modelTraces() {
    return this.externalData
      .poll()
      .then(({ getModelTraces }) => getModelTraces(this));
  }

  static fromv4(code: string, obj: v4.Region) {
    let { Foretold, JohnsHopkins, Rates: rates, TracesV3 } = obj.data;

    return new Region(
      code,
      obj.CurrentEstimate,
      obj.CountryCode,
      obj.CountryCodeISOa3,
      obj.data.Timezones,
      obj.Name,
      getPopulation(obj.data.AgeDist), // obj.Population
      obj.OfficialName,
      Thunk.fetchThen(`${STATIC_ROOT}/${TracesV3}`, res =>
        res.json().then(ExternalData.fromv3)
      ),
      // Thunk.fetchThen(`${STATIC_ROOT}/${obj.data_url}`, res =>
      //   res.json().then(ExternalData.fromv4)
      // ),
      rates ? Rates.fromv4(rates) : undefined,
      Foretold ? Estimation.fromv4(Foretold) : undefined,
      JohnsHopkins ? Reported.fromv4(JohnsHopkins) : undefined
    );
  }
}

interface ExternalData {
  getModelTraces: (region: Region) => ModelTraces;
}

const ExternalData = {
  fromv3(obj: v3.ExternalData): ExternalData {
    return {
      getModelTraces: function(region: Region) {
        return ModelTraces.fromv3(obj, region);
      }
    };
  },

  fromv4(obj: v4.ExternalData): ExternalData {
    return {
      getModelTraces: function(region: Region) {
        return ModelTraces.fromv4(obj.models, region);
      }
    };
  }
};
