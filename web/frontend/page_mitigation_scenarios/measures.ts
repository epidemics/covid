import { SliderState } from "./MitigationCalculator";
import { Measure, measures } from "../page_mitigation/measures";

export interface MeasureCheck {
  name: string;
  median: number;
  p90: number;
  implies?: Array<{ key: number; value?: number }>;
  check: number;
}

export interface MeasureGroup {
  name: string;
  items: Array<MeasureCheck>;
}

// the range of all the sliders
export const range = { min: 0.25, max: 1.25 };

export const serialInterval = 6.5;

function mapMeasure(measure: Measure): MeasureCheck {
  return {
    name: measure.name,
    median: measure.median,
    p90: measure.p90,
    implies: measure.implies,
    check: 1,
  };
}

// the measures
export const measuresCheck: Array<MeasureCheck | MeasureGroup> = measures.map(
  (obj: MeasureCheck | MeasureGroup) => {
    if ("items" in obj) {
      return {
        name: obj.name,
        items: obj.items.map(mapMeasure),
      };
    } else {
      return mapMeasure(obj);
    }
  }
);

export function calculateHighCompliance(
  stateToUpdate: SliderState[]
): SliderState[] {
  return stateToUpdate.map((sliderState, measureIndex) => {
    if (Array.isArray(sliderState.value)) {
      return {
        ...sliderState,
        value: sliderState.value.map(
          (item, itemIndex) =>
            (measuresCheck[measureIndex] as MeasureGroup).items[itemIndex]
              .median * 0.8
        ),
      };
    } else {
      return {
        ...sliderState,
        value: (measuresCheck[measureIndex] as MeasureCheck).median * 0.8,
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
            (measuresCheck[measureIndex] as MeasureGroup).items[itemIndex]
              .median
        ),
      };
    } else {
      return {
        ...sliderState,
        value: (measuresCheck[measureIndex] as MeasureCheck).median,
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
            (measuresCheck[measureIndex] as MeasureGroup).items[itemIndex]
              .median * 1.1,
            1
          )
        ),
      };
    } else {
      return {
        ...sliderState,
        value: Math.min(
          (measuresCheck[measureIndex] as MeasureCheck).median * 1.1,
          1
        ),
      };
    }
  });
}
