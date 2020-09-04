import { v4 } from '../../common/spec';

export class REstimates {
  public date: Date[];

  public meanR: number[];

  public stdR: number[];

  public enoughData: number[];

  public constructor(obj: v4.REstimates) {
    this.date = obj.Date.map((date) => new Date(date));
    this.meanR = obj.MeanR;
    this.stdR = obj.StdR;
    this.enoughData = obj.EnoughData;
  }
}
