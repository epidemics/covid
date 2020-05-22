import { Form, Formik } from 'formik';
import * as moment from 'moment';
import * as React from 'react';

import { MitigationInterval } from '../data/url_generator';
import MitigationSchema from './MitigationSchema';
import { MitigationTable } from './MitigationTable';

export const END_DATE_OFFSET = 7;

export type Values = {
  mitigations: {
    color: string;
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

type Props = {
  onResult: (result: MitigationInterval[]) => void;
};

export const createInitialMitigation = (
  date: Date = new Date(),
  index: number = -1
) => {
  const endDate = moment(date).add(END_DATE_OFFSET, "days").toDate();

  return {
    color: "#fff",
    name: `#${index + 2}`,
    timeRange: {
      begin: date,
      end: endDate,
    },
    transmissionReduction: { begin: 13, end: 23 },
  };
};

const MitigationForm: React.FC<Props> = ({ onResult }) => {
  const initialValues: Values = {
    mitigations: [createInitialMitigation()],
  };

  const handleSubmit = (values: Values) => {
    onResult(values.mitigations);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={MitigationSchema}
      onSubmit={handleSubmit}
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
