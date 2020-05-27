import * as Yup from "yup";

const MitigationItemSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
});

const MitigationSchema = Yup.object().shape({
  mitigations: Yup.array().of(MitigationItemSchema),
});

export default MitigationSchema;
