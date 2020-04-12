export type ModelTrace = {
  group: string;
  key: string;
  name: string;
  infected: Array<number>;
  recovered: Array<number>;
};

export type ModelTraces = {
  date_index: string[];
  traces: Array<ModelTrace>;
};

export interface Root {
  regions: Regions;
}

type Region = any;
export type Regions = {
  [code: string]: Region;
};
