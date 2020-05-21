import { Form, Formik } from 'formik';
import * as Moment from 'moment';
import * as React from 'react';

import { MitigationTable } from './MitigationTable';

export const END_DATE_OFFSET = 7;

export type Values = {
  mitigations: {
    name: string;
    timeRange: {
      begin: Date;
      end: Date;
    };
    transmissionReduction: {
      begin: number;
      end: number;
    };
  }[];
};

export const createInitialMitigation = (
  date: Date = new Date(),
  index: number = -1
) => {
  const endDate = Moment(date).add(END_DATE_OFFSET, "days").toDate();

  return {
    name: `#${index + 2}`,
    timeRange: {
      begin: date,
      end: endDate,
    },
    transmissionReduction: { begin: 0, end: 0 },
  };
};

const MitigationForm = () => {
  const initialValues: Values = {
    mitigations: [createInitialMitigation()],
  };

  const validate = (values: Values) => {
    let errors: any = {};
    let mitigations = [] as any;

    values.mitigations.forEach((mitigation, index) => {
      mitigations[index] = {};
      if (mitigation.name.length === 0) {
        mitigations[index].name = "Intervention name is required";
      }

      const momentBegin = Moment(mitigation.timeRange.begin);
      const momentEnd = Moment(mitigation.timeRange.end);

      if (momentBegin.isSameOrAfter(momentEnd)) {
        mitigations[index].timeRange = {
          begin: "Invalid interval",
          end: "Invalid interval",
        };
      }
    });

    errors.mitigations = mitigations;

    return errors;
  };

  return (
    <Formik
      initialValues={initialValues}
      validate={validate}
      onSubmit={(values) => {
        console.log(values);
      }}
    >
      {({ values }) => (
        <Form>
          <MitigationTable mitigationIntervals={values.mitigations} />
          <button type="submit" className="btn btn-primary">
            Calculate
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default MitigationForm;
