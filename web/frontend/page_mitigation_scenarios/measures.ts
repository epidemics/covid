import { SliderState } from "./MitigationCalculator";

export interface Measure {
  name: string;
  mean: number;
  p90: number;
  implies?: Array<{ key: number; value?: number }>;
  check: number;
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
    mean: 0.908,
    p90: 0.735,
    check: 1,
  },
  {
    name: "Symptomatic testing",
    mean: 0.904,
    p90: 0.772,
    check: 1,
  },
  {
    name: "Gatherings limited to...",
    items: [
      {
        name: "1000 people",
        mean: 0.991,
        p90: 0.8,
        check: 1,
      },
      {
        name: "100 people",
        mean: 0.954,
        p90: 0.758,
        check: 1,
      },
      {
        name: "10 people",
        mean: 0.761,
        p90: 0.627,
        check: 1,
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
        check: 1,
      },
      {
        name: "Many",
        mean: 0.831,
        p90: 0.694,
        check: 1,
      },
    ],
  },
  {
    name: "Schools and universities closed",
    mean: 0.667,
    p90: 0.524,
    check: 1,
  },
  {
    name: "Stay-at-home order",
    mean: 0.824,
    p90: 0.685,
    implies: [{ key: 2, value: 3 }, { key: 3, value: 2 }, { key: 4 }],
    check: 1,
  },
];

export function calculateHighCompliance(
  stateToUpdate: SliderState[]
): SliderState[] {
  return stateToUpdate.map((sliderState, measureIndex) => {
    if (Array.isArray(sliderState.value)) {
      return {
        ...sliderState,
        value: sliderState.value.map(
          (item, itemIndex) =>
            (measures[measureIndex] as MeasureGroup).items[itemIndex].mean * 0.8
        ),
      };
    } else {
      return {
        ...sliderState,
        value: (measures[measureIndex] as Measure).mean * 0.8,
      };
    }
  });
}

export function calculateMediumCompliance(
  stateToUpdate: SliderState[]
): SliderState[] {
  return stateToUpdate.map((sliderState, measureIndex) => {
    if (Array.isArray(sliderState.value)) {
      return {
        ...sliderState,
        value: sliderState.value.map(
          (item, itemIndex) =>
            (measures[measureIndex] as MeasureGroup).items[itemIndex].mean
        ),
      };
    } else {
      return {
        ...sliderState,
        value: (measures[measureIndex] as Measure).mean,
      };
    }
  });
}

export function calculateLowCompliance(
  stateToUpdate: SliderState[]
): SliderState[] {
  return stateToUpdate.map((sliderState, measureIndex) => {
    if (Array.isArray(sliderState.value)) {
      return {
        ...sliderState,
        value: sliderState.value.map((item, itemIndex) =>
          Math.min(
            (measures[measureIndex] as MeasureGroup).items[itemIndex].mean *
              1.1,
            1
          )
        ),
      };
    } else {
      return {
        ...sliderState,
        value: Math.min((measures[measureIndex] as Measure).mean * 1.1, 1),
      };
    }
  });
}
