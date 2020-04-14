import { RegionDropdown } from "../components/region-dropdown";
import * as d3 from "d3";
import { CurrentChart } from "./current-chart";
import { setGetParamUrl } from "../helpers";

const SELECTION_PARAM = "selection";
const REGION_FALLBACK = "united kingdom";

function getRegionUrl(region) {
  return setGetParamUrl(SELECTION_PARAM, region);
}

class Controller {
  dropdown: RegionDropdown;
  data: { base: any; measure: any; rates: any };
  selected: string;
  currentChart: CurrentChart;

  constructor(
    $dropdown: HTMLElement,
    $container: HTMLElement,
    baseData,
    measureData,
    ratesData
  ) {
    this.dropdown = new RegionDropdown($dropdown, key =>
      this.changeRegion(key)
    );

    this.currentChart = new CurrentChart($container);

    let urlString = window.location.href;
    let url = new URL(urlString);

    this.selected = url.searchParams.get(SELECTION_PARAM) || REGION_FALLBACK;

    this.data = {
      base: baseData,
      measure: measureData,
      rates: ratesData
    };

    // populate the dropdown menu with countries from received data
    Object.keys(baseData.regions).forEach(key =>
      this.dropdown.addRegionDropdown(
        key,
        getRegionUrl(key),
        baseData.regions[key].name
      )
    );

    this.dropdown.init();

    // initialize the graph
    this.changeRegion(this.selected);
  }

  changeRegion(key: string): void {
    this.selected = key;
    let regionData = this.data.base.regions[key];
    let measureData = this.data.measure[regionData.iso_alpha_3];
    let ratesData = this.data.rates[regionData.iso_alpha_3];

    this.dropdown.update(regionData);

    this.currentChart.update(regionData, measureData, ratesData);
  }
}

// graph
const $container = document.getElementById("current_viz");
const $dropdown = document.getElementById("regionDropdown");
if ($container && $dropdown) {
  let sources = [
    `data-main-v3.json`,
    `data-testing-containments.json`,
    `rates_by_iso3.json`
  ];

  // Load the basic data (estimates and graph URLs) for all generated countries
  Promise.all(
    sources.map(path =>
      d3.json(`https://storage.googleapis.com/static-covid/static/${path}`)
    )
  ).then(([baseData, containmentData, ratesData]) => {
    new Controller($dropdown, $container, baseData, containmentData, ratesData);
  });
}
