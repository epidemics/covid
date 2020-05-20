import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Alerts } from '../components/alerts';
import MitigationForm from './MitigationForm';

export function Page() {
  React.useEffect(() => {
    document.getElementById("containmentContent")?.classList.remove("d-none");
  });

  return (
    <>
      <Alerts />
      <MitigationForm />
      <hr />
    </>
  );
}

let $root = document.getElementById("react-mitigation-calculator");
if ($root) {
  ReactDOM.render(<Page />, $root);
}
