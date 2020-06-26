import npi_model_raw from "./npi_model.json";
import { median, quantileSeq } from "mathjs";

const npi_model = (npi_model_raw as unknown) as Record<string, Array<number>>;

export interface Measure {
  name: string;
  median: number;
  p90: number;
  implies?: Array<{ key: number; value?: number }>;
}

export interface MeasureGroup {
  name: string;
  items: Array<Measure>;
}

// the range of all the sliders
export const range = { min: 0.25, max: 1.25 };

export const serialInterval = 6.5;

// the measures
export const measures: Array<Measure | MeasureGroup> = [
  {
    name: "Over 60% of the population wears masks",
    median: median(npi_model["Over 60% of the population wears masks"]),
    p90: quantileSeq(
      npi_model["Over 60% of the population wears masks"],
      0.9
    ) as number,
  },
  {
    name: "Symptomatic testing",
    median: median(npi_model["Symptomatic testing"]),
    p90: quantileSeq(npi_model["Symptomatic testing"], 0.9) as number,
  },
  {
    name: "Gatherings limited to...",
    items: [
      {
        name: "1000 people",
        median: median(npi_model["Gatherings limited to...:1000 people"]),
        p90: quantileSeq(
          npi_model["Gatherings limited to...:1000 people"],
          0.9
        ) as number,
      },
      {
        name: "100 people",
        median: median(npi_model["Gatherings limited to...:100 people"]),
        p90: quantileSeq(
          npi_model["Gatherings limited to...:100 people"],
          0.9
        ) as number,
      },
      {
        name: "10 people",
        median: median(npi_model["Gatherings limited to...:10 people"]),
        p90: quantileSeq(
          npi_model["Gatherings limited to...:10 people"],
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
        median: median(npi_model["Business suspended:Some"]),
        p90: quantileSeq(npi_model["Business suspended:Some"], 0.9) as number,
      },
      {
        name: "Many",
        median: median(npi_model["Business suspended:Many"]),
        p90: quantileSeq(npi_model["Business suspended:Many"], 0.9) as number,
      },
    ],
  },
  {
    name: "Schools and universities closed",
    median: median(npi_model["Schools and universities closed"]),
    p90: quantileSeq(
      npi_model["Schools and universities closed"],
      0.9
    ) as number,
  },
  {
    name: "Stay-at-home order",
    median: median(npi_model["Stay-at-home order"]),
    p90: quantileSeq(npi_model["Stay-at-home order"], 0.9) as number,
    implies: [{ key: 2, value: 3 }, { key: 3, value: 2 }, { key: 4 }],
  },
];
