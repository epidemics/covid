import * as React from "react";

export type StorageDescriptor<T> = {
  key: string;
  serialize: (obj: T) => string;
  deserialize: (raw: string) => T;
};

export function useStorage<T>(
  storage_: Storage | null,
  { key, serialize, deserialize }: StorageDescriptor<T>
): [T | undefined, React.Dispatch<React.SetStateAction<T>>] {
  if (!storage_) {
    return [undefined, _ => {}];
  }

  // so that Typescript realize that it is can not be undefined
  let storage = storage_;

  function initialState(): T | undefined {
    let raw = storage.getItem(key);
    if (raw === null) {
      return;
    }

    let obj;
    try {
      obj = deserialize(raw);
    } catch {
      // the stored item is somehow invalid, remove it
      storage.removeItem(key);
      return;
    }

    return obj;
  }

  let [state, setState] = React.useState(initialState);

  // whenever the state changes
  React.useEffect(() => {
    console.log("Trigger action", state);

    if (state) {
      storage.setItem(key, serialize(state));
    } else {
      storage.removeItem(key);
    }
  }, [state]);

  return [state, setState];
}
