import { v4 } from "../../common/spec";
import { getModelTraces, Trace } from "./model_traces";
import { Bounds } from "../components/graph-common";

export interface Scenario {
  group: string;
  name?: string;
  description?: string;
  statistics?: ScenarioStatatistics;
  tracesActive: Trace[];
  tracesCumulative: Trace[];
}

export type Stat = v4.Stat;

export type ScenarioStatatistics = {
  totalInfected: Stat;
  maxActiveInfected: Stat;
};

export class Scenarios {
  public keys: Array<string> = [];
  private dict: { [key: string]: Scenario } = {};
  public boundsActive: Bounds;
  public boundsCumulative: Bounds;

  constructor(objs: Array<v4.Scenario>, data: v4.Model, population: number) {
    objs.forEach((scenario: Scenario) => {
      scenario.tracesActive = [];
      scenario.tracesCumulative = [];

      function readStat(obj: v4.ScenarioStats, key: string): Stat {
        let stat = obj[key];
        if (!stat) console.error(`Missing stat ${obj}:${key}`, obj);
        return stat;
      }

      let stats = data.statistics?.[scenario.group];
      if (stats) {
        scenario.statistics = {
          maxActiveInfected: readStat(stats, "MaxActiveInfected"),
          totalInfected: readStat(stats, "TotalInfected"),
        };
      }

      this.dict[scenario.group] = scenario;
      this.keys.push(scenario.group);
    });

    let { active, cumulative, xrange } = getModelTraces(data, population);

    this.boundsCumulative = {
      x: xrange,
      y: [0, cumulative.max * 1.01],
    };
    this.boundsActive = {
      x: xrange,
      y: [0, active.max * 1.01],
    };

    active.traces.forEach((trace) => {
      this.dict[trace.scenario].tracesActive.push(trace);
    });

    cumulative.traces.forEach((trace) => {
      this.dict[trace.scenario].tracesCumulative.push(trace);
    });
  }

  get(keyOrIdx: string | number) {
    if (typeof keyOrIdx === "string") {
      return this.dict[keyOrIdx];
    } else {
      return this.dict[this.keys[keyOrIdx]];
    }
  }

  forEach(f: (scenario: Scenario, key: string) => void) {
    this.keys.forEach((key) => f(this.dict[key], key));
  }

  map(f: (scenario: Scenario, key: string) => void) {
    return this.keys.map((key) => f(this.dict[key], key));
  }
}
