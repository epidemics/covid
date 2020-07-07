import * as d3 from "d3";
import * as React from "react";
import * as ReactDOM from "react-dom";

import { Alerts } from "../components/alerts";
import FancySlider from "../components/FancySlider";
import {
  Measure,
  MeasureGroup,
  measures,
  range,
  serialInterval,
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
  serialInterval: number;
};

export function Page(props: Props) {
  let { measures, serialInterval } = props;

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
            checked: measureOrGroup.items.length,
          };
        } else {
          return {
            value: measureOrGroup.mean,
            checked: 1,
          };
        }
      });
    }
  );

  let multiplier = 1;
  let row = 5;

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

  // function setR(R: number) {
  //   setGrowthRate(1 + Math.log(R) / serialInterval);
  // }

  // function growthToR(growth: number) {
  //   return Math.exp(serialInterval * (growth - 1));
  // }

  let defaultR = 3.6; //growthToR(props.defaultOriginalGrowthRate.mean);
  //let defaultRp95 = growthToR(props.defaultOriginalGrowthRate.ci[1]);
  let defaultRsd = 1.4; //(defaultRp95 - defaultR) / 1.5;
  let [baselineR, setR] = React.useState(defaultR);

  return (
    <>
      <Alerts />

      <h1>Mitigation calculator for policymakers</h1>

      <hr />
      <p>
        The following tool can be used to calculate the estimated effect of
        various combinations of COVID countermeasures. On the left, measures and
        measure groups can be toggled to factor into the calculation. On the
        right, the impact on growth is displayed using coloured bands. The
        impact estimates are based on our model combining a countermeasures
        dataset and their empirically observed growth reduction. The impact of
        each measure can be customized by the sliders to e.g. factor in
        non-compliance. In measure groups, more stingent measures indicate the{" "}
        <em>additional effect</em> on top of less stingent measures.{" "}
      </p>

      <hr />
      <div className="measure-calculator">
        <div style={{ gridColumn: "1 / span 2" }}>
          <b>Baseline</b>
        </div>
        <div style={{ gridColumn: "1 / span 2", maxWidth: 300 }}>
          R without any measures
        </div>

        <FancySlider
          min={0}
          // format={(num) => `R = ${d3.format(".1f")(num)}`}
          value={baselineR}
          step={Math.pow(10, Math.ceil(Math.log10(serialInterval / 4)) - 2)}
          onChange={setR}
          mean={baselineR}
          sd={0}
          max={defaultR + 3 * defaultRsd}
        ></FancySlider>
        <div style={{ gridColumn: "1 / span 2" }}>
          <b>Measures</b>
        </div>
        <div style={{ gridColumn: "3 / span 2" }}>
          <b>Impact on R, the reproductive number</b>
        </div>
        {elems}
        <div style={{ gridColumn: "1 / span 2", gridRow: row++ }}>
          <b>Outcome</b>
        </div>

        <div style={{ gridColumn: "1 / span 2", gridRow: row, maxWidth: 300 }}>
          R with the above measures
        </div>

        <FancySlider
          min={0}
          row={row++}
          value={baselineR * multiplier}
          step={Math.pow(10, Math.ceil(Math.log10(serialInterval / 4)) - 3)}
          mean={baselineR * multiplier}
          sd={defaultRsd}
          max={defaultR + 3 * defaultRsd}
          colorRangeFunction={(value) => {
            if (value < 0.7) {
              return "#208f0a";
            }

            if (value >= 0.7 && value < 1) {
              return "#d1c51f";
            }

            return "#bf2011";
          }}
          showInitial={false}
        ></FancySlider>

        <div style={{ gridColumn: "1 / span 3", gridRow: row }}>
          <p className="mitigation-calculator-result-label">
            The measures result in a reduction in R of{" "}
          </p>
        </div>
        <div
          style={{
            gridColumn: "4",
            gridRow: row++,
            justifySelf: "end",
          }}
          className="mitigation-calculator-result-label"
        >
          <b>{d3.format(".1%")(multiplier - 1)}</b>
        </div>
      </div>
      <hr />
    </>
  );
}

let $root = document.getElementById("react-mitigation-calculator");
if ($root) {
  ReactDOM.render(
    <Page measures={measures} serialInterval={serialInterval} />,
    $root
  );
}
