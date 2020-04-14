import { v4 } from "../../common/spec";

export interface ReportDay {
  date: Date;
  active: number;
  confirmed: number;
  deaths: number;
  recovered: number;
}

export class Reported {
  private constructor(public points: ReportDay[]) {}

  get last() {
    let i = this.points.length - 1;
    return this.points[i - 1];
  }

  static fromv4(obj: v4.JohnsHopkins): Reported | undefined {
    if (!obj) return;

    let points: ReportDay[] = [];
    let length = obj.Date.length;
    for (let i = 0; i < length; i++) {
      points.push({
        date: new Date(obj.Date[i]),
        recovered: obj.Recovered[i],
        deaths: obj.Deaths[i],
        active: obj.Active[i],
        confirmed: obj.Confirmed[i]
      });
    }
    return new Reported(points);
  }
}
