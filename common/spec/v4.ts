export namespace v4 {
  // Main file
  export interface Main {
    created: string;
    created_by: string;
    comment?: string;
    date_resample: string;
    regions: Regions;
  }

  export type Regions = { [code: string]: Region };

  export interface Region {
    data: {
      Rates?: Rates;
      JohnsHopkins?: JohnsHopkins;
      Foretold?: Foretold;
      Timezones: string[];
      AgeDist?: { [bracket: string]: number };
      TracesV3: string;
    };
    data_url: string;
    Name: string;
    Level: string;
    CurrentEstimate: number;
    OfficialName?: string;
    Population?: string;
    Lat?: number;
    Lon?: number;
    M49Code?: string;
    ContinentCode?: string;
    SubregionCode?: string;
    CountryCode?: string;
    CountryCodeISOa3?: string;
  }

  export interface Rates {
    CaseFatalityRate: number;
    Critical: number;
    Hospitalization: number;
  }

  export interface JohnsHopkins {
    Date: string[];
    Recovered: Array<NumberLike>;
    Confirmed: Array<NumberLike>;
    Deaths: Array<NumberLike>;
    Active: Array<NumberLike>;
  }

  type NumberLike = string | number;

  export interface Foretold {
    Date: string[];
    Mean: Array<NumberLike>;
    Variance: Array<NumberLike>;
    "0.05": Array<NumberLike>;
    "0.50": Array<NumberLike>;
    "0.95": Array<NumberLike>;
  }

  export type Scenario = {
    group: string;
    name?: string;
    description?: string;
  };

  // Per country seperate file
  export interface RegionExternalData {
    models: ModelTraces;
    scenarios?: Array<Scenario>;
    ModelDescription?: string;
  }

  export type ModelTrace = {
    group: string;
    key: string;
    name: string;
    initial_infected: number;
    initial_exposed: number;
    infected: Array<number>;
    active: Array<number>;
    recovered: Array<number>;
  };

  export type ModelTraces = {
    date_index: string[];
    traces: Array<ModelTrace>;
    statistics: { [scenario: string]: ScenarioStats };
  };

  export type Stat = {
    mean: number;
    q05: number;
    q95: number;
  };

  export type ScenarioStats = { [variable: string]: Stat };
}
