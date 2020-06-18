import { v4 } from "../../common/spec";

export interface ReportDay {
  date: Date;
  active: number;
  confirmed: number;
  deaths: number;
  recovered: number;
}

export class Reported {
  public points: ReportDay[] = [];

  public constructor(obj: v4.JohnsHopkins) {
    let length = obj.Date.length;
    for (let i = 0; i < length; i++) {
      this.points.push({
        date: new Date(obj.Date[i]),
        recovered: +obj.Recovered[i],
        deaths: +obj.Deaths[i],
        active: +obj.Active[i],
        confirmed: +obj.Confirmed[i],
      });
    }
    this.points.sort(function (a, b): any {
      return a.date.getTime() - b.date.getTime();
    });
  }

  get last() {
    let i = this.points.length - 1;
    return this.points[i - 1];
  }

  get lastIncrement() {
    if (this.points.length < 2) return 0;

    let i = this.points.length - 1;
    return this.points[i].confirmed - this.points[i - 1].confirmed;
  }
}
