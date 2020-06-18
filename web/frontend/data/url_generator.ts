import { stringify as url_encode } from "jsurl";
import { stringify as query_encode } from "query-string";

import scenarios_raw from "./scenarios.json";
import { Region } from "../models";

export const COVID19_SCENARIO_DOMAIN = "https://covid19-scenarios.org";

export interface PercentageRange {
  begin: number;
  end: number;
}

export interface DateRange {
  begin: Date;
  end: Date;
}

export interface MitigationInterval {
  color: string;
  name: string;
  timeRange: DateRange;
  transmissionReduction: PercentageRange;
}

export function dataToURL(object: Record<string, any>): string {
  const json_object = JSON.parse(JSON.stringify(object));
  const q = url_encode(json_object);
  const v = "1";
  const query = query_encode({ v, q });
  return `${COVID19_SCENARIO_DOMAIN}/?${query}`;
}

const scenarios = (scenarios_raw as unknown) as Record<string, any>;

const testLag = 2;
export const scenarioNames = Object.keys(scenarios);

export function mitigationIntervalsToURL(
  preset: string,
  mitigationIntervals: MitigationInterval[],
  region: Region | undefined
): string {
  //no need to clone since the mitigations are always overwritten, but it might be cleaner to do so
  let base_scenario = scenarios[preset];

  if (region !== undefined && region.reported !== undefined) {
    let lastIncrement = region.reported.lastIncrement;
    let infectiousPeriodDays =
      base_scenario["scenarioData"]["data"]["epidemiological"][
        "infectiousPeriodDays"
      ];
    base_scenario["scenarioData"]["data"]["population"][
      "initialNumberOfCases"
    ] =
      region.reported.last.active +
      lastIncrement * (infectiousPeriodDays + testLag);
  }

  let today = new Date();
  today.setHours(0, 0, 0, 0);
  base_scenario["scenarioData"]["data"]["simulation"]["simulationTimeRange"][
    "begin"
  ] = today;

  base_scenario["scenarioData"]["data"]["mitigation"][
    "mitigationIntervals"
  ] = mitigationIntervals.map((interval) => {
    return {
      color: interval.color,
      name: interval.name,
      timeRange: {
        begin: interval.timeRange.begin,
        end: interval.timeRange.end,
      },
      transmissionReduction: {
        begin: interval.transmissionReduction.begin,
        end: interval.transmissionReduction.end,
      },
    };
  });
  return dataToURL(base_scenario);
}
