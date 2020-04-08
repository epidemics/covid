import * as Plotly from "plotly.js";
import * as d3 from "d3";

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

      item.url_key = region.name.replace(" ", "+");
    } else {
      item.z = value_for_missing;
      item.text = `<b>${item.name}</b><br />` + "No estimation";
      item.url_key = null;
    }

    items.push(item);
  }

  let trace: Partial<Plotly.PlotData> = {
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
      y: 0,
      yanchor: "bottom",
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
  } as any;

  let layout = {
    title: {
      text: "COVID-19: Active infections estimate (fraction of population)",
      font: {
        color: "#E9E9E9",
        size: 25,
        family: "DM Sans"
      }
    },
    mapbox: {
      style: "carto-darkmatter"
    },
    paper_bgcolor: "#222028",
    geo: {
      showframe: false,
      showcoastlines: false
    }
  };

  Plotly.newPlot(caseMap, [trace], layout).then(gd => {
    gd.on("plotly_click", d => {
      let pt = (d.points || [])[0] as any;
      let url_key = pt.customdata;
      if (url_key) {
        window.open("/?selection=" + url_key);
      }
    });
  });
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
