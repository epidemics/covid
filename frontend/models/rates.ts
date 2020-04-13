export class Rates {
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

  static fromv4(obj: any): Rates | undefined {
    if (obj) {
      return new Rates(obj.Hospitalization, obj.Critical, obj.CaseFatalityRate);
    }
  }
}
