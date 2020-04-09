import * as d3 from "d3";
import * as chroma from "chroma-js";

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
  chroma.scale(["#edcdab", "#e97f0f"])
];

function registerMeasure(key: string, name: string, parser: MeasureParser) {
  let scale = scales[i++ % 2];
  measureTypes[key] = { name, parser, scale };
  measureKeys.push(key);
}

registerMeasure("mask-wearing", "Mask usage", percent => {
  if (percent <= 0.05) {
    return null;
  }

  return { intensity: percent, label: d3.format(".2p")(percent) };
});

registerMeasure("curfew", "Curfew", v => {
  if (v === "none") {
    return null;
  }

  if (v === "general") {
    return { intensity: 0.5, label: "General curfew" };
  } else if (v === "strict") {
    return { intensity: 1, label: "Strict curfew" };
  }
});

registerMeasure("isolation", "Isolation", v => {
  if (v === "none") {
    return null;
  }

  if (v === "cases") {
    return { intensity: 0.5, label: "Symptomatic" };
  } else if (v === "contacts") {
    return { intensity: 1, label: "Contacts and symptomatic" };
  }
});

registerMeasure("gatherings", "Gatherings", count => {
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

registerMeasure("schools", "Schools", v => {
  if (v < 1) return null;

  return { intensity: v / 3, label: "" };
});

registerMeasure("social", "Social", v => {
  if (v === "none") return null;

  if (v === "stay-at-home") return { intensity: 1, label: "Stay at home" };

  if (v === "distancing") return { intensity: 0.5, label: "Distancing" };
});

type MeasureItem = {
  start: string;
  end?: string;
  replaced?: string;
  label: string;
  measure: string;
  intensity: number;
  color: chroma.Color;
};

export function parseMeasures(
  measureData
): { count: number; periods: Array<MeasureItem> } {
  let count = 0;
  let periods: Array<MeasureItem> = [];
  measureKeys.forEach(key => {
    let hue = Math.round(Math.random() * 360);

    let { name, parser, scale } = measureTypes[key];
    let data = measureData[key];
    let category = [];

    let item: MeasureItem | null = null;
    data.forEach(({ date, value }) => {
      if (item) {
        item.replaced = date;
        category.push(item);
      }

      let tmp = parser(value);
      if (tmp) {
        let { intensity, label } = tmp;
        item = {
          label,
          intensity,
          color: scale(intensity),
          measure: name,
          start: date
        };
      }
    });

    if (item) {
      item.replaced = "2021-01-01";
      category.push(item as MeasureItem);
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
  });

  return { count, periods };
}
