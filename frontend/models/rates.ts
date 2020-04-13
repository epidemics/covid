export class RatesInfo {
  /** fraction of population that needs hospitalization */
  hospitalization: number;

  /** fraction of population that becomes critical */
  critical: number;

  /** case fatality rate, fraction of infected that die */
  cfr: number;

  private constructor(hosp: number, crit: number, cfr: number) {
    this.hospitalization = hosp;
    this.critical = crit;
    this.cfr = cfr;
  }

  static fromv4(obj: any): RatesInfo | undefined {
    if (obj) {
      return new RatesInfo(
        obj.Hospitalization,
        obj.Critical,
        obj.CaseFatalityRate
      );
    }
  }
}
