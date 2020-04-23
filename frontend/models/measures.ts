import * as d3 from "d3";
import * as chroma from "chroma-js";
import { Region, Measure } from "./region";
import { MeasureInfo } from ".";
import { MeasureFeature, MeasureTag } from "./countermeasures";
import * as moment from "moment";

/*
type MeasureParser = (v: any) => { intensity: number; label: string } | null;

interface Measure {
  name: string;
  parser: MeasureParser;
  scale: chroma.Scale;
}

let measureTypes: { [key: string]: Measure } = {};
let measureKeys = Array<string>();

let i = 0;
let scales = [
  chroma.scale(["#9ac9d9", "#007ca6"]),
  chroma.scale(["#edcdab", "#e97f0f"]),
];

function registerMeasure(key: string, name: string, parser: MeasureParser) {
  let scale = scales[i++ % 2];
  measureTypes[key] = { name, parser, scale };
  measureKeys.push(key);
}

registerMeasure("mask-wearing", "Mask usage", (percent) => {
  if (percent <= 0.05) {
    return null;
  }

  return { intensity: percent, label: d3.format(".2p")(percent) };
});

registerMeasure("curfew", "Curfew", (v) => {
  if (v === "general") {
    return { intensity: 0.5, label: "General curfew" };
  } else if (v === "strict") {
    return { intensity: 1, label: "Strict curfew" };
  }

  return null;
});

registerMeasure("isolation", "Isolation", (v) => {
  if (v === "cases") {
    return { intensity: 0.5, label: "Symptomatic" };
  } else if (v === "contacts") {
    return { intensity: 1, label: "Contacts and symptomatic" };
  }

  return null;
});

registerMeasure("gatherings", "Gatherings", (count) => {
  if (count == 0) {
    return null;
  }

  let intensity: number;
  if (count >= 1000) {
    intensity = 0.1;
  } else if (count >= 500) {
    intensity = 0.25;
  } else if (count >= 100) {
    intensity = 0.5;
  } else if (count >= 10) {
    intensity = 0.75;
  } else {
    intensity = 1;
  }

  return { intensity, label: `No more than ${count}` };
});

registerMeasure("schools", "Schools", (v) => {
  if (v < 1) return null;

  return { intensity: v / 3, label: "" };
});

registerMeasure("social", "Social", (v) => {
  if (v === "stay-at-home") return { intensity: 1, label: "Stay at home" };
  else if (v === "distancing") return { intensity: 0.5, label: "Distancing" };

  return null;
});
*/

export type MeasureItem = {
  start: string;
  end?: string;
  replaced?: string;
  label: string;
  measure: string;
  intensity: number;
  color: chroma.Color;
};

type Thing = MeasureFeature & { measures: Array<Measure & MeasureTag> };

export function parseMeasures(
  measures: Array<Measure>,
  measureInfo: MeasureInfo
): { count: number; periods: Array<MeasureItem> } {
  let dict: { [key: string]: Thing } = {};
  let list: Array<Thing> = [];

  measures.forEach((measureRaw) => {
    let { tag } = measureRaw;
    let measure = { ...measureRaw, ...measureInfo.byTag[tag] };

    let thing = dict[measure.feature.name];
    if (!thing) {
      thing = { ...measure.feature, measures: [] };
      dict[measure.feature.name] = thing;
      list.push(thing);
    }

    thing.measures.push(measure);
  });

  let count = 0;
  let periods: Array<MeasureItem> = [];

  list.forEach((feature) => {
    if (feature.aggregation === "max") {
      feature.measures.sort(({ start_date: left }, { start_date: right }) => {
        if (left < right) {
          return -1;
        } else if (left > right) {
          return 1;
        }
        return 0;
      });

      const maxQuantity =
        feature.measures[feature.measures.length - 1].quantity;
      if (maxQuantity === undefined) {
        console.error(feature);
        throw new Error();
      }

      // let _hue = Math.round(Math.random() * 360);

      let scale = feature.scale;

      let item: MeasureItem | null = null;
      let category: Array<MeasureItem> = [];
      feature.measures.forEach((measure) => {
        let quantity = measure.quantity ?? 0;
        let date = measure.start_date;

        if (item) {
          item.replaced = date.toString();
          category.push(item);
        }

        let intensity = quantity / maxQuantity;
        item = {
          label: quantity.toString(),
          intensity,
          color: scale(intensity),
          measure: feature.name,
          start: date.toString(),
        };
      });

      if (item) {
        item!.replaced = "2021-01-01";
        category.push(item);
        count += 1;
      }

      periods.push(...category);
      for (let i = 0; i < category.length; i++) {
        let j = i;
        while (
          j < category.length - 1 &&
          category[j].intensity >= category[i].intensity
        ) {
          j += 1;
        }
        category[i].end = category[j].replaced;
      }

      console.log("category max", category, feature);
    }
  });

  console.log({ count, periods });

  return { count, periods };
}
