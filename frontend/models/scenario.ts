import { v4 } from "../../common/spec";
import { getModelTraces, Trace } from "./model_traces";
import { Bounds } from "../components/graph-common";

export interface Scenario {
  group: string;
  name?: string;
  description?: string;
  statistics?: ScenarioStatatistics;
  traces: Trace[];
}

export type Stat = v4.Stat;

export type ScenarioStatatistics = {
  totalInfected: Stat;
  maxActiveInfected: Stat;
};

export class Scenarios {
  private constructor(
    public keys: Array<string>,
    private dict: { [key: string]: Scenario },
    public bounds: Bounds
  ) {}

  get(keyOrIdx: string | number) {
    if (typeof keyOrIdx === "string") {
      return this.dict[keyOrIdx];
    } else {
      return this.dict[this.keys[keyOrIdx]];
    }
  }

  forEach(f: (scenario: Scenario, key: string) => void) {
    this.keys.forEach(key => f(this.dict[key], key));
  }

  map(f: (scenario: Scenario, key: string) => void) {
    return this.keys.map(key => f(this.dict[key], key));
  }

  static fromv4(objs: Array<v4.Scenario>, data: v4.Model, population: number) {
    let dict: { [key: string]: Scenario } = {};
    let keys: Array<string> = [];
    objs.forEach((scenario: Scenario) => {
      scenario.traces = [];

      function readStat(obj: v4.ScenarioStats, key: string): Stat {
        let stat = obj[key];
        if (!stat) console.error(`Missing stat ${obj}:${key}`, obj);
        return stat;
      }

      let { statistics } = data;

      if (data.statistics) {
        scenario.statistics = {
          maxActiveInfected: readStat(
            data.statistics[scenario.group],
            "MaxActiveInfected"
          ),
          totalInfected: readStat(statistics[scenario.group], "TotalInfected")
        };
      }

      dict[scenario.group] = scenario;
      keys.push(scenario.group);
    });

    let { traces, maxY, xrange } = getModelTraces(data, population);

    let bounds: Bounds = {
      x: xrange,
      y: [0, maxY * 1.01]
    };

    traces.forEach(trace => {
      dict[trace.scenario].traces.push(trace);
    });

    return new Scenarios(keys, dict, bounds);
  }
}
