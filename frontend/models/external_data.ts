import { ModelTraces } from "./model_traces";
import { Region } from "./region";
import { STATIC_ROOT } from "../../common/constants";

export type ExternalDataFetcher = (this: Region) => Promise<ExternalData>;

export class ExternalData {
  private constructor(public modelTraces: ModelTraces) {}

  static fromv4(path: string): ExternalDataFetcher {
    return async function(this: Region) {
      let res = await fetch(`${STATIC_ROOT}/${path}`);
      let data = await res.json();
      return new ExternalData(ModelTraces.fromv4(data.models, this));
    };
  }

  static fromv3(path: string): ExternalDataFetcher {
    return async function(this: Region) {
      let res = await fetch(`${STATIC_ROOT}/${path}`);
      let data = await res.json();
      return new ExternalData(ModelTraces.fromv3(data, this));
    };
  }
}
