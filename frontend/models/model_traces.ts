import { v4, v3 } from "../../common/spec";
import { formatSIInteger } from "../helpers";
import * as d3 from "d3";
import { Region } from "./region";
import * as moment from "moment";

const SCNARIO_COLORS = {
  "WEAK-WEAK": "#edcdab",
  "MEDIUM-WEAK": "#edb77e",
  "STRONG-WEAK": "#e97f0f",
  "WEAK-STRONG": "#9ac9d9",
  "MEDIUM-STRONG": "#5abbdb",
  "STRONG-STRONG": "#007ca6"
};

interface Trace {
  x: string[];
  y: number[];
  text: string[];
  customdata: {
    mitigation: string;
  };
  name?: string;
  line: Partial<Plotly.ScatterLine>;
  hovertemplate?: string;
  legendgroup?: string;
  hoverlabel?: any;
  type: "scatter";
}

const formatPop = formatSIInteger(3);

function pad(number: number) {
  if (number < 10) {
    return `0${number}`;
  }
  return number;
}

function show(date: Date) {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
    date.getUTCDate()
  )}`;
}

export class ModelTraces {
  constructor(
    public traces: Trace[],
    public maxY: number,
    public xrange: [string, string]
  ) {}

  static fromv4(obj: v4.ModelTraces, region: Region): ModelTraces {
    console.log(obj);

    let dates = obj.date_index;
    let length = dates.length;
    let xrange: [string, string] = [dates[0], dates[length - 1]];

    let maxY = -Infinity;
    function makeTrace(obj: v4.ModelTrace) {
      let trace: Trace = {
        type: "scatter",
        name: obj.name,
        customdata: {
          mitigation: obj.group
        },
        text: [],
        x: dates,
        y: [],
        line: {
          shape: "spline",
          color: SCNARIO_COLORS[obj.key]
        },
        hovertemplate: "%{text}<br />%{y:.2p}",
        hoverlabel: { namelength: -1 }
      };

      let initial_infected = region.estimates!.at(
        moment(dates[0])
          .add({ days: -7 })
          .toDate()
      )!.mean;
      console.log(initial_infected);

      let cummulative = initial_infected / region.population;
      for (let i = 0; i < length; i++) {
        cummulative += (obj.infected[i] - obj.recovered[i]) * 1000;

        trace.y.push(cummulative);
        trace.text.push(formatPop(cummulative * region.population));
      }
      maxY = Math.max(maxY, ...trace.y);

      return trace;
    }

    let traces = obj.traces.map(makeTrace);

    return new ModelTraces(traces, maxY, xrange);
  }

  static fromv3(obj: v3.ModelTraces, region: Region): ModelTraces {
    let traces: Trace[] = [];
    let maxY = -Infinity;
    Object.keys(obj).forEach(mitigation => {
      let group = obj[mitigation];
      group.forEach((obj: v3.ModelTrace) => {
        let trace: Trace = {
          customdata: { mitigation },
          text: [],
          ...obj
        };

        trace.legendgroup = obj.line.color as any;

        if (obj.hoverinfo !== "skip") {
          trace.hoverlabel = { namelength: -1 };
          trace.hovertemplate = "%{text}<br />%{y:.2p}";
        }

        let length = trace.y.length;

        for (let i = 0; i < length; i++) {
          let y = trace.y[i] / 1000;
          maxY = Math.max(maxY, y);
          trace.y[i] = y;
          trace.text.push(formatPop(y * region.population));
        }

        // When x has length 1, extend it to a day sequence of len(y) days
        if (trace.x.length === 1) {
          let xStart = new Date(trace.x[0]);
          trace.x[0] = show(xStart);
          for (let i = 1; i < length; i++) {
            trace.x.push(show(d3.timeDay.offset(xStart, i)));
          }
        }

        traces.push(trace);
      });
    });

    let xrange: [string, string] = [
      traces[0].x[0],
      traces[0].x[traces[0].x.length - 1]
    ];
    return { traces, maxY, xrange };
  }
}
