import { Field, Form, Formik } from 'formik';
import * as moment from 'moment';
import * as React from 'react';

import { scenarioNames } from '../data/url_generator';
import { Measure, MeasureGroup, measures } from './measures';
import MitigationSchema from './MitigationSchema';
import { MitigationTable } from './MitigationTable';

export const END_DATE_OFFSET = 7;

export type Values = {
  scenarioName: string;
  mitigations: {
    color: string;
    name: string;
    timeRange: {
      begin: Date;
      end: Date;
    };
    transmissionReduction: string;
    measures: (Measure | MeasureGroup)[];
  }[];
};

type Props = {
  onResult: (result: Values) => void;
};

export const createInitialMitigation = (
  date: Date = new Date(),
  index: number = -1
) => {
  const endDate = moment(date).add(END_DATE_OFFSET, "days").toDate();

  return {
    color: "#000",
    name: `#${index + 2}`,
    timeRange: {
      begin: date,
      end: endDate,
    },
    transmissionReduction: "82 %",
    measures,
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
                <label htmlFor="scenarioName">Select scenario</label>
                <Field
                  as="select"
                  id="scenarioName"
                  name="scenarioName"
                  className="form-control"
                >
                  {scenarioNames.map((scenarioName) => (
                    <option>{scenarioName}</option>
                  ))}
                </Field>
              </div>
            </div>
          </div>
          <MitigationTable mitigationIntervals={values.mitigations} />
          <button type="submit" className="btn btn-primary">
            Go to simulation
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default MitigationForm;
