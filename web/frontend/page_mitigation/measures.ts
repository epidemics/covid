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
    median: 1.0828244724843894,
    p90: 1.2579105358282887,
  },
  {
    name: "Symptomatic testing",
    median: 0.8626712381356705,
    p90: 0.9541108026778692,
  },
  {
    name: "Gatherings limited to...",
    items: [
      {
        name: "1000 people",
        median: 0.837107546217208,
        p90: 0.9529527100595532,
      },
      {
        name: "100 people",
        median: 0.9844874790945364,
        p90: 1.1367275093592248,
      },
      {
        name: "10 people",
        median: 0.8651432670350723,
        p90: 0.9801024196663237,
      },
    ],
  },
  {
    name: "Business suspended",
    items: [
      {
        name: "Some",
        median: 0.731802101271166,
        p90: 0.8520416129974865,
      },
      {
        name: "Many",
        median: 0.8985480933781107,
        p90: 1.019286860321352,
      },
    ],
  },
  {
    name: "Schools and universities closed",
    median: 0.50070331726544,
    p90: 0.5707762547286482,
  },
  {
    name: "Stay-at-home order",
    median: 0.8564770444879921,
    p90: 0.9644576331809939,
    implies: [{ key: 2, value: 3 }, { key: 3, value: 2 }, { key: 4 }],
  },
];
