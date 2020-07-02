import { v4 } from "../../common/spec";

export class NPIModel {
  public date: Date[];
  public dailyInfectedCasesLower: number[];
  public dailyInfectedCasesMean: number[];
  public dailyInfectedCasesUpper: number[];
  public dailyInfectedDeathsLower: number[];
  public dailyInfectedDeathsMean: number[];
  public dailyInfectedDeathsUpper: number[];
  public predictedDeathsLower: number[];
  public predictedDeathsMean: number[];
  public predictedDeathsUpper: number[];
  public predictedNewCasesLower: number[];
  public predictedNewCasesMean: number[];
  public predictedNewCasesUpper: number[];
  public recordedDeaths: (number | null)[];
  public recordedNewCases: (number | null)[];

  public constructor(obj: v4.NPIModel) {
    this.date = obj.Date.map((date: string) => new Date(date));
    this.dailyInfectedCasesLower = obj.DailyInfectedCases_lower;
    this.dailyInfectedCasesMean = obj.DailyInfectedCases_mean;
    this.dailyInfectedCasesUpper = obj.DailyInfectedCases_upper;
    this.dailyInfectedDeathsLower = obj.DailyInfectedDeaths_lower;
    this.dailyInfectedDeathsMean = obj.DailyInfectedDeaths_mean;
    this.dailyInfectedDeathsUpper = obj.DailyInfectedDeaths_upper;
    this.predictedDeathsLower = obj.PredictedDeaths_lower;
    this.predictedDeathsMean = obj.PredictedDeaths_mean;
    this.predictedDeathsUpper = obj.PredictedDeaths_upper;
    this.predictedNewCasesLower = obj.PredictedNewCases_lower;
    this.predictedNewCasesMean = obj.PredictedNewCases_mean;
    this.predictedNewCasesUpper = obj.PredictedNewCases_upper;
    this.recordedDeaths = obj.RecordedDeaths;
    this.recordedNewCases = obj.RecordedNewCases;
  }
}
