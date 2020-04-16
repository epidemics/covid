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

const ONSET_TO_DEATH = 10;

export class Region {
  private _modelTraces: Thunk<ModelTraces>;

  private constructor(
    public key: string,
    public iso2: string | undefined,
    public iso3: string | undefined,
    public timezones: string[],
    public name: string,
    public population: number,
    public officialName: string | undefined,
    _externalData: Thunk<ExternalData>,
    public rates: Rates | undefined,
    public estimates: Estimation | undefined,
    public reported: Reported | undefined
  ) {
    this._modelTraces = _externalData.map(({ getModelTraces }) =>
      getModelTraces(this)
    );
  }

  get modelTraces() {
    return this._modelTraces.poll();
  }

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
    let { Foretold, JohnsHopkins, Rates: rates, TracesV3 } = obj.data;

    return new Region(
      code,
      obj.CountryCode,
      obj.CountryCodeISOa3,
      obj.data.Timezones,
      obj.Name,
      getPopulation(obj.data.AgeDist), // obj.Population
      obj.OfficialName,
      Thunk.fetchJson(`${STATIC_ROOT}/${TracesV3}`).map(ExternalData.fromv3),
      //Thunk.fetchJson(`${STATIC_ROOT}/${obj.data_url}`).map(ExternalData.fromv4),
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
