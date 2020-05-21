import * as Yup from 'yup';

const MitigationItemSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  timeRange: Yup.object().shape({
    begin: Yup.date().max(Yup.ref("end"), "Invalid interval"),
    end: Yup.date().min(Yup.ref("begin"), "Invalid interval"),
  }),
});

const MitigationSchema = Yup.object().shape({
  mitigations: Yup.array().of(MitigationItemSchema),
});

export default MitigationSchema;
