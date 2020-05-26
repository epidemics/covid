import "react-datepicker/dist/react-datepicker.css";

import { FieldArray } from "formik";
import * as React from "react";

import MitigationIntervalItem from "./MitigationIntervalItem";
import { createInitialMitigation } from "./MitigationForm";

export interface MitigationTableProps {
  mitigationIntervals: any[];
}

export function MitigationTable({ mitigationIntervals }: MitigationTableProps) {
  const [calculatorForIndex, setCalculatorForIndex] = React.useState<
    number | undefined
  >(undefined);

  return (
    <>
      <div className="form-row d-none d-md-flex">
        <div className="col-md-3">Period name</div>
        <div className="col-md-2">Begin date</div>
        <div className="col-md-4">R value reduction</div>
      </div>
      <FieldArray
        name="mitigations"
        render={(arrayHelpers) => (
          <>
            {mitigationIntervals.length === 0 && (
              <div className="mb-2">
                <button
                  type="button"
                  className="btn btn-link"
                  onClick={() => arrayHelpers.push(createInitialMitigation())}
                >
                  Add new
                </button>
              </div>
            )}
            {mitigationIntervals.map((_: any, index: number) => (
              <MitigationIntervalItem
                key={index}
                calculatorForIndex={calculatorForIndex}
                setCalculatorForIndex={setCalculatorForIndex}
                index={index}
                arrayHelpers={arrayHelpers}
              />
            ))}
          </>
        )}
      />
    </>
  );
}
