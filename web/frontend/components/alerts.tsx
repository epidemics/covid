import { DismissableAlert } from "./DismissableAlert";
import * as React from "react";

export function Alerts() {
  if (!ALERTS || ALERTS.length == 0) {
    return null;
  }

  let {
    dismissalDuration,
    storage: storageName,
    id,
    revision,
    content,
  } = ALERTS[0];

  let storage =
    storageName === "local" ? window.localStorage : window.sessionStorage;

  return (
    <DismissableAlert
      className="alert-banner"
      storage={storage}
      dismissalDuration={dismissalDuration}
      id={id}
      revision={revision}
    >
      <p dangerouslySetInnerHTML={{ __html: content }} />
    </DismissableAlert>
  );
}
