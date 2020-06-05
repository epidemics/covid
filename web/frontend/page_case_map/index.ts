import * as Plotly from "plotly.js";
import { isTouchDevice } from "../helpers";
import { Regions, Region } from "../models";
import { makeDataStore } from "../ds";

const MAP_ID = "mapid";
const ISO_KEY = "iso_a3";

function makeMap(caseMap: HTMLElement, regions: Regions, geoData: any) {
  function value_to_labels(v: number) {
    const x = Math.pow(2, v) * 1000;
    if (x >= 1000) {
      return (x / 1000).toString() + "k";
    }
    return x.toString();
  }

  let offset = 0.00001;
  let tick_values = [-3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  let tick_names = tick_values.map(value_to_labels);

  let info_by_iso3: {
    [key: string]: { region: Region; z: number; current: number };
  } = {};
  let zmax = 2; // we want the max to start at 2
  let zmin = -3.5;

  // invert the binary tree
  regions.map((region) => {
    let current = region.current.infected;
    if (!current) return;

    if (region.population <= 1) {
      console.error("Illegal population for (will skip)", region);
      return;
    }

    let z = Math.log((current / region.population) * 1000) / Math.log(2);
    if (isNaN(z)) z = -Infinity;
    zmax = Math.max(zmax, z);

    if (region.iso3) info_by_iso3[region.iso3] = { current, z, region };
  });

  zmax = zmin + (zmax - zmin) / (1 - offset);
  let value_for_missing = zmax + offset;

  // this is a list of items that will later be putting into the plotly trace
  let items: Array<any> = [];
  for (let key in geoData.features) {
    let country = geoData.features[key].properties;
    let iso3 = country[ISO_KEY];
    if (iso3 === "-99") continue;

    let item: any = {
      name: country.admin || country.name,
      iso3,
    };

    let info = info_by_iso3[iso3];
    if (info) {
      item.z = info.z;

      let fraction_infected = info.current / info.region.population;

      let infected_per_1m = Math.round(
        fraction_infected * 1000000
      ).toLocaleString();
      let infected_total = Math.round(info.current).toLocaleString();
      item.text =
        `<b>${item.name}</b><br />` +
        "Estimations:<br />" +
        `Infected per 1M: <b>${infected_per_1m}</b><br />` +
        `Infected total: <b>${infected_total}</b>`;

      item.url_key = info.region.code;
    } else {
      item.z = value_for_missing;
      item.text = `<b>${item.name}</b><br />` + "No estimation";
      item.url_key = null;
    }

    items.push(item);
  }

  let mapData: Partial<Plotly.PlotData> = {
    // @ts-ignore
    type: "choroplethmapbox",
    name: "COVID-19: Active infections estimate",
    geojson: geoData,
    featureidkey: "properties." + ISO_KEY,
    locations: items.map((thing) => thing.iso3),
    z: items.map((thing) => thing.z),
    zmax,
    zmin,
    text: items.map((thing) => thing.text),
    colorscale: [
      [0, "rgb(255,255,0)"],
      [0.9, "rgb(255,0,0)"],
      [1 - offset, "rgb(200,0,0)"],
      [1, "rgb(70,70,70"],
    ],
    showscale: true,
    customdata: items.map((thing) => thing.url_key),
    hovertemplate: "%{text}" + "<extra></extra>",
    hoverlabel: {
      font: {
        family: "DM Sans",
      },
    },
    colorbar: {
      thickness: 10,
      title: {
        text: "Infected per 1M",
        side: "right",
        font: {
          color: "#B5B5B5",
          family: "DM Sans",
        },
      },
      tickvals: tick_values,
      ticktext: tick_names,
      tickfont: {
        color: "#B5B5B5",
        family: "DM Sans",
      },
    },
  };

  if (isTouchDevice()) {
    // @ts-ignore
    mapData.colorbar.x = 0;
  }

  let layout: Partial<Plotly.Layout> = {
    margin: { l: 0, r: 0, b: 0, t: 0 },
    mapbox: {
      style: "carto-darkmatter",
    },
    paper_bgcolor: "#222028",
    geo: {
      showframe: false,
      showcoastlines: false,
    },
  };

  let config: Partial<Plotly.Config> = {
    displaylogo: false,
    responsive: true,
    displayModeBar: false,
    modeBarButtonsToRemove: ["toImage", "resetScale2d", "autoScale2d"],
  };

  Plotly.newPlot(caseMap, [mapData], layout, config).then((gd) => {
    if (isTouchDevice()) {
      document
        .querySelectorAll(".case-map-nav-action")
        .forEach((elem) => (elem.innerHTML = "Tap twice"));

      let last: null | string = null;

      gd.on("plotly_click", (d) => {
        let pt = (d.points || [])[0] as any;
        let target = pt.customdata;
        if (target && last === target) {
          window.open("/?selection=" + target);
        }
        last = target;
      });
    } else {
      gd.on("plotly_click", (d) => {
        let pt = (d.points || [])[0] as any;
        let target = pt.customdata;
        if (target) {
          window.open("/?selection=" + target);
        }
      });
    }
  });
}

const caseMap = document.getElementById(MAP_ID);
if (caseMap) {
  let data = makeDataStore();
  Promise.all([data.regions, data.geoData]).then(([regions, geoData]) =>
    makeMap(caseMap, regions, geoData)
  );
}
