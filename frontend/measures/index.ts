import { RegionDropdown } from "../region-dropdown";
import * as d3 from "d3";
import { CurrentChart } from "./current-chart";
import { setGetParamUrl } from "../helpers";
import { guessRegion } from "../tz_lookup";

const SELECTION_PARAM = "selection";
const REGION_FALLBACK = "united kingdom";

function getRegionUrl(region) {
  return setGetParamUrl(SELECTION_PARAM, region);
}

class Controller {
  dropdown: RegionDropdown;
  data: { base: any; measure: any };
  selected: string;
  currentChart: CurrentChart;

  constructor($container: HTMLElement, [baseData, measureData]: any) {
    this.dropdown = new RegionDropdown(
      document.getElementById("regionDropdown"),
      key => this.changeRegion(key)
    );

    this.currentChart = new CurrentChart($container);

    let urlString = window.location.href;
    let url = new URL(urlString);

    this.selected =
      url.searchParams.get(SELECTION_PARAM) ||
      guessRegion({ fallback: REGION_FALLBACK });

    this.data = { base: baseData, measure: measureData };

    // populate the dropdown menu with countries from received data
    Object.keys(baseData.regions).forEach(key =>
      this.dropdown.addRegionDropdown(
        key,
        getRegionUrl(key),
        baseData.regions[key].name
      )
    );

    this.dropdown.reorderDropdown();
    this.dropdown.restyleDropdownElements();

    // initialize the graph
    this.changeRegion(this.selected);
  }

  changeRegion(key: string): void {
    this.selected = key;
    let regionData = this.data.base.regions[key];
    let measureData = this.data.measure[regionData.iso_alpha_3];

    this.dropdown.update(key, regionData.name);

    this.currentChart.update(regionData, measureData);
  }
}

// graph
let $container: HTMLElement | undefined = document.getElementById(
  "current_viz"
);
if ($container) {
  let sources = [`data-main-v3.json`, `data-testing-containments.json`];

  // Load the basic data (estimates and graph URLs) for all generated countries
  Promise.all(
    sources.map(path =>
      d3.json(`https://storage.googleapis.com/static-covid/static/${path}`)
    )
  ).then(data => {
    new Controller($container, data);
  });
}
