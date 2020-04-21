import * as moment from "moment";
import * as React from "react";
import { StorageDescriptor, useStorage } from "../storage_hook";
import { Moment } from "moment";

type Props = {
  /** The storage object to save the dismissal state */
  storage: Storage | null;
  /** A unique identifier used as the key for the local storage and HTML id */
  id: string;
  /** The alert is displayed regradless of dismissal state if the revision number increases */
  revision: number | string | null;
  /** Any object accepted by moment.js Moment.add() */
  dismissalDuration: any;
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
    dismissed.date.add(dismissalDuration).isBefore(moment());

  if (!shouldDisplay) return null;

  function dismiss() {
    console.log("Dismiss");
    setDismissed({
      date: moment(),
      revision: revision,
    });
  }

  if (shouldDisplay) {
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
  } else {
    return null;
  }
}
