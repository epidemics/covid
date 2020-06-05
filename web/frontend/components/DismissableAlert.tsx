import * as moment from "moment";
import * as React from "react";
import { StorageDescriptor, useStorage } from "../storage_hook";
import { Moment } from "moment";

export interface Alert {
  id: string;
  dismissalDuration: moment.DurationInputObject;
}

type Props = {
  /** The storage object to save the dismissal state */
  storage: Storage | null;
  /** A unique identifier used as the key for the local storage and HTML id */
  id: string;
  /** The alert is displayed regradless of dismissal state if the revision number increases */
  revision: string | null;
  /** Any object accepted by moment.js Moment.add() */
  dismissalDuration: moment.DurationInputObject;
  /** HTML class */
  className?: string;
};

export function DismissableAlert(props: React.PropsWithChildren<Props>) {
  const {
    id,
    storage,
    children,
    revision,
    dismissalDuration,
    className,
  } = props;

  const storageDescriptor: StorageDescriptor<{
    date: Moment;
    revision: string | number | null;
  }> = {
    key: id,
    serialize: (obj) => JSON.stringify(obj),
    deserialize: (raw) => {
      let obj = JSON.parse(raw);
      obj.date = moment(obj.date);
      if (!obj.date.isValid()) {
        throw new Error();
      }
      return obj;
    },
  };

  let [dismissed, setDismissed] = useStorage(storage, storageDescriptor);

  let shouldDisplay =
    !dismissed ||
    dismissed.revision !== revision ||
    moment().subtract(dismissalDuration).isAfter(dismissed.date);

  if (!shouldDisplay) return null;

  function dismiss() {
    setDismissed({
      date: moment(),
      revision: revision,
    });
  }

  return (
    <div
      id={id}
      className={`alert alert-dismissible ${className ?? ""}`}
      role="alert"
    >
      <button
        type="button"
        className="close"
        onClick={dismiss}
        aria-label="Close"
      >
        <span aria-hidden="true">&times;</span>
      </button>
      {children}
    </div>
  );
}
