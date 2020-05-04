import { v4 } from "../../common/spec";

export class Rates {
  /** fraction of population that needs hospitalization */
  public hospitalization: number;

  /** fraction of population that becomes critical */
  public critial: number;

  /** case fatality rate, fraction of infected that die */
  public cfr: number;

  public constructor(obj: v4.Rates) {
    this.hospitalization = obj.Hospitalization;
    this.critial = obj.Critical;
    this.cfr = obj.CaseFatalityRate;
  }
}
