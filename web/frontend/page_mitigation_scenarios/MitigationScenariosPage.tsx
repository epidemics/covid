import * as moment from "moment";
import * as React from "react";
import * as ReactDOM from "react-dom";

import { Alerts } from "../components/alerts";
import { mitigationIntervalsToURL } from "../data/url_generator";
import MitigationForm, { Values } from "./MitigationForm";
import { Region } from "../models";
import { makeDataStore } from "../ds";

export const INTERVENTION_INTERVAL_IN_MONTHS = 1;

export function Page() {
  const [scenarioUrl, setScenarioUrl] = React.useState<string | undefined>(
    undefined
  );
  const visualizationAnchorEl = React.useRef<HTMLAnchorElement | null>(null);

  React.useEffect(() => {
    document.getElementById("containmentContent")?.classList.remove("d-none");
  });

  let regionsData: Region[];
  Promise.all([makeDataStore().regions]).then(
    ([regions]) => (regionsData = regions)
  );

  const handleFormResult = (result: Values) => {
    const intervalOffset = 5;
    const mitigations = result.mitigations
      .map((mitigation) => ({
        ...mitigation,
        transmissionReduction: parseInt(mitigation.transmissionReduction),
      }))
      .map((mitigation, index) => ({
        ...mitigation,
        timeRange: {
          begin: mitigation.timeRange.begin,
          end:
            index + 1 === result.mitigations.length
              ? moment(mitigation.timeRange.begin)
                  .add(INTERVENTION_INTERVAL_IN_MONTHS, "months")
                  .toDate()
              : result.mitigations[index + 1].timeRange.begin,
        },
        transmissionReduction: {
          begin: mitigation.transmissionReduction - intervalOffset,
          end: mitigation.transmissionReduction + intervalOffset,
        },
      }));
    let region = regionsData.find((e) => e.name === result.scenarioName);
    setScenarioUrl(
      mitigationIntervalsToURL(result.scenarioName, mitigations, region)
    );
    visualizationAnchorEl.current!.click();
  };

  return (
    <>
      <Alerts />
      <h1>Mitigation calculator</h1>

      <hr />
      <p>
        The following tool can be used to plan a theoretical timeline of
        interventions for a specific country. Each intervention consists of a
        package of measures, such as a ban on gatherings at different levels,
        that are configured using our Mitigation Calculator. The intervention
        then reduces the effective reproduction number to a certain level until
        the next intervention takes place. Once a timeline of interventions is
        configured, you can simulate the intervention timeline using the{" "}
        <a href="https://covid19-scenarios.org/">neherlab simulator</a> by
        clicking on the <strong>Run simulation button</strong>.
      </p>
      <p>
        For each intervention select the date at which it will start to take
        effect. Afterwards, you can select the measures in the intervention and
        their impact on estimated R value by clicking on the Measures & Impact
        button. The impact on the R values can be selected from the defined
        pre-sets (corresponding to low, medium and high compliance) or you can
        set the specific impact per each measure (custom compliance)
      </p>

      <hr />
      <MitigationForm onResult={handleFormResult} />
      <a
        ref={visualizationAnchorEl}
        href={scenarioUrl}
        style={{ visibility: "hidden" }}
        target="_blank"
      >
        link
      </a>
    </>
  );
}

let $root = document.getElementById("react-mitigation-scenarios");
if ($root) {
  ReactDOM.render(<Page />, $root);
}
