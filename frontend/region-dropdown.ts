import { string_score } from "./string_score";

export class RegionDropdown {
  $target: HTMLElement;

  $label: HTMLElement;
  $list: HTMLElement;
  $filter: HTMLInputElement;
  $dropdown: HTMLElement;

  list = [];
  focused: number = 0;
  active: string = "";
  filterQuery: string = "";

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
      $(this.$list).css("max-height", $(window).height() * 0.5);
    });

    jQuery($target).on("shown.bs.dropdown", () => {
      if (this.filterQuery !== "") {
        this.filterQuery = "";
        this.reorderDropdown();
      }

      // and focus the filter field
      this.$filter.focus();
    });

    this.$filter.addEventListener("keyup", () => {
      if (this.filterQuery === this.$filter.value) {
        // dont do anything if the query didnt change
        return;
      }

      this.filterQuery = this.$filter.value;
      if (this.filterQuery !== "") {
        // focus the first element in the list
        this.focused = 0;
      }

      this.reorderDropdown();
      this.restyleDropdownElements();
    });

    // listen on regionFilter events
    this.$filter.addEventListener("keydown", evt => {
      // on enter we select the currently highlighted entry
      if (evt.key === "Enter") {
        this.onChange(this.list[this.focused].key);
        $(this.$target).dropdown("toggle");
      } else if (evt.key === "ArrowUp") {
        this.focused = Math.max(this.focused - 1, 0);

        this.restyleDropdownElements();
      } else if (evt.key === "ArrowDown") {
        this.focused = Math.min(this.focused + 1, this.list.length - 1);

        this.restyleDropdownElements();
      }
    });
  }

  // make the dropdown entry
  addRegionDropdown(region_key, url, name) {
    const link = document.createElement("a");

    link.innerHTML = name;
    link.href = url;
    link.addEventListener("click", evt => {
      evt.preventDefault();

      // change the region
      this.onChange(region_key);
    });

    let item = { key: region_key, name, dropdownEntry: link };

    // add it to the dict and list
    this.list.push(item);
  }

  update(key: string, name: string) {
    if (this.active === key) {
      return;
    }

    this.$label.innerHTML = name;
    this.active = key;
    this.restyleDropdownElements();
  }

  // the dropdown items are restorted depending on a search query
  reorderDropdown() {
    // we score each region item with how good the region name matches the query
    this.list.forEach(region => {
      region.score = string_score(region.name, this.filterQuery);
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
  restyleDropdownElements() {
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
