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
  Recovered: number[];
  Confirmed: number[];
  Deaths: number[];
  Active: number[];
}

export interface Foretold {
  Date: string[];
  Mean: number[];
  Variance: number[];
  "0.05": number[];
  "0.50": number[];
  "0.95": number[];
}

export type Scenario = {
  id: string;
  name: string;
  description?: string;
};

// Per country seperate file
export interface RegionExternalData {
  models: ModelTraces;
  ModelDescription?: string;
  Scenarios?: Array<Scenario>;
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
};
