import npi_model_raw from "./npi_model.json";
import {median, quantileSeq } from "mathjs";

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
        mean: median(npi_model["Gatherings limited to...:1000 people or less"]),
        p90: quantileSeq(
          npi_model["Gatherings limited to...:1000 people or less"],
          0.9
        ) as number,
      },
      {
        name: "100 people or less",
        mean: median(npi_model["Gatherings limited to...:100 people or less"]),
        p90: quantileSeq(
          npi_model["Gatherings limited to...:100 people or less"],
          0.9
        ) as number,
      },
      {
        name: "10 people or less",
        mean: median(npi_model["Gatherings limited to...:10 people or less"]),
        p90: quantileSeq(
          npi_model["Gatherings limited to...:10 people or less"],
          0.9
        ) as number,
      },
    ],
  },
  {
    name: "Business closed",
    items: [
      {
        name: "Some",
        mean: median(npi_model["Business closed:Some"]),
        p90: quantileSeq(npi_model["Business closed:Some"], 0.9) as number,
      },
      {
        name: "Most",
        mean: median(npi_model["Business closed:Most"]),
        p90: quantileSeq(npi_model["Business closed:Most"], 0.9) as number,
      },
    ],
  },
  {
    name: "Schools and universities closed in conjuction",
    mean: median(npi_model["Schools and universities closed in conjuction"]),
    p90: quantileSeq(npi_model["Schools and universities closed in conjuction"], 0.9) as number,
  },
  {
    name: "Stay-at-home order (additional benefit)",
    mean: median(npi_model["Stay-at-home order (additional benefit)"]),
    p90: quantileSeq(
      npi_model["Stay-at-home order (additional benefit)"],
      0.9
    ) as number,
    implies: [{ key: 0, value: 3 }, { key: 1, value: 2 }, { key: 2, value: 1 }],
  },
];
