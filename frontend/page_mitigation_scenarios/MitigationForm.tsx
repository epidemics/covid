import { Field, Form, Formik } from "formik";
import * as React from "react";

import { scenarioNames } from "../data/url_generator";
import { Measure, MeasureGroup, measures } from "./measures";
import MitigationSchema from "./MitigationSchema";
import { MitigationTable } from "./MitigationTable";

export type Values = {
  scenarioName: string;
  mitigations: {
    color: string;
    name: string;
    timeRange: {
      begin: Date;
    };
    transmissionReduction: string;
    measures: (Measure | MeasureGroup)[];
    compliance: "low" | "medium" | "high";
  }[];
};

type Props = {
  onResult: (result: Values) => void;
};

export const createInitialMitigation = (
  date: Date = new Date(),
  index: number = -1
) => {
  return {
    color: "#000",
    name: `#${index + 2}`,
    timeRange: {
      begin: date,
    },
    transmissionReduction: "82 %",
    measures,
    compliance: "medium" as "medium",
  };
};

const MitigationForm: React.FC<Props> = ({ onResult }) => {
  const initialValues: Values = {
    scenarioName: scenarioNames.length > 1 ? scenarioNames[0] : "",
    mitigations: [createInitialMitigation()],
  };

  const handleSubmit = (values: Values) => {
    onResult(values);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={MitigationSchema}
      onSubmit={handleSubmit}
    >
      {({ values }) => (
        <Form>
          <div className="form-row mb-4">
            <div className="col-md-3">
              <div className="form-group">
                <label htmlFor="scenarioName">Select region</label>
                <Field
                  as="select"
                  id="scenarioName"
                  name="scenarioName"
                  className="form-control"
                >
                  {scenarioNames.map((scenarioName) => (
                    <option key={scenarioName}>{scenarioName}</option>
                  ))}
                </Field>
              </div>
            </div>
          </div>
          <MitigationTable mitigationIntervals={values.mitigations} />
          <button type="submit" className="btn btn-primary">
            Run simulation
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default MitigationForm;
