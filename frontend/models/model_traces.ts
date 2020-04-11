import * as d3 from "d3";
import * as v4 from "./v4";

interface Trace {
  x: string[];
  y: number[];
  text: string[];
  customdata: {
    mitigation: string;
  };
  name: string;
  line: Partial<Plotly.ScatterLine>;
  hovertemplate: string;
  hoverlabel: any;
}

const formatPop = d3.format("3s");

export class ModelTraces {
  constructor(
    public traces: Trace[],
    public maxY: number,
    public xrange: [string, string]
  ) {}

  static fromv4(obj: v4.ModelTraces, population?: number): ModelTraces {
    console.log(obj);

    let dates = obj.date_index;
    let length = dates.length;
    let xrange: [string, string] = [dates[0], dates[length - 1]];

    let maxY = -Infinity;
    function makeTrace(obj: v4.ModelTrace) {
      let trace: Trace = {
        name: obj.name,
        customdata: {
          mitigation: obj.group
        },
        text: [],
        x: dates,
        y: [],
        line: {
          shape: "spline"
        },
        hovertemplate: "%{text}%{y:.2p}",
        hoverlabel: { namelength: -1 }
      };

      for (let i = 0; i < length; i++) {
        trace.y.push(obj.infected[i] * 1000);
        if (!population) {
          trace.text.push("");
        } else {
          trace.text.push(
            formatPop(obj.infected[i] * 1000 * population) + "<br />"
          );
        }
      }
      maxY = Math.max(maxY, ...trace.y);

      return trace;
    }

    let traces = obj.traces.map(makeTrace);

    return new ModelTraces(traces, maxY, xrange);
  }
}
