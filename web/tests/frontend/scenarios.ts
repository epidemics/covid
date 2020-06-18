import { expect } from "chai";
import { describe, it } from "mocha";

import * as url_generator from "../../frontend/data/url_generator";

describe("scenarios", () => {
  describe("scenarioNames", () => {
    expect(url_generator.scenarioNames).to.contain("Czechia");
  });
  describe("mitigationIntervalsToURL", () => {
    it("with mitigation intervals", () => {
      const interventionName = "Intervention";
      const mitigationIntervals: url_generator.MitigationInterval[] = [
        {
          color: "#fff",
          name: interventionName,
          timeRange: {
            begin: new Date("2020-03-04"),
            end: new Date("2020-04-04"),
          },
          transmissionReduction: { begin: 50, end: 70 },
        },
      ];
      const urlString = url_generator.mitigationIntervalsToURL(
        "Czechia",
        mitigationIntervals,
        undefined
      );
      expect(urlString).to.be.an("string").that.includes(interventionName);
    });
    it("with empty intervals", () => {
      const mitigationIntervals: url_generator.MitigationInterval[] = [];
      const urlString = url_generator.mitigationIntervalsToURL(
        "Czechia",
        mitigationIntervals,
        undefined
      );
      expect(urlString).to.be.an("string");
    });
  });
});
