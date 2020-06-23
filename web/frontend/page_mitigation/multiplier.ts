import npi_model_raw from "./npi_model.json";
import { dotMultiply, median } from "mathjs";

const npi_model = (npi_model_raw as unknown) as Record<string, Array<number>>;

function multiplyArrays(npis: Array<Array<number>>): Array<number> {
  if (npis.length === 1) return npis[0];
  let result = npis[0];
  npis.slice(1).forEach((npi) => {
    result = dotMultiply(result, npi) as number[];
  });
  return result;
}

export function calculateMultiplier(measureNames: Array<string>): number {
  let npis: Array<Array<number>> = measureNames.map((name) => npi_model[name]);
  let multiplied = multiplyArrays(npis);
  return median(multiplied);
}
