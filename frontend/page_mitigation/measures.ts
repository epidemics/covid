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

export const serialInterval = 6.5;

export const defaultOriginalGrowthRate = {
  mean: 1.24,
  ci: [1.21, 1.27] as [number, number],
};

// the measures
export const measures: Array<Measure | MeasureGroup> = [
  {
    name: "Over 60% of the population wears masks",
    mean: 0.908,
    p90: 0.735,
  },
  {
    name: "Symptomatic testing",
    mean: 0.904,
    p90: 0.772,
  },
  {
    name: "Gatherings limited to...",
    items: [
      {
        name: "1000 people",
        mean: 0.991,
        p90: 0.8,
      },
      {
        name: "100 people",
        mean: 0.954,
        p90: 0.758,
      },
      {
        name: "10 people",
        mean: 0.761,
        p90: 0.627,
      },
    ],
  },
  {
    name: "Business suspended",
    items: [
      {
        name: "Some",
        mean: 0.66,
        p90: 0.528,
      },
      {
        name: "Many",
        mean: 0.831,
        p90: 0.694,
      },
    ],
  },
  {
    name: "Schools and universities closed",
    mean: 0.667,
    p90: 0.524,
  },
  {
    name: "Stay-at-home order",
    mean: 0.824,
    p90: 0.685,
    implies: [{ key: 2, value: 3 }, { key: 3, value: 2 }, { key: 4 }],
  },
];
