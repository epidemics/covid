export interface Measure {
  name: string;
  guess: number;
  median: number;
  p90: number;
  implies?: Array<{ key: number; value?: number }>;
}

export interface MeasureGroup {
  name: string;
  items: Array<Measure>;
}

// the range of all the sliders
export const range = { min: 0.6, max: 1.1 };

export const serialInterval = 5;

export const defaultOriginalGrowthRate = {
  mean: 1.24,
  ci: [1.21, 1.27] as [number, number],
};

// the measures
export const measures: Array<Measure | MeasureGroup> = [
  {
    name: "Over 60% of the population wears masks",
    guess: 0.9,
    median: 0.873,
    p90: 0.614,
  },
  {
    name: "Asymptomatic contact isolation",
    guess: 0.99,
    median: 0.986,
    p90: 0.937,
  },
  {
    name: "Gatherings limited to...",
    items: [
      {
        name: "1000 people",
        guess: 0.94,
        median: 0.937,
        p90: 0.843,
      },
      {
        name: "100 people",
        guess: 0.97,
        median: 0.972,
        p90: 0.896,
      },
      {
        name: "10 people",
        guess: 0.97,
        median: 0.97,
        p90: 0.892,
      },
    ],
  },
  {
    name: "Business suspended",
    items: [
      {
        name: "Some",
        guess: 0.99,
        median: 0.987,
        p90: 0.952,
      },
      {
        name: "Many",
        guess: 0.95,
        median: 0.952,
        p90: 0.872,
      },
    ],
  },
  {
    name: "Schools and universities closed",
    guess: 0.667,
    median: 0.942,
    p90: 0.858,
  },
  {
    name: "Healthcare specialisation over 0.2",
    guess: 0.99,
    median: 0.99,
    p90: 0.943,
  },
  {
    name: "General curfew - permissive",
    guess: 0.98,
    median: 0.979,
    p90: 0.911,
    implies: [{ key: 2, value: 3 }, { key: 3, value: 1 }, { key: 4 }],
  },
  {
    name: "General curfew - strict",
    guess: 0.95,
    median: 0.953,
    p90: 0.856,
    implies: [
      { key: 2, value: 3 },
      { key: 3, value: 2 },
      { key: 4 },
      { key: 6 },
    ],
  },
];
