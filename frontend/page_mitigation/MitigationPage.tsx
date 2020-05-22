import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Alerts } from '../components/alerts';
import { mitigationIntervalsToURL } from '../data/url_generator';
import MitigationForm, { Values } from './MitigationForm';
import Result from './Result';

export function Page() {
  const [scenarioUrl, setScenarioUrl] = React.useState<string | undefined>(
    undefined
  );
  React.useEffect(() => {
    document.getElementById("containmentContent")?.classList.remove("d-none");
  });

  const handleFormResult = (result: Values) => {
    setScenarioUrl(
      mitigationIntervalsToURL(result.scenarioName, result.mitigations)
    );
  };

  return (
    <>
      <Alerts />
      <MitigationForm onResult={handleFormResult} />
      {scenarioUrl && <Result url={scenarioUrl} />}
      <hr />
    </>
  );
}

let $root = document.getElementById("react-mitigation-calculator");
if ($root) {
  ReactDOM.render(<Page />, $root);
}
