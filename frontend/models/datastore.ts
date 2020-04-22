import { Regions } from "./regions";
import * as React from "react";

export type DatastoreThunks = {
  regions: Thunk<Regions>;
  geoData: Thunk<any>;
  containments: Thunk<any>;
};

export class Datastore {
  constructor(private thunks: DatastoreThunks) {}

  get containments() {
    return this.thunks.containments;
  }

  get regions() {
    return this.thunks.regions;
  }

  get geoData() {
    return this.thunks.geoData;
  }
}

let i = 0;

export class Thunk<T> implements PromiseLike<T> {
  private name: string;
  private promise: Promise<T> | null = null;
  public result?: T;

  constructor(private thunk: () => Promise<T>, name?: string) {
    this.name = name ?? `thunk-${i}`;
    // console.info(`Created thunk ${this.name} (#${i++})`);
  }
  static fetch(input: RequestInfo, init?: RequestInit): Thunk<Response> {
    let name = typeof input === "string" ? input : undefined;
    return new Thunk(() => fetch(input, init), name);
  }

  static fetchThen<T>(
    input: RequestInfo,
    f: (obj: Response) => T | PromiseLike<T>
  ): Thunk<T> {
    let name = typeof input === "string" ? input : undefined;
    return new Thunk<T>(() => fetch(input).then(f), name);
  }

  static fetchJson<T = any>(input: RequestInfo, init?: RequestInit): Thunk<T> {
    let name = typeof input === "string" ? input : undefined;
    return new Thunk(() => fetch(input, init).then(res => res.json()), name);
  }

  poll(): Promise<T> {
    if (this.promise === null) {
      console.info(`Loading thunk ${this.name}`);
      this.promise = this.thunk().then(value => {
        this.result = value;
        return value;
      });
    }
    return this.promise;
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | PromiseLike<TResult1>)
      | null
      | undefined,
    onrejected?:
      | ((reason: any) => TResult2 | PromiseLike<TResult2>)
      | null
      | undefined
  ): PromiseLike<TResult1 | TResult2> {
    return this.poll().then(onfulfilled, onrejected);
  }

  map<V>(name: string, f: (v: T) => V | PromiseLike<V>): Thunk<V> {
    return new Thunk(() => this.poll().then(f), name);
  }
}

export function useThunk<T>(init: T, thunk: Thunk<T> | undefined | null): T {
  let [state, setState] = React.useState<T>(() => thunk?.result ?? init);
  React.useEffect(() => {
    let result = thunk?.result;
    if (result) {
      setState(result);
      return;
    }
    if (thunk) thunk.then(setState);
  }, [thunk]);
  return state;
}
