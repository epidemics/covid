import 'react-datepicker/dist/react-datepicker.css';

import { FieldArray } from 'formik';
import * as React from 'react';

import MitigationIntervalItem from './MitigationIntervalItem';

export interface MitigationTableProps {
  mitigationIntervals: any[];
}

export function MitigationTable({ mitigationIntervals }: MitigationTableProps) {
  const [calculatorForIndex, setCalculatorForIndex] = React.useState<
    number | undefined
  >(undefined);

  return (
    <>
      <div className="form-row">
        <div className="col-md-3">Intervention name</div>
        <div className="col-md-3">Start date</div>
        <div className="col-md-2">R interval</div>
      </div>
      <FieldArray
        name="mitigations"
        render={(arrayHelpers) =>
          mitigationIntervals.map((_: any, index: number) => (
            <MitigationIntervalItem
              key={index}
              calculatorForIndex={calculatorForIndex}
              setCalculatorForIndex={setCalculatorForIndex}
              index={index}
              arrayHelpers={arrayHelpers}
            />
          ))
        }
      />
    </>
  );
}
