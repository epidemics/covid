import * as React from "react";
import * as ReactDOM from "react-dom";

import * as chroma from "chroma-js";

import {
  measures,
  range,
  Measure,
  MeasureGroup,
  defaultOriginalGrowthRate,
} from "./measures";

let scale = chroma.scale("YlGnBu");
//let scale = chroma.scale("PuBu");
// let scale = chroma
//   .scale(["black", "red", "yellow", "white"])
//   .correctLightness();

function p(v: number): string {
  return `${(100 * v).toFixed(1)}%`;
}

function calculateBackground(
  mean: number,
  sd: number,
  min: number,
  max: number
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
    stops.push(`${getColor(z)} ${(offset * 100).toFixed(0)}%`);
  };

  for (let z = -4; z < 4; z += 0.25) {
    addStop(mean - z * sd, z);
  }

  let rulerGradient = `linear-gradient(to right, ${stops.join(",")})`;
  backgrounds.push(
    `no-repeat ${rulerGradient} 
      calc(var(--thumb-width) / 2) 0 
    / calc(100% - var(--thumb-width)) auto`
  );

  function addTicks(
    interval: number,
    height: number,
    color: string,
    color2: string,
    w: number = 1
  ) {
    let firstTick = Math.ceil(min / interval) * interval;
    let offset = p((firstTick - min) / (max - min));

    let tickSpace = p(interval / (max - min));
    // let tickGradient = `repeating-linear-gradient(to right,
    //   ${color}, ${color} 1px,
    //   transparent 1px, transparent ${tickSpace}
    // )`;
    let tickGradient = `repeating-linear-gradient(to right, 
      transparent calc(${offset}), ${color} calc(${offset}),
      ${color} calc(${offset} + ${w}px), ${color2} calc(${offset} + ${w}px), 
      ${color2} calc(${offset} + ${2 * w}px), transparent calc(${offset} + ${
      2 * w
    }px), 
      transparent calc(${offset} + ${tickSpace})
    )`;
    backgrounds.push(
      `no-repeat ${tickGradient} 
        calc(var(--thumb-width) / 2) bottom 
      / calc(100% - var(--thumb-width)) ${p(height)}`
    );
  }

  let dark = scale(1).desaturate().css();
  let light = scale(0.5).desaturate().css();
  addTicks(0.05, 0.2, dark, light);
  addTicks(0.1, 0.5, dark, light);
  addTicks(1, 1, dark, scale(0.4).desaturate().css());

  return backgrounds.reverse().join(", ");
}

namespace MeasureSlider {
  export interface Props {
    measure: Measure;
    checked: boolean;
    row: number;
    value: number;
    onChange: (value: number) => void;
  }
}

function MeasureSlider({
  onChange,
  measure,
  row,
  checked,
  value,
}: MeasureSlider.Props) {
  const { min, max } = range;

  const background = React.useMemo(() => {
    const { min, max } = range;
    let { median, p90 } = measure;
    let sd = (p90 - median) / 1.65;
    return calculateBackground(median, sd, min, max);
  }, [measure]);

  return (
    <>
      <div
        className="slider"
        style={{
          gridColumn: 3,
          gridRow: row,
          filter: !checked ? "brightness(50%)" : "none",
        }}
      >
        <span className="ruler-label">{min.toFixed(1)}</span>
        <input
          className="ruler measure-slider"
          type="range"
          disabled={value == null}
          value={value ?? undefined}
          min={min}
          max={max}
          step="any"
          onChange={(evt) => onChange(+evt.target.value)}
          style={{
            // @ts-ignore
            "--ruler-background": background,
          }}
        ></input>
        <span className="ruler-label">{max.toFixed(1)}</span>
      </div>
      <div
        key={`value-${row}`}
        className="value"
        style={{
          // @ts-ignore
          gridColumn: 4,
          gridRow: row,
          filter: !checked ? "brightness(50%)" : "none",
        }}
      >
        <div className="input-group">
          <div className="input-group-prepend">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onChange(measure.guess)}
            >
              ↻
            </button>
          </div>
          <input
            className="form-control"
            min={min}
            max={max}
            step={0.01}
            type="number"
            onChange={(evt) => onChange(+evt.target.value)}
            value={value.toFixed(2)}
          ></input>
        </div>
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
    measure: Measure;
    checked: boolean;
    subMeasure?: boolean;
    value: number;
    dispatch: React.Dispatch<{ value?: number; checked?: number }>;
  }
) {
  const { checked, measure, disabled, rowStart, dispatch, value } = props;
  const row = rowStart;

  const subMeasure = props.subMeasure ?? false;

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
      <MeasureSlider
        row={row}
        measure={measure}
        value={value}
        checked={checked}
        onChange={(value) => {
          if (disabled) return;
          dispatch({ value });
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

type SliderState = {
  value: number | number[];
  checked: number;
};

export function Page({
  measures,
  serialInterval,
  originalGrowthRate,
}: {
  measures: Array<Measure | MeasureGroup>;
  serialInterval: number;
  originalGrowthRate: number;
}) {
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
            value: measureOrGroup.items.map((measure) => measure.guess),
            checked: measureOrGroup.items.length,
          };
        } else {
          return {
            value: measureOrGroup.guess,
            checked: 1,
          };
        }
      });
    }
  );

  let totalValue = 1;
  let row = 2;

  let elems = measures.map((measureOrGroup, i) => {
    let { checked, value } = state[i];

    if (checked >= 0) {
      if (value instanceof Array) {
        totalValue = value
          .slice(0, checked)
          .reduce((prev, cur) => prev * cur, totalValue);
      } else {
        totalValue *= value;
      }
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

  return (
    <>
      <h1>Mitigation calculator</h1>

      <hr />
      <p>
        The following tool can be used to calculate the estimated effect of
        various combinations of measures. On the left measures and measure
        groups can be toggled to factor into the calculation. On the right the
        estimated impact on growth is displayed, this can be further adjusted
        using slider. In measure groups more stingent measures indicate the{" "}
        <em>additional effect</em> on top of less stingent measures.{" "}
      </p>

      <hr />
      <div className="measure-calculator">
        <div style={{ gridColumn: "1 / span 2" }}>Measures</div>
        <div style={{ gridColumn: "3 / span 2" }}>Impact</div>
        {elems}
        <div style={{ gridColumn: "3", gridRow: row + 1 }}>
          <p>The measures above result in a total growth rate reduction of </p>
        </div>
        <div style={{ gridColumn: "4", gridRow: row + 1, justifySelf: "end" }}>
          {totalValue.toFixed(3)}
        </div>
      </div>
      <hr />
    </>
  );
}

let $root = document.getElementById("react-mitigation-calculator");
if ($root) {
  ReactDOM.render(
    <Page
      measures={measures}
      serialInterval={4}
      originalGrowthRate={defaultOriginalGrowthRate}
    />,
    $root
  );
}
