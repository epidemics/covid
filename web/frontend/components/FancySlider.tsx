import * as chroma from "chroma-js";
import * as d3 from "d3";
import * as React from "react";

function p(v: number): string {
  return `${(100 * v).toFixed(5)}%`;
}

function calculateBackground(
  mean: number,
  sd: number,
  min: number,
  max: number,
  thumbWidth: string,
  scale: chroma.Scale,
  initialMean: number,
  showInitial: boolean
): string {
  function getColor(z: number) {
    return scale(Math.exp((z * z) / -2)).css();
  }

  let backgrounds = [];

  let stops: Array<string> = [];
  let addStop = (loc: number, z: number) => {
    let offset = (loc - min + sd / 6) / (max - min + sd / 3);
    stops.push(`${getColor(z)} ${(offset * 100).toFixed(2)}%`);
  };

  //TODO: fix std interval positioning
  addStop(mean - sd, -4);
  addStop(mean - sd, 0);
  addStop(mean + sd, 0);
  addStop(mean + sd, 4);

  let rulerGradient = `linear-gradient(to right, ${stops.join(",")})`;
  backgrounds.push(
    `no-repeat ${rulerGradient} 
    0 0`
  );

  function addTicks(
    interval: number,
    height: number,
    color: string,
    color2: string,
    pos?: number,
    width: number = 1,
    width2: number = 1
  ) {
    let w = width;
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
      ${color} calc(${offset} + ${w}px), ${color2} calc(${offset} + ${width2}px), 
      ${color2} calc(${offset} + ${
      2 * width2
    }px), transparent calc(${offset} + ${2 * width2}px)
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

  if (showInitial) {
    addTicks(
      1,
      1,
      scale(0.4).desaturate().css(),
      scale(0.4).desaturate().css(),
      initialMean,
      7,
      0
    );
  }

  return backgrounds.reverse().join(", ");
}

namespace FancySlider {
  export interface Props {
    mean: number;
    sd: number;
    disabled?: boolean;
    initial?: number;
    row?: number;
    step: number;
    min: number;
    max: number;
    value: number;
    scale?: chroma.Scale;
    onChange?: (value: number) => void;
    format?: "percentage" | "absolute";
    colorRangeFunction?: (value: number) => string;
    showInitial?: boolean;
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
  colorRangeFunction,
  showInitial = true,
}: FancySlider.Props) {
  let format =
    propFormat == "percentage"
      ? (x: number) => d3.format("+.0%")(x - 1)
      : (x: number) => x.toFixed(1);
  const [initial] = React.useState(propInitial ?? mean);
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
      scale ?? chroma.scale(["rgb(212, 212, 157)", "rgb(102, 102, 66)"]),
      initial,
      showInitial
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
    const color = colorRangeFunction && colorRangeFunction(value);
    input = (
      <b
        className="mitigation-calculator-result-label"
        style={{ color, fontSize: "1.8rem" }}
      >
        {value.toFixed(-Math.floor(Math.log10(step)))}
      </b>
    );
  }

  return (
    <>
      <div
        className="slider d-none d-md-flex"
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
          gridRow: row,
          filter: disabled ? "brightness(50%)" : "none",
          justifySelf: onChange ? "initial" : "end",
        }}
      >
        {input}
      </div>
    </>
  );
}

export default FancySlider;
