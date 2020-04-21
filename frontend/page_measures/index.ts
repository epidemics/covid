import { RegionSelector } from "../components/RegionSelector";
import { CurrentChart } from "./current-chart";
import { setGetParamUrl, getTimezone } from "../helpers";
import { Regions, Region } from "../models";
import { makeDataStore } from "../ds";

const SELECTION_PARAM = "selection";
const REGION_FALLBACK = "united kingdom";

function getRegionUrl(region: Region) {
  return setGetParamUrl(SELECTION_PARAM, region.code);
}

class Controller {
  dropdown: RegionDropdown;
  regions: Regions;
  currentChart: CurrentChart;

  constructor(
    $dropdown: HTMLElement,
    $container: HTMLElement,
    regions: Regions,
    public measures: { [key: string]: any }
  ) {
    this.dropdown = new RegionDropdown($dropdown, region =>
      this.changeRegion(region)
    );

    this.currentChart = new CurrentChart($container);
    this.regions = regions;
    this.measures = measures;

    let urlString = window.location.href;
    let url = new URL(urlString);
    let selected_key = url.searchParams.get(SELECTION_PARAM);

    // determines the users timezone
    let tz = getTimezone();

    // the region which has our timezone
    let tzRegion: Region | null = null;
    // populate the dropdown menu with countries from received data
    Object.keys(regions).forEach(key => {
      let region = this.regions[key];
      this.dropdown.addRegionDropdown(key, getRegionUrl(region), region.name);

      if (tz && region.timezones.indexOf(tz) !== -1) {
        tzRegion = region;
      }
    });

    // default region selection, start with the fallback
    let region: Region = this.regions[REGION_FALLBACK];
    if (selected_key && selected_key in this.regions) {
      // prefer a valid region from param (from url)
      region = this.regions[selected_key];
    } else if (tzRegion) {
      // otherwise use the region infered from the timezone
      region = tzRegion;
    }

    // populate the dropdown menu with countries from received data
    Object.keys(regions).forEach(key => {
      let region = regions[key];
      this.dropdown.addRegionDropdown(key, getRegionUrl(region), region.name);
    });

    this.dropdown.init();

    // initialize the graph
    this.changeRegion(region);
  }

  changeRegion(region: Region): void {
    let measures = region.iso3 ? this.measures[region.iso3] : undefined;
    this.dropdown.update(region);
    this.currentChart.update(region, measures);
  }
}

// graph
const $container = document.getElementById("current_viz");
const $dropdown = document.getElementById("regionDropdown");

if ($container && $dropdown) {
  let data = makeDataStore();

  Promise.all([data.regions, data.containments]).then(
    ([regions, conainments]) => {
      new Controller($dropdown, $container, regions, conainments);
    }
  );
}
