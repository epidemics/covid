import * as Plotly from "plotly.js";

export namespace v3 {
  export interface ModelTrace {
    hoverinfo: string;
    line: Partial<Plotly.ScatterLine>;
    hoverlabel: { namelength: -1 };
    opacity: number;
    name?: string;
    showlegend: boolean;
    x: Array<string>;
    y: Array<number>;
    type: "scatter";
  }

  export type ExternalData = ModelTraces;

  export interface ModelTraces {
    [mitigation: string]: Array<ModelTrace>;
  }
}
