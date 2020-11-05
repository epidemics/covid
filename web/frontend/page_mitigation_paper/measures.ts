import npi_model_raw from "./npi_model.json";
import { mean, quantileSeq } from "mathjs";

const npi_model = (npi_model_raw as unknown) as Record<string, Array<number>>;

export interface Measure {
  name: string;
  mean: number;
  p90: number;
  implies?: Array<{ key: number; value?: number }>;
}

export interface MeasureGroup {
  name: string;
  items: Array<Measure>;
}

// the range of all the sliders
export const range = { min: 0.25, max: 1.25 };
export const changeLimit = { min: -0.2, max: 0.2 };

export const serialInterval = 6.5;

// the measures
export const measures: Array<Measure | MeasureGroup> = [
  {
    name: "Gatherings limited to...",
    items: [
      {
        name: "1000 people or less",
        mean: mean(npi_model["Gatherings limited to...:1000 people or less"]),
        p90: quantileSeq(
          npi_model["Gatherings limited to...:1000 people or less"],
          0.9
        ) as number,
      },
      {
        name: "100 people or less",
        mean: mean(npi_model["Gatherings limited to...:100 people or less"]),
        p90: quantileSeq(
          npi_model["Gatherings limited to...:100 people or less"],
          0.9
        ) as number,
      },
      {
        name: "10 people or less",
        mean: mean(npi_model["Gatherings limited to...:10 people or less"]),
        p90: quantileSeq(
          npi_model["Gatherings limited to...:10 people or less"],
          0.9
        ) as number,
      },
    ],
  },
  {
    name: "Business suspended",
    items: [
      {
        name: "Some",
        mean: mean(npi_model["Business suspended:Some"]),
        p90: quantileSeq(npi_model["Business suspended:Some"], 0.9) as number,
      },
      {
        name: "Many",
        mean: mean(npi_model["Business suspended:Many"]),
        p90: quantileSeq(npi_model["Business suspended:Many"], 0.9) as number,
      },
    ],
  },
  {
    name: "School and University Closure",
    mean: mean(npi_model["School and University Closure"]),
    p90: quantileSeq(npi_model["School and University Closure"], 0.9) as number,
  },
  {
    name: "Stay Home Order (with exemptions)",
    mean: mean(npi_model["Stay Home Order (with exemptions)"]),
    p90: quantileSeq(
      npi_model["Stay Home Order (with exemptions)"],
      0.9
    ) as number,
    implies: [{ key: 1, value: 3 }, { key: 2, value: 2 }, { key: 3 }],
  },
];
