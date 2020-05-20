import 'react-datepicker/dist/react-datepicker.css';

import { ErrorMessage, FastField, FieldArrayRenderProps, useFormikContext } from 'formik';
import * as React from 'react';
import DatePicker from 'react-datepicker';

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
  const { setFieldValue, values } = useFormikContext<Values>();

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
    setFieldValue(`mitigations.[${index}].transmissionReduction.begin`, value);
    setFieldValue(`mitigations.[${index}].transmissionReduction.end`, value);
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
        <div className="col-md-3">
          <DatePicker
            id={`mitigations.[${index}].date`}
            name={`mitigations.[${index}].date`}
            selected={values.mitigations[index].date}
            onChange={(date) =>
              setFieldValue(`mitigations.[${index}].date`, date)
            }
            className="form-control"
          />
        </div>
        <div className="col-md-3">
          <div className="input-group">
            <FastField
              id={`mitigations.[${index}].transmissionReduction.begin`}
              name={`mitigations.[${index}].transmissionReduction.begin`}
              type="text"
              className="form-control"
              disabled={true}
            />
            <FastField
              id={`mitigations.[${index}].transmissionReduction.end`}
              name={`mitigations.[${index}].transmissionReduction.end`}
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
              {showCalculator
                ? "Hide mitigation Calculator"
                : "Show mitigation Calculator"}
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
              onClick={() => arrayHelpers.push(createInitialMitigation())}
            >
              Add new
            </button>
          )}
        </div>
      </div>

      {showCalculator && (
        <MitigationCalculator
          measures={measures}
          serialInterval={serialInterval}
          onChange={(value) => {
            handleCalculatorChange(value);
          }}
        />
      )}
    </>
  );
}

export default MitigationIntervalItem;
