import { v4 } from "../../common/spec";
import * as chroma from "chroma-js";

export type FeatureAggregation = v4.CountermeasureAggregation;

let scaleIndex = 0;
let scales = [
  chroma.scale(["#9ac9d9", "#007ca6"]),
  chroma.scale(["#edcdab", "#e97f0f"]),
];

export class MeasureFeature {
  public tags: Array<MeasureTag> = [];
  public scale = scales[scaleIndex++ % 2];

  constructor(
    public name: string,
    public category: string,
    public aggregation: FeatureAggregation
  ) {}
}

export class MeasureTag {
  constructor(
    public name: string,
    public description: string,
    public feature: MeasureFeature
  ) {
    feature.tags.push(this);
  }
}

export class MeasureInfo {
  list: Array<MeasureTag> = [];
  byTag: { [tag: string]: MeasureTag } = {};
  features: { [feature: string]: MeasureFeature } = {};

  constructor(obj: v4.CountermeasureTags) {
    Object.keys(obj).forEach((key) => {
      let tag = obj[key];
      let feature = this.getFeature(tag.feature, tag.aggregation, tag.category);
      let measureTag = new MeasureTag(tag.name, tag.description, feature);
      this.list.push(measureTag);
      this.byTag[tag.name] = measureTag;
    });
  }

  getFeature(name: string, aggregation: FeatureAggregation, category: string) {
    let feature = this.features[name];
    if (feature) {
      if (feature.aggregation != aggregation || feature.category != category) {
        console.error("Inconsistentcy in features: ", feature, {
          name,
          aggregation,
          category,
        });
      }

      return feature;
    } else {
      let feature = new MeasureFeature(name, category, aggregation);
      this.features[name] = feature;
      return feature;
    }
  }
}

export type MeasureItem = {
  start: string;
  end?: string;
  replaced?: string;
  label: string;
  measure: string;
  intensity: number;
  color: chroma.Color;
};
