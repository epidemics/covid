import "react-datepicker/dist/react-datepicker.css";

import {
  ErrorMessage,
  FastField,
  Field,
  FieldArrayRenderProps,
  useFormikContext,
} from "formik";
import * as React from "react";
import DatePicker from "react-datepicker";
import * as moment from "moment";
import { INTERVENTION_INTERVAL_IN_MONTHS } from "./MitigationScenariosPage";

import Modal from "../components/Modal";
import { Measure, MeasureGroup, serialInterval } from "./measures";
import MitigationCalculator, { SliderState } from "./MitigationCalculator";
import { createInitialMitigation, Values } from "./MitigationForm";
import MeasureDropdown from "./MeasureDropdown";

export interface Props {
  index: number;
  calculatorForIndex: number | undefined;
  setCalculatorForIndex: (index: number | undefined) => void;
  arrayHelpers: FieldArrayRenderProps;
}

function MitigationIntervalItem({
  index,
  calculatorForIndex,
  setCalculatorForIndex,
  arrayHelpers,
}: Props) {
  const { setFieldValue, values, handleBlur } = useFormikContext<Values>();

  const showCalculator = calculatorForIndex === index;
  const isLastItem = index === values.mitigations.length - 1;
  const isFirstItem = index === 0;

  const handleShowCalculatorClick = (index: number) => {
    if (showCalculator) {
      setCalculatorForIndex(undefined);
      return;
    }

    setCalculatorForIndex(index);
  };

  const handleRemoveItemClick = (index: number) => {
    if (showCalculator) {
      setCalculatorForIndex(undefined);
    }

    arrayHelpers.remove(index);
  };

  const handleCalculatorChange = (value: number, state: SliderState[]) => {
    setFieldValue(
      `mitigations.[${index}].transmissionReduction`,
      `${Math.round(Math.abs(value))} %`
    );

    const newMeasures = values.mitigations[index].measures.map(
      (measureOrGroup, measureIndex) => {
        if ("items" in measureOrGroup) {
          const group = measureOrGroup as MeasureGroup;
          const newItems = group.items.map((item, itemIndex) => ({
            ...item,
            check: itemIndex <= state[measureIndex].checked - 1 ? 1 : 0,
            mean: (state[measureIndex].value as number[])[itemIndex],
          }));

          return {
            ...group,
            items: newItems,
          };
        } else {
          const measure = measureOrGroup as Measure;
          return {
            ...measure,
            check: state[measureIndex].checked,
            mean: state[measureIndex].value as number,
          };
        }
      }
    );

    setFieldValue(`mitigations.[${index}].measures`, newMeasures);
  };

  const handleTimeRangeBeginChange = (value: Date | null) => {
    setFieldValue(`mitigations.[${index}].timeRange.begin`, value);
  };

  return (
    <>
      <div className="mitigation-item form-row">
        <div className="col-md-2">
          <div className="form-group">
            <label
              className="d-md-none"
              htmlFor={`mitigations.[${index}].name`}
            >
              Period name
            </label>
            <FastField
              className={`form-control`}
              id={`mitigations.[${index}].name`}
              name={`mitigations.[${index}].name`}
              type="text"
              placeholder="Period name"
            />
            <ErrorMessage name={`mitigations.[${index}].name`} />
          </div>
        </div>
        <div className="col-md-2">
          <div className="form-group">
            <MeasureDropdown
              measures={values.mitigations[index].measures}
              compliance={values.mitigations[index].compliance}
              intervalIndex={index}
            />
          </div>
        </div>
        <div className="col-md-2">
          <div className="form-group">
            <label
              className="d-md-none"
              htmlFor={`mitigations.[${index}].timeRange.begin`}
            >
              Begin date
            </label>
            <DatePicker
              id={`mitigations.[${index}].timeRange.begin`}
              name={`mitigations.[${index}].timeRange.begin`}
              selected={values.mitigations[index].timeRange.begin}
              onChange={handleTimeRangeBeginChange}
              className="form-control"
              onBlur={handleBlur}
              minDate={
                !isFirstItem
                  ? values.mitigations[index - 1].timeRange.begin
                  : null
              }
              maxDate={
                !isLastItem
                  ? values.mitigations[index + 1].timeRange.begin
                  : null
              }
            />
            <ErrorMessage name={`mitigations.[${index}].timeRange.begin`} />
          </div>
        </div>
        <div className="col-md-2">
          <div className="form-group">
            <label
              className="d-md-none"
              htmlFor={`mitigations.[${index}].transmissionReduction`}
            >
              R value reduction
            </label>
            <div className="input-group">
              <Field
                id={`mitigations.[${index}].transmissionReduction`}
                name={`mitigations.[${index}].transmissionReduction`}
                type="text"
                className="form-control"
                readOnly="readonly"
                onClick={() => handleShowCalculatorClick(index)}
              />
            </div>
            <p>
              <button
                type="button"
                className="btn btn-link p-0"
                onClick={() => handleShowCalculatorClick(index)}
              >
                {showCalculator ? "Hide R calculator" : "Show R calculator"}
              </button>
            </p>
          </div>
        </div>
        <div className="col-md-4">
          <p>
            <button
              type="button"
              className="btn btn-link p-0"
              onClick={() => handleRemoveItemClick(index)}
            >
              Remove
            </button>
            {isLastItem && (
              <button
                type="button"
                className="btn btn-link"
                onClick={() =>
                  arrayHelpers.push(
                    createInitialMitigation(
                      moment(values.mitigations[index].timeRange.begin)
                        .add(INTERVENTION_INTERVAL_IN_MONTHS, "months")
                        .toDate(),
                      index
                    )
                  )
                }
              >
                Add new
              </button>
            )}
          </p>
        </div>
      </div>

      <Modal
        isOpen={showCalculator}
        onCloseRequest={() => handleShowCalculatorClick(index)}
      >
        <MitigationCalculator
          measures={values.mitigations[index].measures}
          serialInterval={serialInterval}
          onChange={(value, state) => {
            handleCalculatorChange(value, state);
            handleShowCalculatorClick(index);
          }}
        />
      </Modal>
    </>
  );
}

export default MitigationIntervalItem;
