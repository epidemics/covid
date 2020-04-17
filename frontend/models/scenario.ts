import { v4 } from "../../common/spec";

export interface Scenario {
  group: string;
  name?: string;
  description?: string;
  statistics?: ScenarioStatatistics;
}

export type Stat = v4.Stat;

export type ScenarioStatatistics = {
  totalInfected: Stat;
  maxActiveInfected: Stat;
};

export class Scenarios {
  private constructor(
    public keys: Array<string>,
    private dict: { [key: string]: Scenario }
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

  static fromv4(
    objs: Array<v4.Scenario>,
    statistics?: { [scenario: string]: v4.ScenarioStats }
  ) {
    let dict: { [key: string]: Scenario } = {};
    let keys: Array<string> = [];
    objs.forEach((scenario: Scenario) => {
      function readStat(obj: v4.ScenarioStats, key: string): Stat {
        let stat = obj[key];
        if (!stat) console.error(`Missing stat ${obj}:${key}`, obj);
        return stat;
      }

      if (statistics) {
        scenario.statistics = {
          maxActiveInfected: readStat(
            statistics[scenario.group],
            "MaxActiveInfected"
          ),
          totalInfected: readStat(statistics[scenario.group], "TotalInfected")
        };
      }

      dict[scenario.group] = scenario;
      keys.push(scenario.group);
    });
    return new Scenarios(keys, dict);
  }
}
