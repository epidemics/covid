export class RatesInfo {
  /** fraction of population that needs hospitalization */
  hospitalization: number;

  /** fraction of population that becomes critical */
  critial: number;

  /** case fatality rate, fraction of infected that die */
  cfr: number;

  private constructor(hosp: number, crit: number, cfr: number) {
    this.hospitalization = hosp;
    this.critial = crit;
    this.cfr = cfr;
  }

  static fromv4(obj: any): RatesInfo | null {
    if (obj) {
      return new RatesInfo(
        obj.Hospitalization,
        obj.Critical,
        obj.CaseFatalityRate
      );
    } else {
      return null;
    }
  }
}
