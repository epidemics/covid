import "react-datepicker/dist/react-datepicker.css";

import { FieldArray } from "formik";
import * as React from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

import { QuestionTooltip } from "../components/QuestionTooltip";
import AddIcon from "./../icons/add.svg";
import { createInitialMitigation } from "./MitigationForm";
import MitigationIntervalItem from "./MitigationIntervalItem";

export const MeasuresTooltip = () => {
  return (
    <OverlayTrigger
      placement="top"
      overlay={
        <Tooltip id="measures-tooltip">
          Click on the button to display the configuration of measures and the
          impact. Use checkboxes on the the left side to choose the measures in
          the intervention. The level of compliance corresponds to the defined
          impact the measures will have on the resulting R value reduction. You
          can choose one of the pre-defined compliance level (low, medium,
          high), or define custom compliance level using the sliders to
          configure the impact for the particular measures.
        </Tooltip>
      }
    >
      <span>
        <QuestionTooltip />
      </span>
    </OverlayTrigger>
  );
};

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
        <div className="col-md-2">Period name</div>
        <div className="col-md-2">
          Measures & impact <MeasuresTooltip />
        </div>
        <div className="col-md-2">Begin date</div>
        <div className="col-md-4">R value reduction</div>
      </div>
      <FieldArray
        name="mitigations"
        render={(arrayHelpers) => (
          <>
            {mitigationIntervals.length === 0 && (
              <div className="mb-2">
                <p>
                  <button
                    type="button"
                    className="btn btn-link p-0"
                    onClick={() => arrayHelpers.push(createInitialMitigation())}
                  >
                    <AddIcon />
                  </button>
                </p>
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
