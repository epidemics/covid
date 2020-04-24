import { v4 } from "../../common/spec";
import { formatSIInteger } from "../helpers";

const SCENARIO_COLORS: { [key: string]: string } = {
  "WEAK-WEAK": "#edcdab",
  "MEDIUM-WEAK": "#edb77e",
  "STRONG-WEAK": "#e97f0f",
  "WEAK-STRONG": "#9ac9d9",
  "MEDIUM-STRONG": "#5abbdb",
  "STRONG-STRONG": "#007ca6",
  "HIGHER-WEAK": "#edcdab",
  "EXPECTED-WEAK": "#edb77e",
  "LOWER-WEAK": "#e97f0f",
  "HIGHER-STRONG": "#9ac9d9",
  "EXPECTED-STRONG": "#5abbdb",
  "LOWER-STRONG": "#007ca6",
};

export interface Trace {
  x: string[];
  y: number[];
  text: string[];
  kind: string;
  scenario: string;
  name?: string;
  line: Partial<Plotly.ScatterLine>;
  hovertemplate?: string;
  legendgroup?: string;
  hoverlabel?: Partial<Plotly.HoverLabel>;
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

type Group = {
  max: number;
  traces: Array<Trace>;
};

export function getModelTraces(obj: v4.Model, population: number) {
  let dates = obj.date_index;
  let length = dates.length;
  let xrange: [string, string] = [dates[0], dates[length - 1]];

  let traces: Array<Trace> = [];

  let cumulative: Group = {
    max: -Infinity,
    traces: [],
  };

  let active: Group = {
    max: -Infinity,
    traces: [],
  };

  obj.traces.forEach((obj: v4.ModelTrace) => {
    let { name, group } = obj;

    function initTrace(kind: string): Trace {
      return {
        type: "scatter",
        name,
        scenario: group,
        kind,
        text: [],
        x: dates,
        y: [],
        line: {
          shape: "spline",
          smoothing: 0,
          color: SCENARIO_COLORS[obj.key.replace("_", "-")],
        },
        hovertemplate: "%{text}<br />%{y:.2p}",
        hoverlabel: { namelength: -1 },
      };
    }

    let cumulativeTrace = initTrace("cumulative");
    let activeTrace = initTrace("active");

    for (let i = 1; i < length - 1; i++) {
      let active = +obj.active[i];
      activeTrace.y.push(active);
      activeTrace.text.push(formatPop(active * population));

      let cumulative = +obj.active[i] + obj.recovered[i];
      cumulativeTrace.y.push(cumulative);
      cumulativeTrace.text.push(formatPop(cumulative * population));
    }
    active.max = Math.max(active.max, ...activeTrace.y);
    cumulative.max = Math.max(cumulative.max, ...cumulativeTrace.y);

    cumulative.traces.push(cumulativeTrace);
    active.traces.push(activeTrace);
  });

  return { active, cumulative, xrange };
}

export class ModelTraces {
  constructor(
    public traces: Trace[],
    public maxY: number,
    public xrange: [string, string]
  ) {}
}
