import {stringify as url_encode} from 'jsurl';
import {stringify as query_encode} from "query-string";
import scenarios_raw from "./scenarios.json";

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
    const q = url_encode(object);
    const v = '1';
    const query = query_encode({ v, q });
    return `/?${query}`
}

export function mitigationIntervalsToURL(preset: string, mitigationIntervals: MitigationInterval[]): string {
    const scenarios = ((scenarios_raw as unknown) as Record<string, any>);
    //no need to clone since the mitigations are always overwritten, but it might be cleaner to do so
    let base_scenario = scenarios[preset];
    base_scenario['scenarioData']['data']['mitigation']['mitigationIntervals'] = mitigationIntervals;
    return dataToURL(base_scenario)
}
