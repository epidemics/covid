import { dotMultiply, add } from "mathjs";

import npi_model_raw from "./npi_model.json";

const npi_model = (npi_model_raw as unknown) as Record<string, Array<number>>;

function multiplyArrays(npis: Array<Array<number>>): Array<number> {
  if (npis.length === 1) return npis[0];
  let result = npis[0];
  npis.slice(1).forEach((npi) => {
    result = dotMultiply(result, npi) as number[];
  });
  return result;
}

//the values in the array are [name of measure, number of % above mean (or below if negative)
export function calculateMultiplied(
  measureActivations: Array<[string, number]>
): number[] | undefined {
  if (measureActivations.length === 0) return undefined;
  let npis: Array<Array<number>> = measureActivations.map(
    ([name, deviation]) => add(npi_model[name], deviation) as number[]
  );
  let multiplied = multiplyArrays(npis);
  return multiplied;
}
