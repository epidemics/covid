import { ModelPage } from "./model_page";
import { RegionDropdown } from "../components/region-dropdown";
import { getTimezone, setGetParamUrl } from "../helpers";
import { Region, Regions } from "../models";
import { makeDataStore } from "../ds";

const SELECTION_PARAM = "selection";
const MITIGATION_PARAM = "mitigation";
const CHANNEL_PARAM = "channel";
const REGION_FALLBACK = "united kingdom";

type Options = {
  channel: string | null;
  region: string | null;
  mitigation: string | null;
};

class Controller {
  modelPage: ModelPage;
  dropdown: RegionDropdown;

  constructor(
    $dropdown: HTMLElement,
    $pageContainer: HTMLElement,
    private regions: Regions,
    params: Options
  ) {
    let mitigation = params.mitigation || "none";

    this.dropdown = new RegionDropdown($dropdown, key => {
      this.changeRegion(key, true);
    });

    // determines the users timezone
    let tz = getTimezone();

    // the region which has our timezone
    let tzRegion: Region | null = null;
    // populate the dropdown menu with countries from received data
    Object.keys(this.regions).forEach(key => {
      let region = this.regions[key];
      this.dropdown.addRegionDropdown(
        key,
        this.getRegionUrl(region),
        region.name
      );

      if (tz && region.timezones.indexOf(tz) !== -1) {
        tzRegion = region;
      }
    });

    // default region selection, start with the fallback
    let region: Region = this.regions[REGION_FALLBACK];
    if (params.region && params.region in this.regions) {
      // prefer a valid region from param (from url)
      region = this.regions[params.region];
    } else if (tzRegion) {
      // otherwise use the region infered from the timezone
      region = tzRegion;
    }

    this.dropdown.update(region);
    this.modelPage = new ModelPage($pageContainer, { mitigation, region });

    // initialize the select picker
    $('[data-toggle="tooltip"]').tooltip();

    $<HTMLInputElement>("#mitigation input[type=radio]").each(
      (_index: number, elem: HTMLInputElement): void | false => {
        if (elem.value === mitigation) {
          elem.checked = true;
          elem.parentElement?.classList.add("active");
        }

        elem.addEventListener("click", () => {
          this.modelPage.setMitigation(elem.value);
        });
      }
    );
  }

  getRegionUrl(region: Region) {
    return setGetParamUrl(SELECTION_PARAM, region.key);
  }

  // change the displayed region
  changeRegion(regionCode: string, pushState: boolean) {
    let region = this.regions[regionCode];

    if (!region) {
      region = this.regions[REGION_FALLBACK];
      pushState = false;
    }

    // change url
    if (history.pushState && pushState) {
      let path = this.getRegionUrl(region);
      window.history.pushState({ path }, "", path);
    }

    // update the dropdown
    this.dropdown.update(region);

    // update the grap
    if (this.modelPage) {
      this.modelPage.setRegion(region);
    }
  }
}

const $pageContainer = document.getElementById("my_dataviz");
const $dropdown = document.getElementById("regionDropdown");
if ($pageContainer && $dropdown) {
  let urlString = window.location.href;
  let url = new URL(urlString);
  let params = {
    channel: url.searchParams.get(CHANNEL_PARAM),
    region: url.searchParams.get(SELECTION_PARAM),
    mitigation: url.searchParams.get(MITIGATION_PARAM)
  };

  let channel = params.channel || DEFAULT_EPIFOR_CHANNEL;

  let data = makeDataStore(channel);

  data.regions.then(regions => {
    new Controller($dropdown, $pageContainer, regions, params);
  });
}
