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
