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
    name: "Mask Wearing Mandatory in (Some) Public Spaces",
    median: median(npi_model["Mask Wearing Mandatory in (Some) Public Spaces"]),
    p90: quantileSeq(
      npi_model["Mask Wearing Mandatory in (Some) Public Spaces"],
      0.9
    ) as number,
  },
  // {
  //   name: "Symptomatic testing",
  //   median: median(npi_model["Symptomatic testing"]),
  //   p90: quantileSeq(npi_model["Symptomatic testing"], 0.9) as number,
  // },
  {
    name: "Gatherings limited to...",
    items: [
      {
        name: "1000 people or less",
        median: median(
          npi_model["Gatherings limited to...:1000 people or less"]
        ),
        p90: quantileSeq(
          npi_model["Gatherings limited to...:1000 people or less"],
          0.9
        ) as number,
      },
      {
        name: "100 people or less",
        median: median(
          npi_model["Gatherings limited to...:100 people or less"]
        ),
        p90: quantileSeq(
          npi_model["Gatherings limited to...:100 people or less"],
          0.9
        ) as number,
      },
      {
        name: "10 people or less",
        median: median(npi_model["Gatherings limited to...:10 people or less"]),
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
    name: "School and University Closure",
    median: median(npi_model["School and University Closure"]),
    p90: quantileSeq(npi_model["School and University Closure"], 0.9) as number,
  },
  {
    name: "Stay Home Order (with exemptions)",
    median: median(npi_model["Stay Home Order (with exemptions)"]),
    p90: quantileSeq(
      npi_model["Stay Home Order (with exemptions)"],
      0.9
    ) as number,
    implies: [{ key: 2, value: 3 }, { key: 3, value: 2 }, { key: 4 }],
  },
];
