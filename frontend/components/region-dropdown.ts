import { string_score } from "../string_score";
import * as d3 from "d3";
import { Region } from "../models";
import { formatSIInteger } from "../helpers";

const formatAbsoluteInteger = function(number) {
  if (typeof number !== "number" || isNaN(number)) {
    return "&mdash;";
  }
  number = Math.round(number);
  if (number < 10000 && number > -10000) {
    return String(number);
  } else {
    return number.toLocaleString();
  }
};

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];

const formatDate = (date: Date = new Date()) =>
  `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

type DropdownItem = {
  key: string;
  name: string;
  dropdownEntry: HTMLAnchorElement;
  score: number;
};

export class RegionDropdown {
  $target: HTMLElement;

  $label: HTMLElement;
  $list: HTMLElement;
  $filter: HTMLInputElement;

  list: Array<DropdownItem> = [];
  focused: number = 0;
  active: string = "";
  query: string | null = null;

  onChange: (key: string) => void;

  private find<T>(role): T {
    let query = `[data-dropdown='${role}']`;
    let result = $<any>(this.$target).find(query);
    if (result.length !== 1)
      throw new Error(`Region dropdown, could not find ${query}`);

    return result[0];
  }

  constructor($target: HTMLElement, onChange: (key: string) => void) {
    this.$target = $target;
    this.onChange = onChange;

    this.$list = this.find("list");
    this.$label = this.find("label");
    this.$filter = this.find("filter");

    // listen for dropdown trigger
    jQuery($target).on("show.bs.dropdown", () => {
      // clear the fitler value
      this.$filter.value = "";
      $(this.$list).css("max-height", ($(window).height() || 1600) * 0.5);

      if (this.query != "") this.setQuery("");
    });

    jQuery($target).on("shown.bs.dropdown", () => {
      if (this.query !== "") {
        this.query = "";
        this.reorder();
      }

      // and focus the filter field
      this.$filter.focus();
    });

    this.$filter.addEventListener("keyup", () => {
      if (this.query === this.$filter.value) {
        // dont do anything if the query didnt change
        return;
      }

      this.query = this.$filter.value;
      if (this.query !== "") {
        // focus the first element in the list
        this.focused = 0;
      }

      this.reorder();
      this.restyle();
    });

    // listen on regionFilter events
    this.$filter.addEventListener("keydown", evt => {
      // on enter we select the currently highlighted entry
      if (evt.key === "Enter") {
        this.onChange(this.list[this.focused].key);
        $(this.$target).dropdown("toggle");
      } else if (evt.key === "ArrowUp") {
        this.focused = Math.max(this.focused - 1, 0);

        this.restyle();
      } else if (evt.key === "ArrowDown") {
        this.focused = Math.min(this.focused + 1, this.list.length - 1);

        this.restyle();
      }
    });
  }

  // make the dropdown entry
  addRegionDropdown(region_key: string, url: string, name: string) {
    const link = document.createElement("a");

    link.innerHTML = name;
    link.href = url;
    link.addEventListener("click", evt => {
      evt.preventDefault();

      // change the region
      this.onChange(region_key);
    });

    let item = { key: region_key, name, dropdownEntry: link, score: 0 };

    // add it to the dict and list
    this.list.push(item);
  }

  init() {
    this.setQuery("");
  }

  setQuery(query: string) {
    if (this.query === query) return;

    this.query = query;
    // focus the first element in the list
    this.focused = 0;

    this.reorder();
    this.restyle();
  }

  update(region: Region) {
    if (this.active === region.key) {
      return;
    }

    this.$label.innerHTML = region.name;
    this.active = region.key;
    this.reorder();
    this.restyle();
    this.updateInfectionTotals(region);
  }

  updateInfectionTotals(region: Region) {
    const { population, reported } = region;
    if (!reported) return;

    let current = region.currentActiveInfected();
    if (current) {
      d3.select("#infections-date").html(`${formatDate()}`);
      d3.select("#infections-estimated").html(formatSIInteger(3)(current));
    } else {
      d3.select("#infections-date").html("");
      d3.select("#infections-estimated").html("&mdash;");
    }

    d3.select("#infections-confirmed").html(
      formatAbsoluteInteger(reported.last.confirmed)
    );
    /* Temporarily swithed off - we do not have confidence intervals for non-FT estimates
    d3.select("#infections-estimated-ci").html(
      `${formatInfectionTotal(
        infections["FT_Infected_q05"]
      )} - ${formatInfectionTotal(infections["FT_Infected_q95"])}`
    );
    */
    if (population)
      d3.select("#infections-population").html(
        formatAbsoluteInteger(population)
      );
  }

  // the dropdown items are restorted depending on a search query
  reorder() {
    // we score each region item with how good the region name matches the query
    this.list.forEach(region => {
      region.score = string_score(region.name, this.query ?? "");
    });

    // then we sort the list
    this.list.sort((a, b) => {
      // first by score
      if (a.score < b.score) {
        return 1;
      }
      if (a.score > b.score) {
        return -1;
      }
      // then alphabetically
      if (a.name > b.name) {
        return 1;
      }
      if (a.name < b.name) {
        return -1;
      }
      return 0;
    });

    let bestScore = this.list[0].score;
    for (let i = 0; i < this.list.length; i++) {
      let { score, dropdownEntry } = this.list[i];

      // re-add the entry, this sorts the dom elements
      this.$list.appendChild(dropdownEntry);

      // if we have good matches we only want to show those
      if (score < bestScore / 1000) {
        // correct the focus offset so it does not so something silly
        if (this.focused >= i) {
          this.focused = i - 1;
        }

        this.$list.removeChild(dropdownEntry);
        continue;
      }
    }
  }

  // update the look of the of the dropdown entries
  restyle() {
    this.list.forEach(({ key, dropdownEntry }, index) => {
      let className = "dropdown-item";

      // TODO maybe differentiate visually between 'current' and 'focused'
      if (key === this.active) {
        className += " active";
      }

      if (index === this.focused) {
        className += " active";

        // TODO something like this:
        // dropdownEntry.scrollIntoView(false);
      }

      dropdownEntry.className = className;
    });
  }
}

// populate the region dropdown label
// FIXME: this is kind of a hack and only looks nonsilly because the label is allcapsed
// this.$targetLabel.innerHTML = this.active;
