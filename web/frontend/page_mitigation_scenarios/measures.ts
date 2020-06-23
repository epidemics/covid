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

export const highComplianceCoef = 0.8;
export const lowComplianceCoef = 1.1;

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

export function calculateCompliance(
  coef: number,
  stateToUpdate: SliderState[]
): SliderState[] {
  return stateToUpdate.map((sliderState, measureIndex) => {
    if (Array.isArray(sliderState.value)) {
      return {
        ...sliderState,
        value: sliderState.value.map(
          (item, itemIndex) =>
            (measuresCheck[measureIndex] as MeasureGroup).items[itemIndex]
              .median * coef
        ),
      };
    } else {
      return {
        ...sliderState,
        value: (measuresCheck[measureIndex] as MeasureCheck).median * coef,
      };
    }
  });
}

export let calculateLowCompliance = (stateToUpdate: SliderState[]) =>
  calculateCompliance(lowComplianceCoef, stateToUpdate);
export let calculateMediumCompliance = (stateToUpdate: SliderState[]) =>
  calculateCompliance(1, stateToUpdate);
export let calculateHighCompliance = (stateToUpdate: SliderState[]) =>
  calculateCompliance(highComplianceCoef, stateToUpdate);
