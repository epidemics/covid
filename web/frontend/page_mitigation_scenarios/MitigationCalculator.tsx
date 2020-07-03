import * as d3 from "d3";
import * as React from "react";

import FancySlider from "../components/FancySlider";
import {
  calculateHighCompliance,
  calculateLowCompliance,
  calculateMediumCompliance,
  Measure,
  MeasureGroup,
  range,
} from "./measures";

//let scale = chroma.scale("PuBu");
// let scale = chroma
//   .scale(["black", "red", "yellow", "white"])
//   .correctLightness();

type LabeledCheckboxProps = {
  id: string;
  disabled: boolean;
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
};

function LabeledCheckbox({
  id,
  disabled,
  checked,
  onChange,
  label,
}: LabeledCheckboxProps) {
  return (
    <>
      <input
        id={id}
        className="form-check-input"
        type="checkbox"
        disabled={disabled}
        checked={checked}
        onChange={() => onChange(!checked)}
      />{" "}
      <label className="form-check-label" htmlFor={id}>
        {label}
      </label>
    </>
  );
}

type CommonMeasureProps = {
  disabled: boolean;
  sliderDisabled: boolean;
  rowStart: number;
};

function SingleMeasure(
  props: CommonMeasureProps & {
    measure: Measure;
    checked: boolean;
    subMeasure?: boolean;
    value: number;
    dispatch: React.Dispatch<{ value?: number; checked?: number }>;
  }
) {
  const {
    checked,
    measure,
    disabled,
    rowStart,
    dispatch,
    value,
    sliderDisabled,
  } = props;
  const row = rowStart;

  const subMeasure = props.subMeasure ?? false;

  const { min, max } = range;
  let { mean, p90 } = measure;
  let sd = (p90 - mean) / 1.65;

  return (
    <>
      <div
        className="label form-check"
        style={{
          // @ts-ignore
          gridColumn: subMeasure ? "2" : "1 / span 2",
          gridRow: row,
        }}
      >
        <LabeledCheckbox
          label={measure.name}
          id={`mitigation-calculator-row-${row}`}
          disabled={disabled}
          checked={checked}
          onChange={() => dispatch({ checked: checked ? 0 : 1 })}
        />
      </div>
      <FancySlider
        row={row}
        min={min}
        max={max}
        format="percentage"
        mean={value}
        step={0.01}
        sd={sd}
        initial={measure.mean}
        value={value}
        disabled={!checked || sliderDisabled}
        onChange={(value) => {
          if (disabled || sliderDisabled) return;
          dispatch({ value });
        }}
      />
    </>
  );
}

const calculateMultiplier = (
  state: SliderState[],
  measures: (Measure | MeasureGroup)[]
) => {
  let multiplier = 1;

  measures.forEach((measure, i) => {
    const { value, checked } = state[i];

    if (value instanceof Array) {
      multiplier = value
        .slice(0, checked)
        .reduce((prev, cur) => prev * cur, multiplier);
    } else if (checked > 0) {
      multiplier *= value;
    }
  });

  return multiplier;
};

function GroupedMeasures(
  props: CommonMeasureProps & {
    group: MeasureGroup;
    checked: number;
    checkCount: number;
    values: Array<number>;
    dispatch: React.Dispatch<{ value?: Array<number>; checked?: number }>;
  }
) {
  const {
    group,
    checkCount,
    disabled,
    sliderDisabled,
    values,
    rowStart: row,
    dispatch,
  } = props;

  function updateValue(idx: number, value: number) {
    dispatch({
      value: values.map((current, i) => (i === idx ? value : current)),
    });
  }

  let measures = group.items.map((measure, i) => {
    let value = values[i];
    let checked = i < checkCount;

    return (
      <SingleMeasure
        disabled={disabled}
        sliderDisabled={sliderDisabled}
        key={i}
        subMeasure
        value={value}
        checked={checked}
        measure={measure}
        rowStart={row + i}
        dispatch={(obj) => {
          if (obj.value) {
            updateValue(i, obj.value);
          }

          if (obj.checked === 1) {
            dispatch({ checked: i + 1 });
          } else if (obj.checked === 0) {
            dispatch({ checked: i });
          }
        }}
      />
    );
  });

  return (
    <>
      <div
        key="label"
        className="label form-check"
        style={{
          gridColumn: "1",
          gridRow: row,
          // gridRow: `span ${measures.length}`,
        }}
      >
        <LabeledCheckbox
          label={group.name}
          id={`mitigation-calculator-group-${row}`}
          disabled={disabled}
          checked={checkCount === group.items.length}
          onChange={(newValue) => {
            dispatch({ checked: newValue ? group.items.length : 0 });
          }}
        />
      </div>

      {measures}
      <div
        className="group-explanation"
        style={{
          gridColumn: 1,
          gridRow: `${row + 1} / span ${measures.length - 1}`,
        }}
      >
        The effectivity of these measures are cumulative
      </div>
    </>
  );
}

export type SliderState = {
  value: number | number[];
  checked: number;
};

type Props = {
  measures: Array<Measure | MeasureGroup>;
  onChange: (value: number, state: SliderState[]) => void;
  serialInterval: number;
};

const MitigationCalculator = (props: Props) => {
  let { measures, onChange } = props;
  const [compliance, setCompliance] = React.useState<
    "high" | "medium" | "low" | "custom"
  >("medium");

  React.useEffect(() => {
    document.getElementById("containmentContent")?.classList.remove("d-none");
  });

  function reducer<T>(
    state: Array<SliderState>,
    action: { idx: number } & Partial<SliderState>
  ): Array<SliderState> {
    let { idx, checked } = action;

    let newState: Array<SliderState> = state.map((item, i) => {
      if (idx === i) {
        return { ...item, ...action };
      } else {
        return { ...item };
      }
    });

    if (checked === 0) {
      newState.forEach((item, i) => {
        let measure = measures[i];
        if ("implies" in measure && measure.implies) {
          let inconsistent = measure.implies.some(
            (target) => target.key === idx && checked! < (target.value ?? 1)
          );
          if (inconsistent) {
            item.checked = 0;
          }
        }
      });
    } else if (checked === 1) {
      let measure = measures[idx];
      if ("implies" in measure && measure.implies) {
        measure.implies.forEach((target) => {
          let item = newState[target.key];
          item.checked = Math.max(item.checked, target.value ?? 1);
        });
      }
    }

    return newState;
  }

  let [state, dispatch] = React.useReducer(
    reducer,
    null,
    (): Array<SliderState> => {
      return measures.map((measureOrGroup) => {
        if ("items" in measureOrGroup) {
          return {
            value: measureOrGroup.items.map((measure) => measure.mean),
            checked: measureOrGroup.items.filter((item) => item.check).length,
          };
        } else {
          return {
            value: measureOrGroup.mean,
            checked: measureOrGroup.check,
          };
        }
      });
    }
  );

  let multiplier = 1;
  let row = 3;

  let elems = measures.map((measureOrGroup, i) => {
    let { checked, value } = state[i];

    if (value instanceof Array) {
      multiplier = value
        .slice(0, checked)
        .reduce((prev, cur) => prev * cur, multiplier);
    } else if (checked > 0) {
      multiplier *= value;
    }

    if ("items" in measureOrGroup) {
      let item = (
        <GroupedMeasures
          key={`row-${i}`}
          rowStart={row}
          checked={checked}
          values={value as Array<number>}
          disabled={false}
          sliderDisabled={compliance !== "custom"}
          group={measureOrGroup}
          checkCount={checked}
          dispatch={(obj) => dispatch({ ...obj, idx: i })}
        />
      );
      row += measureOrGroup.items.length;
      return item;
    } else {
      let item = (
        <SingleMeasure
          key={`row-${i}`}
          rowStart={row}
          value={value as number}
          disabled={false}
          sliderDisabled={compliance !== "custom"}
          measure={measureOrGroup}
          checked={checked != 0}
          dispatch={(obj) => {
            dispatch({ ...obj, idx: i });
          }}
        />
      );
      row += 1;
      return item;
    }
  });

  const handleComplianceClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value as "high" | "medium" | "low" | "custom";
    let newState: SliderState[] = [];

    if (value === "low") {
      newState = calculateLowCompliance(state);
    }

    if (value === "high") {
      newState = calculateHighCompliance(state);
    }

    if (value === "medium") {
      newState = calculateMediumCompliance(state);
    }

    newState.forEach((sliderState, idx) => {
      dispatch({ idx, ...sliderState });
    });

    setCompliance(value);
  };

  // function setR(R: number) {
  //   setGrowthRate(1 + Math.log(R) / serialInterval);
  // }

  // function growthToR(growth: number) {
  //   return Math.exp(serialInterval * (growth - 1));
  // }

  //let defaultR = 3.6; //growthToR(props.defaultOriginalGrowthRate.mean);
  //let defaultRp95 = growthToR(props.defaultOriginalGrowthRate.ci[1]);
  //let defaultRsd = 1.4; //(defaultRp95 - defaultR) / 1.5;
  //let [baselineR, setR] = React.useState(defaultR);

  return (
    <>
      <div className="measure-calculator">
        <div style={{ gridColumn: "1 / span 2" }}>
          <b>Measures</b>
        </div>
        <div style={{ gridColumn: "3 / span 2" }}>
          <b>Impact on R, the reproductive number</b>
          <div className="py-2" style={{ display: "flex" }}>
            <span className="pr-3">Compliance</span>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="inlineRadioOptions"
                id="low-compliance"
                value="low"
                checked={compliance === "low"}
                onChange={handleComplianceClick}
              />
              <label className="form-check-label" htmlFor="low-compliance">
                Low
              </label>
            </div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="inlineRadioOptions"
                id="medium-compliance"
                checked={compliance === "medium"}
                value="medium"
                onChange={handleComplianceClick}
              />
              <label className="form-check-label" htmlFor="medium-compliance">
                Medium
              </label>
            </div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="inlineRadioOptions"
                id="high-compliance"
                checked={compliance === "high"}
                value="high"
                onChange={handleComplianceClick}
              />
              <label className="form-check-label" htmlFor="high-compliance">
                High
              </label>
            </div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="inlineRadioOptions"
                id="custom-compliance"
                checked={compliance === "custom"}
                value="custom"
                onChange={handleComplianceClick}
              />
              <label className="form-check-label" htmlFor="custom-compliance">
                Custom
              </label>
            </div>
          </div>
        </div>
        {elems}
        <div style={{ gridColumn: "1 / span 2", gridRow: row }}>
          <p className="mitigation-calculator-result-label">Outcome</p>
        </div>

        <div style={{ gridColumn: "3", gridRow: row }}>
          <p className="mitigation-calculator-result-label">
            The measures result in a reduction in R of{" "}
          </p>
        </div>
        <div
          style={{
            gridColumn: "4",
            gridRow: row++,
            justifySelf: "end",
            width: 150,
            textAlign: "right",
          }}
        >
          <p className="mitigation-calculator-result">
            {d3.format(".1%")(multiplier - 1)}
          </p>
        </div>
      </div>
      <div className="d-flex justify-content-end">
        <button
          type="button"
          className="btn btn-primary mr-2"
          onClick={() =>
            onChange(
              Math.round(
                (calculateMultiplier(state, measures) - 1) * 100 * 10
              ) / 10,
              state
            )
          }
        >
          Apply
        </button>
      </div>
    </>
  );
};

export default MitigationCalculator;
