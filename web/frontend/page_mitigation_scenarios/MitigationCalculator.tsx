import * as chroma from "chroma-js";
import * as d3 from "d3";
import * as React from "react";

import {
  calculateHighCompliance,
  calculateLowCompliance,
  calculateMediumCompliance,
  highComplianceCoef,
  lowComplianceCoef,
  MeasureCheck,
  MeasureGroup,
  range,
} from "./measures";
import { calculateMultiplier } from "../page_mitigation/multiplier";

//let scale = chroma.scale("PuBu");
// let scale = chroma
//   .scale(["black", "red", "yellow", "white"])
//   .correctLightness();

function p(v: number): string {
  return `${(100 * v).toFixed(5)}%`;
}

function calculateBackground(
  mean: number,
  sd: number,
  min: number,
  max: number,
  thumbWidth: string,
  scale: chroma.Scale
): string {
  function getColor(z: number) {
    return scale(Math.exp((z * z) / -2)).css();
  }

  let backgrounds = [];
  const f = (loc: number) => getColor((loc - mean) / sd);
  backgrounds.push(`linear-gradient(
    to right, ${f(min)} 49%, ${f(max)} 51%)`);

  let stops: Array<string> = [];
  let addStop = (loc: number, z: number) => {
    let offset = (loc - min) / (max - min);
    stops.push(`${getColor(z)} ${(offset * 100).toFixed(2)}%`);
  };

  for (let z = -4; z < 4; z += 0.25) {
    addStop(mean + z * sd, z);
  }

  let rulerGradient = `linear-gradient(to right, ${stops.join(",")})`;
  backgrounds.push(
    `no-repeat ${rulerGradient} 
      calc(${thumbWidth}/2) 0 
    / calc(100% - ${thumbWidth}) auto`
  );

  function addTicks(
    interval: number,
    height: number,
    color: string,
    color2: string,
    pos?: number
  ) {
    let w = 1;
    let firstTick = pos ?? Math.ceil(min / interval) * interval;
    let offset = p((firstTick - min) / (max - min));

    let tickSpace = p(interval / (max - min));
    // let tickGradient = `repeating-linear-gradient(to right,
    //   ${color}, ${color} 1px,
    //   transparent 1px, transparent ${tickSpace}
    // )`;
    let tickGradient = `${
      pos === undefined ? "repeating-linear-gradient" : "linear-gradient"
    }(to right, 
      transparent calc(${offset}), ${color} calc(${offset}),
      ${color} calc(${offset} + ${w}px), ${color2} calc(${offset} + ${w}px), 
      ${color2} calc(${offset} + ${2 * w}px), transparent calc(${offset} + ${
      2 * w
    }px)
      ${
        pos !== undefined ? "" : `, transparent calc(${offset} + ${tickSpace})`
      } 
    )`;
    backgrounds.push(
      `no-repeat ${tickGradient} 
        calc(${thumbWidth} / 2) bottom 
      / calc(100% - ${thumbWidth}) ${p(height)}`
    );
  }
  let dark = scale(1).desaturate().css();
  let light = scale(0.5).desaturate().css();

  if (max < 2) {
    addTicks(0.05, 0.2, dark, light);
    addTicks(0.1, 0.5, dark, light);
  } else if (max - min < 4) {
    addTicks(0.1, 0.2, dark, light);
    addTicks(1, 0.5, dark, light);
  } else {
    addTicks(0.5, 0.2, dark, light);
    addTicks(1, 0.5, dark, light);
  }
  addTicks(1, 1, dark, scale(0.4).desaturate().css(), 1);

  return backgrounds.reverse().join(", ");
}

namespace FancySlider {
  export interface Props {
    mean: number;
    sd: number;
    disabled?: boolean;
    initial?: number;
    row: number;
    step: number;
    min: number;
    max: number;
    value: number;
    scale?: chroma.Scale;
    onChange?: (value: number) => void;
    format?: "percentage" | "absolute";
  }
}

function FancySlider({
  onChange,
  mean,
  sd,
  initial: propInitial,
  min: propMin,
  max: propMax,
  step,
  row,
  disabled: propDisabled,
  value: propValue,
  format: propFormat,
  scale,
}: FancySlider.Props) {
  let format =
    propFormat == "percentage"
      ? (x: number) => d3.format("+.0%")(x - 1)
      : (x: number) => x.toFixed(1);
  let initial = propInitial ?? mean;
  let disabled = propDisabled ?? false;
  let min = Math.floor(propMin / step) * step;
  let max = Math.ceil(propMax / step) * step;
  let value = Math.round(propValue / step) * step;

  const background = React.useMemo(() => {
    return calculateBackground(
      mean,
      Math.abs(sd),
      propMin,
      propMax,
      onChange !== undefined ? "var(--thumb-width)" : "3px",
      scale ?? chroma.scale("YlGnBu")
    );
  }, [onChange, mean, sd, min, max]);

  let input: JSX.Element;
  if (onChange) {
    let lin: (x: number) => number = (x) => x;
    let inv: (x: number) => number = (x) => x;
    let aff: (x: number) => number = (x) => x;
    if (propFormat == "percentage") {
      lin = (x) => 100 * (x - 1);
      inv = (x) => 1 + x / 100;
      aff = (x) => 100 * x;
    }

    input = (
      <div className="input-group">
        <div className="input-group-prepend">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onChange(initial)}
          >
            ↻
          </button>
        </div>
        <input
          className="form-control"
          min={lin(min)}
          max={lin(max)}
          step={aff(step)}
          type="number"
          onChange={(evt) => onChange(inv(+evt.target.value))}
          value={
            propFormat == "percentage"
              ? lin(value).toFixed(0)
              : value.toFixed(-Math.floor(Math.log10(step)))
          }
        ></input>
        {propFormat == "percentage" ? (
          <div className="input-group-append">
            <span className="input-group-text">%</span>
          </div>
        ) : (
          ""
        )}
      </div>
    );
  } else {
    input = <b>{value.toFixed(-Math.floor(Math.log10(step)))}</b>;
  }

  return (
    <>
      <div
        className="slider"
        style={{
          gridColumn: 3,
          gridRow: row,
          filter: disabled ? "brightness(50%)" : "none",
        }}
      >
        <span className="ruler-label">{format(min)}</span>
        <input
          className="ruler measure-slider"
          type="range"
          disabled={onChange === undefined}
          value={propValue ?? undefined}
          min={propMin}
          max={propMax}
          step="any"
          onChange={onChange ? (evt) => onChange(+evt.target.value) : undefined}
          style={{
            // @ts-ignore
            "--ruler-background": background,
          }}
        ></input>
        <span className="ruler-label">{format(max)}</span>
      </div>
      <div
        key={`value-${row}`}
        className="value"
        style={{
          // @ts-ignore
          gridColumn: 4,
          gridRow: row,
          filter: disabled ? "brightness(50%)" : "none",
          justifySelf: "end",
        }}
      >
        {input}
      </div>
    </>
  );
}

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
  rowStart: number;
};

function SingleMeasure(
  props: CommonMeasureProps & {
    measure: MeasureCheck;
    checked: boolean;
    subMeasure?: boolean;
    value: number;
    dispatch: React.Dispatch<{ value?: number; checked?: number }>;
  }
) {
  const { checked, measure, disabled, rowStart, dispatch, value } = props;
  const row = rowStart;

  const subMeasure = props.subMeasure ?? false;

  const { min, max } = range;
  let { median, p90 } = measure;
  let sd = (p90 - median) / 1.65;

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
        mean={median}
        step={0.01}
        sd={sd}
        initial={measure.median}
        value={value}
        disabled={true}
        onChange={(_) => {
          return;
        }}
      />
    </>
  );
}

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
  measures: Array<MeasureCheck | MeasureGroup>;
  onChange: (value: number, state: SliderState[]) => void;
  serialInterval: number;
};

const MitigationCalculator = (props: Props) => {
  let { measures, onChange } = props;
  const [compliance, setCompliance] = React.useState<"high" | "medium" | "low">(
    "medium"
  );

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
            value: measureOrGroup.items.map((measure) => measure.median),
            checked: measureOrGroup.items.filter((item) => item.check).length,
          };
        } else {
          return {
            value: measureOrGroup.median,
            checked: measureOrGroup.check,
          };
        }
      });
    }
  );

  let row = 3;
  let checkedMeasures: Array<string> = [];

  let elems = measures.map((measureOrGroup, i) => {
    let { checked, value } = state[i];

    if (value instanceof Array) {
      checkedMeasures = checkedMeasures.concat(
        (measureOrGroup as MeasureGroup).items
          .slice(0, checked)
          .map((item) => `${measureOrGroup.name}:${item.name}`)
      );
    } else if (checked > 0) {
      checkedMeasures.push(measureOrGroup.name);
    }

    if ("items" in measureOrGroup) {
      let item = (
        <GroupedMeasures
          key={`row-${i}`}
          rowStart={row}
          checked={checked}
          values={value as Array<number>}
          disabled={false}
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
    const value = e.target.value as "high" | "medium" | "low";
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
  let multiplier = calculateMultiplier(checkedMeasures);
  console.log(compliance);
  switch (compliance) {
    case "high":
      multiplier *= Math.pow(highComplianceCoef, checkedMeasures.length);
      break;
    case "low":
      multiplier *= Math.pow(lowComplianceCoef, checkedMeasures.length);
      break;
    default:
      break;
  }
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
        <div style={{ gridColumn: "4", gridRow: row++, justifySelf: "end" }}>
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
            onChange(Math.round((multiplier - 1) * 100 * 10) / 10, state)
          }
        >
          Apply
        </button>
      </div>
    </>
  );
};

export default MitigationCalculator;
