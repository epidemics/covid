import 'react-datepicker/dist/react-datepicker.css';

import { ErrorMessage, FastField, FieldArrayRenderProps, useFormikContext } from 'formik';
import * as React from 'react';
import DatePicker from 'react-datepicker';

import Modal from '../components/Modal';
import { measures, serialInterval } from './measures';
import MitigationCalculator from './MitigationCalculator';
import { createInitialMitigation, Values } from './MitigationForm';

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

  const handleCalculatorChange = (value: number) => {
    setFieldValue(
      `mitigations.[${index}].transmissionReduction`,
      `${Math.round(Math.abs(value))} %`
    );
  };

  const handleTimeRangeBeginChange = (value: Date | null) => {
    setFieldValue(`mitigations.[${index}].timeRange.begin`, value);
  };

  const handleTimeRangeEndChange = (value: Date | null) => {
    setFieldValue(`mitigations.[${index}].timeRange.end`, value);
  };

  return (
    <>
      <div className="mitigation-item form-row">
        <div className="col-md-3">
          <FastField
            className={`form-control`}
            id={`mitigations.[${index}].name`}
            name={`mitigations.[${index}].name`}
            type="text"
            placeholder="Intervention name"
          />
          <ErrorMessage name={`mitigations.[${index}].name`} />
        </div>
        <div className="col-md-2">
          <DatePicker
            id={`mitigations.[${index}].timeRange.begin`}
            name={`mitigations.[${index}].timeRange.begin`}
            selected={values.mitigations[index].timeRange.begin}
            onChange={handleTimeRangeBeginChange}
            className="form-control"
            onBlur={handleBlur}
            minDate={
              !isFirstItem ? values.mitigations[index - 1].timeRange.end : null
            }
            maxDate={values.mitigations[index].timeRange.end}
          />
          <ErrorMessage name={`mitigations.[${index}].timeRange.begin`} />
        </div>
        <div className="col-md-2">
          <DatePicker
            id={`mitigations.[${index}].timeRange.end`}
            name={`mitigations.[${index}].timeRange.end`}
            selected={values.mitigations[index].timeRange.end}
            onChange={handleTimeRangeEndChange}
            className="form-control"
            onBlur={handleBlur}
            minDate={values.mitigations[index].timeRange.begin}
            maxDate={
              !isLastItem ? values.mitigations[index + 1].timeRange.begin : null
            }
          />
          <ErrorMessage name={`mitigations.[${index}].timeRange.end`} />
        </div>
        <div className="col-md-2">
          <div className="input-group">
            <FastField
              id={`mitigations.[${index}].transmissionReduction`}
              name={`mitigations.[${index}].transmissionReduction`}
              type="text"
              className="form-control"
              disabled={true}
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
        <div className="col-md-3">
          {!isFirstItem && (
            <button
              type="button"
              className="btn btn-link"
              onClick={() => handleRemoveItemClick(index)}
            >
              Remove
            </button>
          )}
          {isLastItem && (
            <button
              type="button"
              className="btn btn-link"
              onClick={() =>
                arrayHelpers.push(
                  createInitialMitigation(
                    values.mitigations[index].timeRange.end,
                    index
                  )
                )
              }
            >
              Add new
            </button>
          )}
        </div>
      </div>

      <Modal
        isOpen={showCalculator}
        onCloseRequest={() => handleShowCalculatorClick(index)}
      >
        <MitigationCalculator
          measures={measures}
          serialInterval={serialInterval}
          onChange={(value) => {
            handleCalculatorChange(value);
            handleShowCalculatorClick(index);
          }}
        />
      </Modal>
    </>
  );
}

export default MitigationIntervalItem;
