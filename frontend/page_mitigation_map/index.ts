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
    [key: string]: { name: string; code: string; z: number };
  } = {};
  let _zmax = 3; // we want the max to start at 3
  let zmin = 0;

  function betaDataItemValid(item: {
    Name: string;
    iso_a2: string;
    iso_a3: string;
    Beta1: string;
  }) {
    return item["Beta1"] != "" && item["iso_a2"] != "" && item["iso_a3"] != "";
  }

  betaData = betaData.filter(betaDataItemValid);

  betaData.map(function(countryData: {
    Name: string;
    iso_a2: string;
    iso_a3: string;
    Beta1: string;
  }) {
    let effectiveReplicationNumber = parseFloat(countryData["Beta1"]) * 2;
    info_by_iso3[countryData[ISO_KEY]] = {
      name: countryData["Name"],
      code: countryData["iso_a2"],
      z: effectiveReplicationNumber
    };
    _zmax = Math.max(_zmax, effectiveReplicationNumber);
  });

  let offset = 0.00001;
  let tick_values = get_tick_values(_zmax, 0.5);
  let tick_names = tick_values.map(value_to_labels);

  let zmax = zmin + (_zmax - zmin) / (1 - offset);
  let value_for_missing = zmax + offset;

  const GREEN_RGB = "rgb(0,200,0)";
  const YELLOW_RGB = "rgb(255,255,0)";
  const RED_RGB = "rgb(255,0,0)";
  const VIOLET_RGB = "rgb(143,0,255)";

  let colorscale: Array<[number, string]> = [
    [0, GREEN_RGB],
    [1 / _zmax, GREEN_RGB],
    [1.5 / _zmax, YELLOW_RGB],
    [2 / _zmax, RED_RGB],
    [3 / _zmax, VIOLET_RGB],
    [1 - offset, VIOLET_RGB],
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
      item.z = info.z;

      item.text =
        `<b>${item.name}</b><br />` +
        "Estimations:<br />" +
        `Effective replication number: <b>${item.z}</b><br />`;

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
    name: "COVID-19: Effective replication number",
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
        text: "Effective replication number",
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
