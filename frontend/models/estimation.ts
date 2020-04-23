import { v4 } from "../../common/spec";

export interface EstimationPoint {
  date: Date;
  mean: number;
  variance: number;
  median: number;
  p05: number;
  p95: number;
}

function dateDiff(a: Date, b: Date) {
  return a.getTime() - b.getTime();
}

export class Estimation {
  now(): EstimationPoint | null {
    return this.at(new Date());
  }
  private constructor(public points: EstimationPoint[]) {}

  get last() {
    let i = this.points.length - 1;
    return this.points[i - 1];
  }

  at(date: Date): EstimationPoint | null {
    if (this.points.length <= 2) {
      return null;
    }

    function interpolate_(
      left: EstimationPoint,
      right: EstimationPoint
    ): EstimationPoint {
      let l = dateDiff(date, left.date);
      let r = dateDiff(right.date, date);
      let t = l + r;

      return {
        date,
        mean: (l * left.mean + r * right.mean) / t,
        variance: (l * left.variance + r * right.variance) / t,
        median: (l * left.median + r * right.median) / t,
        p05: (l * left.p05 + r * right.p05) / t,
        p95: (l * left.p95 + r * right.p95) / t,
      };
    }

    let left = this.points[0];
    if (left.date > date) return null;

    for (let i = 0; i < this.points.length - 1; i++) {
      let right = this.points[i + 1];

      if (date <= right.date) {
        return interpolate_(left, right);
      }

      left = right;
    }

    return null;
  }

  static fromv4(obj: v4.Foretold): Estimation | undefined {
    if (!obj) return;

    let points: EstimationPoint[] = [];
    let length = obj.Date.length;
    for (let i = 0; i < length; i++) {
      points.push({
        date: new Date(obj.Date[i]),
        mean: +obj.Mean[i],
        variance: +obj.Variance[i],
        median: +obj["0.50"][i],
        p05: +obj["0.05"][i],
        p95: +obj["0.95"][i],
      });
    }
    return new Estimation(points);
  }
}
