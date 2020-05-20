import { expect } from "chai";

import { describe, it } from "mocha";
import { mitigationIntervalsToURL, MitigationInterval } from "../../frontend/data/scenarios";

describe('scenarios', () => {
    describe('mitigationIntervalsToURL', () => {
        it('with mitigation intervals', () => {
            const interventionName = "Intervention #1";
            const mitigationIntervals: MitigationInterval[] = [
                {
                    color: "black",
                    name: interventionName,
                    timeRange: {begin: new Date("2020-03-04"), end: new Date("2020-04-04")},
                    transmissionReduction: {begin: 50, end: 70}
                }
            ];
            const urlString = mitigationIntervalsToURL("Czechia", mitigationIntervals);
            console.log(urlString);
            expect(urlString).to.be.an('string').that.includes(interventionName);
        });
        it('with empty intervals', () => {
            const mitigationIntervals: MitigationInterval[] = [];
            const urlString = mitigationIntervalsToURL("Czechia", mitigationIntervals);
            expect(urlString).to.be.an('string');
        })
    })
});
