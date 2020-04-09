import * as Plotly from "plotly.js";
import * as d3 from "d3";
import { isTouchDevice } from "./helpers";

const MAP_ID = "mapid";
const ISO_KEY = "iso_a3";

function makeMap(caseMap, baseData, geoData) {
  let regions = baseData.regions;

  function value_to_labels(v) {
    const x = Math.pow(2, v) * 1000;
    if (x >= 1000) {
      return (x / 1000).toString() + "k";
    }
    return x.toString();
  }

  let offset = 0.00001;
  let tick_values = [-3, -1, 1, 3, 5, 7, 9];
  let tick_names = tick_values.map(value_to_labels);

  let regionData_by_iso3 = {};
  let zmax = 2; // we want the max to start at 2
  let zmin = -3.5;

  // first we go over all the items
  Object.keys(regions).forEach(key => {
    let region = regions[key];
    let days = region.data.estimates.days;
    let sorted = Object.keys(days).sort();
    let last = sorted[sorted.length - 1];

    region.key = key;
    region.current_infected = days[last].FT_Infected;
    region.fraction_infected = region.current_infected / region.population;

    region.z = Math.log(region.fraction_infected * 1000) / Math.log(2);
    if (isNaN(region.z)) region.z = -Infinity;

    regionData_by_iso3[region.iso_alpha_3] = region;
    zmax = Math.max(zmax, region.z);
  });

  zmax = zmin + (zmax - zmin) / (1 - offset);
  let value_for_missing = zmax + offset;

  // this is a list of items that will later be
  let items = [];
  for (let key in geoData.features) {
    let country = geoData.features[key].properties;
    let iso3 = country[ISO_KEY];
    if (iso3 === "-99") continue;

    let item: any = {
      name: country.admin || country.name,
      iso3
    };

    let region = regionData_by_iso3[iso3];
    if (region) {
      item.z = region.z;

      let infected_per_1m = Math.round(
        region.fraction_infected * 1000000
      ).toLocaleString();
      let infected_total = Math.round(region.current_infected).toLocaleString();

      item.text =
        `<b>${item.name}</b><br />` +
        "Estimations:<br />" +
        `Infected per 1M: <b>${infected_per_1m}</b><br />` +
        `Infected total: <b>${infected_total}</b>`;

      item.url_key = region.key.replace(" ", "+");
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
    locations: items.map(thing => thing.iso3),
    z: items.map(thing => thing.z),
    zmax,
    zmin,
    text: items.map(thing => thing.text),
    colorscale: [
      [0, "rgb(255,255,0)"],
      [0.9, "rgb(255,0,0)"],
      [1 - offset, "rgb(200,0,0)"],
      [1, "rgb(70,70,70"]
    ],
    showscale: true,
    customdata: items.map(thing => thing.url_key),
    hovertemplate: "%{text}" + "<extra></extra>",
    hoverlabel: {
      font: {
        family: "DM Sans"
      }
    },
    colorbar: {
      thickness: 10,
      title: {
        text: "Infected per 1M",
        side: "right",
        font: {
          color: "#B5B5B5",
          family: "DM Sans"
        }
      },
      tickvals: tick_values,
      ticktext: tick_names,
      tickfont: {
        color: "#B5B5B5",
        family: "DM Sans"
      }
    }
  };

  if (isTouchDevice()) {
    // @ts-ignore
    mapData.colorbar.x = 0;
  }

  let layout: Partial<Plotly.Layout> = {
    margin: { l: 0, r: 0, b: 0, t: 0 },
    mapbox: {
      style: "carto-darkmatter"
    },
    paper_bgcolor: "#222028",
    geo: {
      showframe: false,
      showcoastlines: false
    }
  };

  let config: Partial<Plotly.Config> = {
    displaylogo: false,
    responsive: true,
    displayModeBar: false,
    modeBarButtonsToRemove: ["toImage", "resetScale2d", "autoScale2d"]
  };

  Plotly.newPlot(caseMap, [mapData], layout, config);

  if (isTouchDevice()) {
    $(".case-map-nav-action").text("Tap twice");

    let last: null | string = null;

    // @ts-ignore
    caseMap.on("plotly_click", d => {
      let pt = (d.points || [])[0] as any;
      let target = pt.customdata;
      if (target && last === target) {
        window.open("/?selection=" + target);
      }
      last = target;
    });
  } else {
    // @ts-ignore
    caseMap.on("plotly_click", d => {
      let pt = (d.points || [])[0] as any;
      let target = pt.customdata;
      if (target) {
        window.open("/?selection=" + pt.customdata["country_to_search"]);
      }
    });
  }
}

let sources = ["data-main-v3.json", "casemap-geo.json"];
let caseMap = document.getElementById(MAP_ID);
if (caseMap !== null) {
  Promise.all(
    sources.map(path =>
      d3.json(`https://storage.googleapis.com/static-covid/static/${path}`)
    )
  ).then(([baseData, geoData]) => {
    makeMap(caseMap, baseData, geoData);
  });
}
