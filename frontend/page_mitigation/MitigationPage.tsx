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
import * as d3 from "d3";

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
      calc(var(--thumb-width) / 2) 0 
    / calc(100% - var(--thumb-width)) auto`
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
        calc(var(--thumb-width) / 2) bottom 
      / calc(100% - var(--thumb-width)) ${p(height)}`
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
      ? (x: number) => d3.format(".0%")(1 - x)
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
      scale ?? chroma.scale("YlGnBu")
    );
  }, [mean, sd, min, max]);

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
          disabled={onChange === undefined || value == null}
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

  const { min, max } = range;
  let { median: mean, p90 } = measure;
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
        mean={mean}
        step={0.01}
        sd={sd}
        initial={measure.guess}
        value={value}
        disabled={!checked}
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

type Props = {
  measures: Array<Measure | MeasureGroup>;
  defaultSerialInterval: number;
  defaultOriginalGrowthRate: { mean: number; ci: [number, number] };
};

export function Page(props: Props) {
  let measures = props.measures;

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

  let [serialInterval_, setSerialInterval] = React.useState(
    props.defaultSerialInterval
  );

  let serialInterval = Math.max(serialInterval_, 0.1);

  let [growthRate, setGrowthRate] = React.useState(
    props.defaultOriginalGrowthRate.mean
  );
  let growthRateMult = 1;
  let row = 2;

  let elems = measures.map((measureOrGroup, i) => {
    let { checked, value } = state[i];

    if (value instanceof Array) {
      growthRateMult = value
        .slice(0, checked)
        .reduce((prev, cur) => prev * cur, growthRateMult);
    } else if (checked > 0) {
      growthRateMult *= value;
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

  function setR(R: number) {
    setGrowthRate(1 + Math.log(R) / serialInterval);
  }

  function growthToR(growth: number) {
    return Math.exp(serialInterval * (growth - 1));
  }

  let defaultR = growthToR(props.defaultOriginalGrowthRate.mean);
  let defaultRp95 = growthToR(props.defaultOriginalGrowthRate.ci[1]);
  let defaultRsd = (defaultRp95 - defaultR) / 1.5;
  let beforeR = growthToR(growthRate);
  let finalR = growthToR(growthRate * growthRateMult);
  let reductionR = 1 - finalR / beforeR;

  return (
    <>
      <h1>Mitigation calculator</h1>

      <hr />
      <p>
        The following tool can be used to calculate the estimated effect of
        various combinations of measures. On the left measures and measure
        groups can be toggled to factor into the calculation. On the right the
        estimated impact on growth is displayed, this can be further adjusted
        using the slider. In measure groups more stingent measures indicate the{" "}
        <em>additional effect</em> on top of less stingent measures.{" "}
      </p>

      <hr />
      <div className="measure-calculator">
        <div style={{ gridColumn: "1 / span 2" }}>
          <b>Measures</b>
        </div>
        <div style={{ gridColumn: "3 / span 2" }}>
          <b>Impact on growth</b>
        </div>
        {elems}
        <div style={{ gridColumn: "3", gridRow: row + 1 }}>
          <p>The measures result in a total growth rate reduction of </p>
        </div>
        <div style={{ gridColumn: "4", gridRow: row + 1, justifySelf: "end" }}>
          <b>{d3.format(".1%")(growthRateMult - 1)}</b>
        </div>

        <div style={{ gridColumn: "1 / span 2", gridRow: row + 2 }}>
          <b>Effect on R</b>
        </div>
        <div
          className="outcome"
          style={{ gridColumn: "3 / span 2", gridRow: row + 2 }}
        >
          Compute the effect on R assuming a serial interval of{" "}
          <input
            className="form-control"
            min={0.1}
            max={10}
            step={0.1}
            type="number"
            onChange={(evt) => setSerialInterval(+evt.target.value)}
            value={serialInterval.toFixed(1)}
            style={{ width: "4.25em" }}
          ></input>{" "}
          days
        </div>

        <div
          style={{ gridColumn: "1 / span 2", gridRow: row + 3, maxWidth: 300 }}
        >
          R before the above measures
        </div>

        <FancySlider
          min={growthToR(0)}
          row={row + 3}
          // format={(num) => `R = ${d3.format(".1f")(num)}`}
          value={beforeR}
          step={Math.pow(10, Math.ceil(Math.log10(serialInterval / 4)) - 2)}
          onChange={setR}
          mean={defaultR}
          scale={chroma.scale("YlOrRd")}
          sd={defaultRsd}
          max={defaultR + 4 * defaultRsd}
        ></FancySlider>

        <div
          style={{ gridColumn: "1 / span 2", gridRow: row + 4, maxWidth: 300 }}
        >
          R with the above measures
        </div>

        <FancySlider
          min={growthToR(0)}
          row={row + 4}
          value={finalR}
          step={Math.pow(10, Math.ceil(Math.log10(serialInterval / 4)) - 3)}
          mean={finalR}
          scale={chroma.scale("YlOrRd")}
          sd={defaultRsd}
          max={defaultR + 4 * defaultRsd}
        ></FancySlider>

        <div className="outcome" style={{ gridColumn: "3", gridRow: row + 5 }}>
          The measures result in a reduction in R of
        </div>
        <div style={{ gridColumn: "4", gridRow: row + 5, justifySelf: "end" }}>
          <b>{d3.format(".1%")(-reductionR)}</b>
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
      defaultSerialInterval={5}
      defaultOriginalGrowthRate={defaultOriginalGrowthRate}
    />,
    $root
  );
}
