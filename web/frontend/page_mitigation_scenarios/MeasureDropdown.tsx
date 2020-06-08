import * as React from "react";
import {
  Measure,
  MeasureGroup,
  calculateLowCompliance,
  calculateHighCompliance,
  calculateMediumCompliance,
} from "./measures";
import { useFormikContext } from "formik";
import { Values } from "./MitigationForm";
import Dropdown from "react-bootstrap/Dropdown";

type SingleMeasureProps = {
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  subitem?: boolean;
};

const SingleMeasure = ({
  name,
  checked,
  onChange,
  subitem = false,
}: SingleMeasureProps) => {
  return (
    <div className={`dropdown-item checkbox-item ${subitem ? "pl-5" : ""}`}>
      <div className="form-check">
        <input
          type="checkbox"
          className="form-check-input"
          id={`${name}-check`}
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        <label className="form-check-label" htmlFor={`${name}-check`}>
          {name}
        </label>
      </div>
    </div>
  );
};

type GroupMeasureProps = {
  measureGroup: MeasureGroup;
  onChange: (checked: number) => void;
};

const GroupMeasure = ({ measureGroup, onChange }: GroupMeasureProps) => {
  const checkedCount = measureGroup.items.filter((item) => item.check).length;

  const handleSingleMeasureChange = (checked: boolean, index: number) => {
    onChange(checked ? index + 1 : index);
  };

  const handleGroupMeasureChange = (checked: boolean) => {
    onChange(checked ? measureGroup.items.length : 0);
  };

  return (
    <>
      <SingleMeasure
        name={measureGroup.name}
        checked={checkedCount === measureGroup.items.length}
        onChange={handleGroupMeasureChange}
      />
      {measureGroup.items.map((measure, index) => (
        <SingleMeasure
          name={measure.name}
          checked={measure.check !== 0}
          onChange={(checked) => handleSingleMeasureChange(checked, index)}
          subitem
        />
      ))}
    </>
  );
};

const changeMeasureOrMeasureGroup = (
  measureOrGroup: Measure | MeasureGroup,
  checked: number
) => {
  if ("items" in measureOrGroup) {
    const measureGroup = { ...measureOrGroup } as MeasureGroup;

    const newItems = measureGroup.items.map((item, index) => ({
      ...item,
      check: checked > index ? 1 : 0,
    }));

    measureGroup.items = newItems;

    return measureGroup;
  } else {
    const measure = { ...measureOrGroup } as Measure;
    measure.check = checked;

    return measure;
  }
};

const calculateMultiplier = (measures: (Measure | MeasureGroup)[]) => {
  let multiplier = 1;

  measures.forEach((measureOrGroup, i) => {
    if ("items" in measureOrGroup) {
      const measure = measureOrGroup as MeasureGroup;
      const checked = measure.items.filter((item) => item.check).length;
      const value = measure.items.map((item) => item.mean);
      multiplier = value
        .slice(0, checked)
        .reduce((prev, cur) => prev * cur, multiplier);
    } else {
      const measure = measureOrGroup as Measure;
      const checked = measure.check;

      if (checked > 0) {
        multiplier *= measure.mean;
      }
    }
  });

  return Math.abs(Math.round((multiplier - 1) * 100 * 10) / 10);
};

type Props = {
  intervalIndex: number;
  measures: Array<Measure | MeasureGroup>;
  compliance: "low" | "medium" | "high";
};

const MeasureDropdown = ({ measures, intervalIndex, compliance }: Props) => {
  const { setFieldValue } = useFormikContext<Values>();

  const handleChange = (checked: number, index: number) => {
    const newMeasures = [...measures];

    newMeasures[index] = changeMeasureOrMeasureGroup(
      newMeasures[index],
      checked
    );

    if (checked === 0) {
      newMeasures.forEach((measure, itemIndex) => {
        if ("implies" in measure && measure.implies) {
          let inconsistent = measure.implies.some(
            (target) => target.key === index && checked! < (target.value ?? 1)
          );

          if (inconsistent) {
            newMeasures[itemIndex] = changeMeasureOrMeasureGroup(
              newMeasures[itemIndex],
              0
            );
          }
        }
      });
    } else if (checked === 1) {
      let measure = measures[index];
      if ("implies" in measure && measure.implies) {
        measure.implies.forEach((target) => {
          newMeasures[target.key] = changeMeasureOrMeasureGroup(
            newMeasures[target.key],
            Math.max(0, target.value ?? 1)
          );
        });
      }
    }

    setFieldValue(`mitigations.[${intervalIndex}].measures`, newMeasures);
    setFieldValue(
      `mitigations.[${intervalIndex}].transmissionReduction`,
      `${Math.round(calculateMultiplier(newMeasures))} %`
    );
  };

  const handleComplianceClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let newMeasures: (Measure | MeasureGroup)[] = [];

    if (value === "low") {
      newMeasures = calculateLowCompliance(measures);
    }

    if (value === "high") {
      newMeasures = calculateHighCompliance(measures);
    }

    if (value === "medium") {
      newMeasures = calculateMediumCompliance(measures);
    }

    setFieldValue(
      `mitigations.[${intervalIndex}].transmissionReduction`,
      `${Math.round(calculateMultiplier(newMeasures))} %`
    );

    setFieldValue(`mitigations.[${intervalIndex}].measures`, newMeasures);

    setFieldValue(`mitigations.[${intervalIndex}].compliance`, value);
  };

  return (
    <Dropdown>
      <Dropdown.Toggle id="measures-dropdown" block>
        Select Measures
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {measures.map((measureOrGroup, index) => {
          if ("items" in measureOrGroup) {
            const groupMeasure = measureOrGroup as MeasureGroup;
            return (
              <GroupMeasure
                measureGroup={groupMeasure}
                onChange={(checked) => handleChange(checked, index)}
              />
            );
          } else {
            const measure = measureOrGroup as Measure;
            return (
              <SingleMeasure
                name={measure.name}
                checked={measure.check !== 0}
                onChange={(checked) => handleChange(checked ? 1 : 0, index)}
              />
            );
          }
        })}
        <div className="dropdown-divider"></div>
        <div className="px-4 py-2">
          <p>Compliance</p>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="inlineRadioOptions"
              id="low-compliance"
              value="low"
              checked={compliance === "low"}
              onChange={handleComplianceClick}
            />
            <label className="form-check-label" htmlFor="low-compliance">
              Low (20% lower effect)
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="inlineRadioOptions"
              id="medium-compliance"
              checked={compliance === "medium"}
              value="medium"
              onChange={handleComplianceClick}
            />
            <label className="form-check-label" htmlFor="medium-compliance">
              Medium
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="inlineRadioOptions"
              id="high-compliance"
              checked={compliance === "high"}
              value="high"
              onChange={handleComplianceClick}
            />
            <label className="form-check-label" htmlFor="high-compliance">
              High  (10% higher effect)
            </label>
          </div>
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default MeasureDropdown;
