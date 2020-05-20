import { Form, Formik } from 'formik';
import * as React from 'react';

import { MitigationTable } from './MitigationTable';

export type Values = {
  mitigations: {
    name: string;
    date: Date;
    transmissionReduction: {
      begin: number;
      end: number;
    };
  }[];
};

export const createInitialMitigation = () => ({
  name: "",
  date: new Date(),
  transmissionReduction: { begin: 0, end: 0 },
});

const MitigationForm = () => {
  const initialValues: Values = {
    mitigations: [createInitialMitigation()],
  };

  const validate = (values: Values) => {
    let errors: any = {};
    let mitigations = [] as any;

    values.mitigations.forEach((mitigation, index) => {
      if (mitigation.name.length === 0) {
        mitigations[index] = { name: "Intervention name is required" };
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
