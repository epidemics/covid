import * as Plotly from "plotly.js";
import * as d3 from "d3";
import { isTouchDevice } from "../helpers";
import { makeDataStore } from "../ds";

const MAP_ID = "mapid";
const ISO_KEY = "iso_a3";

function makeMitigationMap(caseMap: HTMLElement, betaData: any, geoData: any) {
  function value_to_labels(v: number) {
    return v.toString();
  }

  function get_tick_values(zmax: number, step: number) {
    let res: Array<number> = [];
    let i = 0;
    while (i <= zmax) {
      res.push(i);
      i = i + step;
    }
    return res;
  }

  let info_by_iso3: {
    [key: string]: { name: string; code: string; beta1: number };
  } = {};
  let _zmax = 1; // we want the max to start at 1
  let zmin = 0;

  betaData = betaData.filter(
    x => x["Beta1"] != "" && x["iso_a2"] != "" && x[ISO_KEY] != ""
  );

  betaData.map(function(countryData) {
    info_by_iso3[countryData[ISO_KEY]] = {
      name: countryData["Name"],
      code: countryData["iso_a2"],
      beta1: parseFloat(countryData["Beta1"])
    };
    _zmax = Math.max(_zmax, parseFloat(countryData["Beta1"]));
  });

  let offset = 0.00001;
  let tick_values = get_tick_values(_zmax, 0.25);
  let tick_names = tick_values.map(value_to_labels);

  let zmax = zmin + (_zmax - zmin) / (1 - offset);
  let value_for_missing = zmax + offset;

  let colorscale: Array<[number, string]> = [
    [0, "rgb(0,153,0)"],
    [0.5 / _zmax, "rgb(0,153,0)"],
    [0.5 / _zmax, "rgb(255,255,0)"],
    [1 / _zmax, "rgb(255,255,0)"],
    [1 / _zmax, "rgb(255,0,0)"],
    [1.5 / _zmax, "rgb(255,0,0)"],
    [1.5 / _zmax, "rgb(255,0,255)"],
    [1 - offset, "rgb(255,0,255)"],
    [1, "rgb(70,70,70"]
  ];

  // this is a list of items that will later be putting into the plotly trace
  let items: Array<any> = [];
  for (let key in geoData.features) {
    let country = geoData.features[key].properties;
    let iso3 = country[ISO_KEY];
    if (iso3 === "-99") continue;

    let item: any = {
      name: country.admin || country.name,
      iso3
    };

    let info = info_by_iso3[iso3];
    if (info) {
      item.z = info.beta1;

      item.text =
        `<b>${item.name}</b><br />` +
        `Estimations of Beta: <b>${item.z}</b><br />`;

      item.url_key = info.code;
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
    name: "COVID-19: Beta",
    geojson: geoData,
    featureidkey: "properties." + ISO_KEY,
    locations: items.map(thing => thing.iso3),
    z: items.map(thing => thing.z),
    zmax,
    zmin,
    text: items.map(thing => thing.text),
    colorscale,
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
        text: "Beta",
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

  Plotly.newPlot(caseMap, [mapData], layout, config).then(gd => {
    if (isTouchDevice()) {
      $(".case-map-nav-action").text("Tap twice");

      let last: null | string = null;

      gd.on("plotly_click", d => {
        let pt = (d.points || [])[0] as any;
        let target = pt.customdata;
        if (target && last === target) {
          window.open("/?selection=" + target);
        }
        last = target;
      });
    } else {
      gd.on("plotly_click", d => {
        let pt = (d.points || [])[0] as any;
        let target = pt.customdata;
        if (target) {
          window.open("/?selection=" + target);
        }
      });
    }
  });
}

const mitigationMap = document.getElementById(MAP_ID);
if (mitigationMap) {
  let data = makeDataStore();
  Promise.all([
    d3.csv(
      "https://storage.googleapis.com/static-covid/static/estimates-JK-2020-04-15-with-iso.csv"
    ),
    data.geoData
  ]).then(([betaData, geoData]) =>
    makeMitigationMap(mitigationMap, betaData, geoData)
  );
}
