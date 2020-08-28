export namespace v4 {
  // Main file
  export interface Main {
    created: string;
    created_by: string;
    generated?: string;
    comment: string | null;
    date_resample: string;
    regions: Regions;
  }

  export interface NpiMain {
    created: string;
    created_by: string;
    generated?: string;
    comment: string | null;
    regions: NpiRegions;
  }

  export type Regions = { [code: string]: Region };
  export type NpiRegions = { [code: string]: NpiRegion | undefined };

  export type CurrentEstimate =
    | number
    | {
        Infectious_mean: number;
        Beta0?: number;
        Beta1?: number;
        Date?: string;
      };

  export interface NpiRegion {
    Name: string;
    data: NPIModel;
  }

  export interface Region {
    data: {
      Rates?: Rates;
      JohnsHopkins?: JohnsHopkins;
      Foretold?: Foretold;
      REstimates?: REstimates;
      Interventions?: Intervention[];
      Timezones: string[];
      AgeDist?: { [bracket: string]: number };
      TracesV3?: string;
    };
    data_url: string;
    Name: string;
    Level: string;
    CurrentEstimate: CurrentEstimate | null;
    OfficialName?: string;
    Population: NumberLike;
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

  export interface REstimates {
    Date: string[];
    MeanR: number[];
    StdR: number[];
  }

  export interface NPIModel {
    DailyInfectedCases_lower: number[];
    DailyInfectedCases_mean: number[];
    DailyInfectedCases_upper: number[];
    DailyInfectedDeaths_lower: number[];
    DailyInfectedDeaths_mean: number[];
    DailyInfectedDeaths_upper: number[];
    Date: string[];
    PredictedDeaths_lower: number[];
    PredictedDeaths_mean: number[];
    PredictedDeaths_upper: number[];
    PredictedNewCases_lower: number[];
    PredictedNewCases_mean: number[];
    PredictedNewCases_upper: number[];
    RecordedDeaths: (number | null)[];
    RecordedNewCases: (number | null)[];
    ExtrapolationDate: string;
  }

  export interface Intervention {
    type: string[];
    dateStart: string;
    dateEnd: string;
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
    models: Model;
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

  export type Model = {
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
